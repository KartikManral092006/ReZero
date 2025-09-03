import {db} from "../libs/db.js"

export const getAllSubmissions= async(req,res) => {
    try {
        const userId = req.user.id;
        const submission = await db.submission.findMany({
            where:{userId},
            include:{ problem:true},
            orderBy:{ createdAt:"desc"},
        })

        return res.status(200).json({
            submission,
            success:true,
            message:"Submissions fetched successfully",
        })
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({
            error:"Failed to fetch submissions",
        })
    }


}
export const getSubmissionByProblemId= async(req,res) => {
        try {
        const userId = req.user.id;
        const {problemId} = req.params.problemId
        const submission = await db.submission.findMany({
            where:{userId,problemId},
            include:{ problem:true,testCases:true},
            orderBy:{ createdAt:"desc"},
        })

        return res.status(200).json({
            submission,
            success:true,
            message:"Submissions fetched successfully",
        })
        } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({
            error:"Failed to fetch submissions",
        })
    }
}
export const getSubmissionsforProblemByProblemId= async(req,res) => {
    try {
        const {problemId} = req.params.problemId
        const submissionCount = await db.submission.count({
            where:{problemId},
        })

        return res.status(200).json({
            submissionCount,
            success:true,
            message:"Submissions count fetched successfully",
        })
    } catch (error) {
        console.error("Error fetching submissions count:", error);
        res.status(500).json({
            error:"Failed to fetch submissions count",
        })
    }
}
