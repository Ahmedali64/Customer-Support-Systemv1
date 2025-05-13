import "dotenv/config";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid"; 
import { user } from "../models/userModel.js"
import { generateTokens } from "../utils/genTokens.js";
import redis from "../config/redisConfig.js";
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
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
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
            const { accessToken, refreshToken } = await generateTokens(user);
            res.status(200).json({ message: "Login successful",  accessToken, refreshToken });
    }

    }catch(err){
        res.status(500).json({ message: "Server error", error: err.message });
    };
};
//logout
export const logout = async(req, res) => {
    try {
        // Handle session logout if exists
        if(req.session) {
            req.session.destroy(err => {
                if(err) {
                    return res.status(500).json({ 
                        message: "Failed to log out due to server error", 
                        error: err.message 
                    });
                }
                res.clearCookie("connect.sid", { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production" 
                });
            });
        }

        // Handle token invalidation if refreshToken is provided
        const { refreshToken } = req.body;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                await redis.del(decoded.id); // Remove refresh token from Redis
            } catch (err) {
                // Token is already invalid/expired
            }
        }

        res.status(200).json({ message: "Logout successful" });
    } catch(err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
// Token Refresh Endpoint
export const refreshToken = async(req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Check if token exists in Redis
        const storedToken = await redis.get(decoded.id);
        if (refreshToken !== storedToken) {
            return res.status(401).json({ message: "Invalid token" });
        };

        // Get user data and generate new access token
        const user = await user.findById(decoded.id);
        const { newAccessToken, newRefreshToken } = await generateTokens(user);
        res.json({ accessToken: newAccessToken,refreshToken:newRefreshToken });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};