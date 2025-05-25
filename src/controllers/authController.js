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
        const userData = await user.findByEmail(email);
        if (!userData) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (userData.role === "agent" ) {
            // save SESSION data for agents
            req.session.userId = userData.id;
            req.session.role = userData.role;
            return res.status(200).json({ message: "Agent logged in successfully" });
        }else if (userData.role === "admin") {
            // save SESSION data for agents
            req.session.userId = userData.id;
            req.session.role = userData.role;
            return res.status(200).json({ message: "Admin logged in successfully" });
        }else{
            //create token
            const { accessToken, refreshToken } = await generateTokens(userData);
            res.status(200).json({ message: "Login successful",  accessToken, refreshToken });
    }

    }catch(err){
        res.status(500).json({ message: "Server error", error: err.message });
    };
};
//logout
export const logout = async (req, res) => {
  try {
    // 1. Handle Session Logout (Agents/Admins)
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        res.clearCookie("connect.sid", { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === "production" 
        });
        
        return res.status(200).json({ message: "Logged out successfully" });
      });
      return; // Prevent further execution
    }

    // 2. Handle JWT Logout (Customers)
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await redis.del(decoded.id); // Remove refresh token
      } catch (err) {
        console.log("Refresh token error (likely expired):", err);
      }
    }

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Server error during logout:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Token Refresh Endpoint
export const refreshToken = async(req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "you must send a refresh token!" });

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Check if token exists in Redis
        const storedToken = await redis.get(decoded.id);
        if (refreshToken !== storedToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        };

        // Get user data and generate new access token
        const userData = await user.findById(decoded.id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        const { accessToken:newAccessToken, refreshToken:newRefreshToken } = await generateTokens(userData);
        res.status(200).json({ message:"Your new tokens", newAccessToken, newRefreshToken });
    } catch (err) {
        res.status(401).json({ message: "Invalid ref token" });
    }
};