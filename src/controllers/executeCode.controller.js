import { submitBatchToJudge0  , pollBatchResultsFromJudge0} from "../libs/judge0.lib.js";


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


        res.status(200).json({
            message:"Code executed successfully",
            results,
        })
    } catch (error) {
        console.error("Error executing code:", error);
        res.status(500).json({
            error:"Internal server error",
        })

    }
}
