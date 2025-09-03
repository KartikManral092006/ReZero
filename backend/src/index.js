import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoute from './routes/auth.routes.js';
import problemRoute from './routes/problem.routes.js'
import executionRoute from "./routes/executeCode.routes.js"
import submissionRoute from './routes/submission.routes.js';
import playlistRoute from './routes/playlist.routes.js';


dotenv.config();


const app = express();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

app.use(express.json())
app.use(cookieParser())



app.get('/',(req,res)=>{
    res.send("Welcome To ReZero ");
})

app.use('/api/v1/auth' , authRoute);
app.use('/api/v1/problems' ,problemRoute);
app.use("/api/v1/execute-code" , executionRoute);
app.use('/api/v1/submissions',submissionRoute);
app.use('/api/v1/playlist',playlistRoute);


app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
