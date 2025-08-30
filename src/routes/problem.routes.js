import express from 'express';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createProblem , getAllProblems ,updateProblem ,getProblemById ,deleteProblem ,getAllProblemsSolvedByUser } from '../controllers/problem.controller.js'



const problemRoute = express.Router();

problemRoute.post('/create-problem', authMiddleware ,checkAdmin, createProblem);

problemRoute.get('/get-all-problems', authMiddleware, getAllProblems);

problemRoute.get('/get-problem/:id', authMiddleware, getProblemById);

problemRoute.put('/update-problem/:id', authMiddleware, checkAdmin, updateProblem);

problemRoute.delete('/delete-problem/:id', authMiddleware, checkAdmin, deleteProblem);

problemRoute.get('/get-solved-problems', authMiddleware, getAllProblemsSolvedByUser);

export default problemRoute;
