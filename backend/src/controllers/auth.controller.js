import bcrypt from 'bcryptjs';
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken"


export const register = async (req, res) =>{
    const {email,password ,name} = req.body;
    try {

        const existingUser = await db.user.findUnique({
            where:{
                email
            }
        })
        // Check is there is existing user in the database
        if(existingUser){
            return res.status(400).json({
                error: "User Already Exist",
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await db.user.create({
            data:{
                email,
                password:hashedPassword,
                name,
                role :UserRole.USER
            }
        })

        // generating a jwt token for the newUser
        const token = jwt.sign({
            id:newUser.id
        },process.env.JWT_SECRET,
    {expiresIn:'7d'})

        // storing the generated token in a cookie
        res.cookie("jwt", token , {
            httpOnly:true,
            sameSite: "lax",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000 * 60 * 60 * 24 * 7 // 7days
        })


         res.status(200).json({
            message:"User created Successfully",
            user:{
                id:newUser.id,
                email:newUser.email,
                name:newUser.name,
                role:newUser.role,
                image:newUser.image
            }
        })
    } catch (error) {
        console.error("Error in register controller", error);
        res.status(500).json({
            error:"Internal Server Error"
        })
    }
}


export const login = async (req, res) =>{
    const {email,password} =  req.body;
    try {
        const user = await db.user.findUnique({
            where:{
                email
            }
        })
        if(!user){
            return res.status(400).json({
                error:"Invalid Credentials"
            })
        }

        //comparing the pawword with the user entered password
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                error:"Invalid Credentials"
            })
        }

        // generating a token for the user who is logging in
        const token = jwt.sign({
            id :user.id,
        },process.env.JWT_SECRET,
        {expiresIn:'7d'})

        // storing the generated token in a cookie
        res.cookie("jwt", token , {
            httpOnly:true,
            sameSite: "lax",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000 * 60 * 60 * 24 * 7 // 7days
        })
        res.status(200).json({
            success:true,
            message:"Login Successful",
            user:{
                id:user.id,
                email:user.email,
                name:user.name,
                role:user.role,
                image:user.image
            }
        })
    } catch (error) {
        console.error("Error in login controller", error);
        res.status(500).json({
            error:"Error Logging in User"
        })
    }

}

export const logout = async (req, res) =>{
    try {
        res.clearCookie("jwt",{
            httpOnly:true,
            sameSite: "lax",
            secure:process.env.NODE_ENV !== "development",
        })
        res.status(200).json({
            success:true,
            message:"Logout Successful"
        })
    } catch (error) {
        console.error("Error in logout controller", error);
        res.status(500).json({
            error:"Error Logging out User"
        })
    }

}

export const check = async (req, res) =>{
    try {
        res.status(200).json({
            success:true,
            message:"Authnentication Succesfull",
            user:req.user

        })
    } catch (error) {
        console.error("Error in check controller", error);
        res.status(500).json({
            error:"Error Checking User"
        })
    }
}
