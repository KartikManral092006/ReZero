import jwt from "jsonwebtoken";
import {db} from "../libs/db.js";


export const authMiddleware = async (req, res, next) => {
   try {
     const token = req.cookies.jwt;
     if(!token){
         return res.status(401).json({
             error:"Unauthorized Access - No Token Provided",
             success:false
         })
     }

     let decoded ;
     try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
     } catch (error) {
        return res.status(401).json({
            success:false,
            error:"Unauthorized Access - Invalid Token",
        })
     }


     const user = await db.user.findUnique({
        where:{
            id:decoded.id
        },
        select:{
            id:true,
            name:true,
            email:true,
            role:true,
            image:true
        }
     })
     if(!user){
        return res.srtatus(404).json({
            message:"User ot Found!",
        })
     }

     req.user = user;
     next();
   } catch (error) {
    console.error("Error in auth middleware", error);
    res.status(500).json({
        error:"Error Authenticating User",
    })
   }
}


export const checkAdmin = async(req,res,next)=>{
    try {
        const userid = req.user.id;
        const user = await db.user.findUnique({
            where:{
                id:userid
            },
            select:{
                role:true
            }
        })
        if(!user || user.role !== "ADMIN"){
            return res.status(403).json({
                error:"Access Denied - You dont have the required permissions",
                success:false
            })
        }
        next();
    } catch (error) {
        console.error("Error in admin middleware", error);
        res.status(500).json({
            error:"Error Authenticating Admin User",
        })
    }
}
