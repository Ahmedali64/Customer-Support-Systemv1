import "dotenv/config";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid"; 
import {user} from "../utils/userHelper.js"
//Register
export const register = async(req,res) => {
    try{
        const {name , email , password, role  } = req.body;
        if(await user.findByEmail(email)){
            return res.status(400).json({ message: "User already exists" });
        };

        const hashedPassword = await bcrypt.hash(password , 10);
        const userData = {
            id: uuidv4(),
            name,
            email,
            password:hashedPassword,
            role
        };
        const user_inThe_DataBase=await user.create(userData);
        res.status(201).json({ message: "User registered successfully", user_inThe_DataBase });
    }catch(err){
        res.status(500).json({ message: "Server error", err: err.message });
    };
};
//login
export const login = async(req,res) => {
    try{
        const {email , password} = req.body;
        const user = await user.findByEmail(email);
        const isMatch = await bcrypt.compare(password, user.password);
        if(!user || !isMatch){
            return res.status(400).json({ message: "Invalid credentials" });
        };

        if (user.role === "agent" ) {
            // save SESSION data for agents
            req.session.userId = user.id;
            req.session.role = user.role;
            return res.status(200).json({ message: "Agent logged in successfully" });
        }else if (user.role === "admin") {
            // save SESSION data for agents
            req.session.userId = user.id;
            req.session.role = user.role;
            return res.status(200).json({ message: "Admin logged in successfully" });
        }else{
            //create token
            const token = jwt.sign({ id: user.id ,role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            res.status(200).json({ message: "Login successful", token });
    }

    }catch(err){
        res.status(500).json({ message: "Server error", error: err.message });
    };
};
//logout
export const logout = async() => {
    if(req.session){
        try{
            const agentId = req.session.userId; // Get the agent ID from the session
            if (req.session.role === "agent") {
                // Remove the agent from the queue
                await removeAgentFromQueue(agentId);
            };
            //destroy session
            req.session.destroy(err => {
                if(err){
                    return res.status(500).json({ message: "Failed to log out due to server error", error: err.message });
                };
                //connect.sid is coockie that has the session id 
                res.clearCookie("connect.sid", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
                res.status(200).json({ message: "Logout successful" });
            });
        }catch(err){
            res.status(500).json({ message: "Server error", error: err.message });
        }
    }
    else{
        res.status(200).json({ message: "Logged out successfully" });
    }
};