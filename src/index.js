import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.routes.js';
import problemRoute from './routes/problem.routes.js'
import executionRoute from "./routes/executeCode.routes.js"


dotenv.config();


const app = express();

app.use(express.json())
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.send("Welcome To REZero ");
})

app.use('/api/v1/auth' , authRoute);
app.use('/api/v1/problems' ,problemRoute);
app.use("/api/v1/execute-code" , executionRoute);

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
