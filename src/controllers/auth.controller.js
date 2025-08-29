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
            res.status(400).json({
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
            sameSite: "strict",
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


}

export const logout = async (req, res) =>{}

export const check = async (req, res) =>{}
