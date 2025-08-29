import express from 'express';
import{register , login,logout, check} from "../controllers/auth.controller.js"


const authRoute = express.Router();


authRoute.post('/register',register);

authRoute.post('/login',login);

authRoute.post('/logout',logout);

authRoute.post('/check',check);



export default authRoute;
