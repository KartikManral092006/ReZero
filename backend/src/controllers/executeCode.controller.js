import {db} from "../libs/db.js"
import { submitBatchToJudge0  , pollBatchResultsFromJudge0,getLanguageName} from "../libs/judge0.lib.js";


export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs , problemId} = req.body;
        const userId = req.user.id;

        if(
            !Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) ||
             expected_outputs.length === 0 || stdin.length !== expected_outputs.length
            ){
            return res.status(400).json({
                error:"Missing testcases",
            })
        }

        //prepare submissions for judge0
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin:input,
        }));

        // Send batch submissions to Judge0
        const submitResponse = await submitBatchToJudge0(submissions);
        const tokens = submitResponse.map((res) => res.token);
        const results = await pollBatchResultsFromJudge0(tokens);
        console.log("Judge0 Execution Results:", results);


            // Compare results with expected outputs
            let allPassed = true;
            const detailedResults = results.map((result, i) => {
                const stdout = result.stdout?.trim();
                const expected_output = expected_outputs[i]?.trim();
                const passed = stdout === expected_output


                // For debugging purposes
                console.log(`testcase #${i+1}`);
                console.log("Input:", stdin[i]);
                console.log("Expected Output:", expected_output);
                console.log("Actual Output:", stdout);
                console.log("Passed:", passed);
                console.log("-----------------------");

                // If any test case fails, mark allPassed as false
                if(!passed) allPassed = false;

                // Return detailed result for each test case
                return {
                    testcase:i+1,
                    passed,
                    stdout,
                    expected_output: expected_output,
                    stderr: result.stderr || null,
                    compile_output: result.compile_output || null,
                    status: result.status.description,
                    time: result.time ? `${result.time} sec` : undefined,
                    memory: result.memory ? `${result.memory} KB` : undefined,
                }
            })

            console.log(detailedResults);

            //  storing the submission result to your database along with userId and problemId

            const submission = await db.submission.create({
                data:{
                    userId,
                    problemId,
                    sourceCode :source_code,
                    language : getLanguageName(language_id),
                    stdin:stdin.join("\n"),
                    stdout:JSON.stringify(detailedResults.map(r => r.stdout)),
                    stderr:detailedResults.some(r => r.stderr)? JSON.stringify(detailedResults.map(r => r.stderr)):null,
                    compiledOutput:detailedResults.some(r => r.compile_output)? JSON.stringify(detailedResults.map(r => r.compile_output)):null,
                    status:  allPassed ? "Accepted" : "Wrong Answer",
                    memory:detailedResults.some((r)=>r.memory) ? JSON.stringify(detailedResults.map(r => r.memory)):null,
                    time:detailedResults.some((r)=>r.time) ? JSON.stringify(detailedResults.map(r => r.time)):null,
                }
            });

            // if Allpassed is true, update the user's solvedProblems list to true
            if(allPassed){
                await db.ProblemSolved.upsert({
                    where:{
                        userId_problemId:{
                            userId,
                            problemId,
                }
            },
            update:{},
            create:{
                userId,
                problemId,
            }
        })
            }

            // Save invividual test case results using detailedResults array
            const testCaseResults = detailedResults.map((result) => ({
                submissionId: submission.id,
               testCase: result.testcase,
               passed: result.passed,
               stdout: result.stdout,
               expectedOutput: result.expected_output,
               stderr: result.stderr,
               compileOutput: result.compile_output,
               status: result.status,
               time: result.time,
               memory: result.memory,
            }))

            // test case results individualy to testCaseResult table
            await db.testcaseresult.createMany({
                data:testCaseResults,
            })

            // Fetch the submission along with its test case results to return in the response
            const submissionWithTestcases = await db.submission.findUnique({
                where:{id:submission.id},
                include:{ testCases:true},
            })


        res.status(200).json({
            sucess:true,
            message:"Code executed successfully",
            submission:submissionWithTestcases,
        })
    } catch (error) {
        console.error("Error executing code:", error);
        res.status(500).json({
            error:"Failed to execute code",
        })

    }
}
