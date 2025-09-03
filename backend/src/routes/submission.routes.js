import express from 'express';
import { authMiddleware } from "../middleware/auth.middleware.js"
import { getAllSubmissions , getSubmissionByProblemId , getSubmissionsforProblemByProblemId} from "../controllers/submission.controller.js"

const submissionRoute = express.Router();

submissionRoute.get('/get-all-submissions',authMiddleware,getAllSubmissions);
submissionRoute.get('/get-submission/:problemId',authMiddleware,getSubmissionByProblemId);
submissionRoute.get('/get-submissions-count/:problemId',authMiddleware,getSubmissionsforProblemByProblemId);



export default submissionRoute;
