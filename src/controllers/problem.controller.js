import {db} from "../libs/db.js";
import { getJudge0languageId, pollBatchResultsFromJudge0, submitbatchToJudge0 } from "../libs/judge0.lib.js"



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

                    // On the bases of the  testcases and reference solutions we will be submitting the code to judge0 api
                    // and getting the results back from judge0 api
                    // in the form of tokens in submissionresults and then we will be storing those tokens in our database
                    const submissionResults = await submitbatchToJudge0(submissions);

                    const tokens = submissionResults.map((res)=>res.token);

                    const results = await pollBatchResultsFromJudge0(tokens);

                    for(let i =0 ; i < results.length ; i++){
                        const result = results[i];

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

}

export const getProblemById = async (req, res) => {

}

export const updateProblem = async (req, res) => {

}

export const deleteProblem = async (req, res) => {

}

export const getAllProblemsSolvedByUser = async (req, res) => {

}
