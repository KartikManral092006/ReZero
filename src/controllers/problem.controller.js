import {db} from "../libs/db.js";
import { getJudge0languageId, pollBatchResultsFromJudge0, submitBatchToJudge0 } from "../libs/judge0.lib.js"



export const createProblem = async (req, res) => {
        // getting all the data from req body
            const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, hints, editorials} =req.body ;

        // Check the user role once again
            if(req.user.role !== "ADMIN"){
                return res.status(403).json({
                    error:"You are not allowed to create a problem",
                })
            }

            try {

                for(const[language,solutionCode] of Object.entries(referenceSolutions)){
                    const languageId = getJudge0languageId(language);

                    if(!languageId){
                        return res.status(400).json({
                            error:`Language ${language} is not supported`,
                        })
                    }
                    const submissions = testcases.map(({input,output})=>({
                        source_code:solutionCode,
                        language_id:languageId,
                        stdin:input,
                        expected_output:output,
                    }))

                    console.log("Submissions to be sent to Judge0:", submissions);

                    // On the bases of the  testcases and reference solutions we will be submitting the code to judge0 api
                    // and getting the results back from judge0 api
                    // in the form of tokens in submissionresults and then we will be storing those tokens in our database
                    const submissionResults = await submitBatchToJudge0(submissions);

                    const tokens = submissionResults.map((res)=>res.token);

                    const results = await pollBatchResultsFromJudge0(tokens);

                    for(let i =0 ; i < results.length ; i++){

                        const result = results[i];
                         console.log(`Debug Judge0 Result for Testcase ${i + 1}, Language ${language}:`, JSON.stringify(result, null, 2));

                        if(result.status.id !==3){
                            return res.status(400).json({
                                error:`Testcase ${i+1} failed for language ${language}`,
                            })
                        }
                    }
                }


                // Save the problem to the database
                        const newProblem = await db.problem.create({
                            data:{
                                title,
                                description,
                                difficulty,
                                tags,
                                examples,
                                constraints,
                                hints,
                                editorials,
                                testcases,
                                referenceSolutions,
                                codeSnippets,
                                userId:req.user.id
                            }
                        })

                        return res.status(200).json({
                            success:true,
                            message:"Problem created successfully",
                            problem:newProblem
                        })
            } catch (error) {
                console.error("Error in create problem controller", error);
                res.status(500).json({
                    error:"Problen cannot be created due to internal server error",
                })
            }

}

export const getAllProblems = async (req, res) => {
    try {
        const problems =await db.problem.findMany();

        if(!problems ){
            return res.status(404).json({
                error:"No problems found",
            })
        }

        res.status(200).json({
            success:true,
            message:"Problems fetched successfully",
            problems
        })
    } catch (error) {
        console.error("Error in get all problems controller", error);
        res.status(500).json({
            error:"Problems cannot be fetched",
        })
    }
}

export const getProblemById = async (req, res) => {
    const {id} = req.params;

    try {
        const problem = await db.problem.findUnique({
            where:{
                id:id
            }
        })
        if(!problem){
            return res.status(404).json({
                error:"Problem not found",
            })
        }

        res.status(200).json({
            success:true,
            message:"Problem fetched successfully",
            problem
        })

} catch (error) {
        console.error("Eror in getting problem by id controller " ,error);
        res.status(500).json({
            error:"Problem cannot be fetched due to internal server error",
        })
    }

}

export const updateProblem = async (req, res) => {
    // fetching the id of the problem to be updated
    const {id} = req.params;

    // getting all the data from req body
    const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, hints, editorials} =req.body ;

    // Check the user role once again
    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            error:"You are not allowed to update a problem",
        })
    }

    try {
        // finding the problem by id in the database and if found then updating it
        const problem = await db.problem.findUnique({
            where:{
                id
            }
        })

        if(!problem){
            return res.status(404).json({
                error:"Problem not found",
            })
        }

        const updatedProblem = await db.problem.update({
            where:{
                id
            },
            data:{
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                hints,
                editorials,
                testcases,
                referenceSolutions,
                codeSnippets,
            }
        })

        res.status(200).json({
            success:true,
            message:"Problem updated successfully",
            problem:updatedProblem
        })

    } catch (error) {
        console.error("Error in update problem controller", error);
        res.status(500).json({
            error:"Problem cannot be updated due to internal server error",
        })
    }
}

export const deleteProblem = async (req, res) => {
    const {id} = req.params;

    // Check the user role once again
    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            error:"You are not allowed to delete a problem",
        })
    }
    try {
        const problem = await db.problem.findUnique({
            where:{
                id
            }
        })
        if(!problem){
            return res.status(404).json({
                error:"Problem not found",
            })
        }

        await db.problem.delete({
            where:{
                id
            }
        })

        res.status(200).json({
            success:true,
            message:"Problem deleted successfully",
        })
}
    catch (error) {
        console.error("Error in delete problem controller", error);
        res.status(500).json({
            error:"Problem cannot be deleted due to internal server error",
        })
    }
}

export const getAllProblemsSolvedByUser = async (req, res) => {
    const userId = req.user.id;

    try {
        const submissions = await db.submission.findMany({
            where:{
                userId,
                status:"ACCEPTED"
            },
            include:{
                problem:true
            }
        })

        const solvedProblems = submissions.map((submission)=>submission.problem);

        res.status(200).json({
            success:true,
            message:"Solved problems fetched successfully",
            problems:solvedProblems
        })

    } catch (error) {
        console.error("Error in get all problems solved by user controller", error);
        res.status(500).json({
            error:"Solved problems cannot be fetched due to internal server error",
        })
    }
}
