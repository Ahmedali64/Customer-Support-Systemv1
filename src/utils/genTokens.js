import jwt from 'jsonwebtoken';
import "dotenv/config";
import redis from "../config/redisConfig.js";

// Generate tokens
export const generateTokens = async(user) => {

    const accessToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Short-lived
    );
  
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' } // Long-lived
    );
  
    // Store refresh token in Redis (key: user.id, value: refreshToken)
    await redis.set(user.id, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days TTL
    
    return { accessToken, refreshToken };
  };
  