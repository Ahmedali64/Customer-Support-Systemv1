import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { logger } from "./src/config/logger.js";
import mongooseConnection from "./src/config/mongooseConnection.js";
import knexConnection from "./src/config/knexConnection.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import Redis from "ioredis";
import { RedisStore } from "connect-redis";
import session from "express-session";
dotenv.config();
const app = express();


//middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));

//connect to database
mongooseConnection();
knexConnection();

//sesssion
const redisClient = new Redis(process.env.REDIS_URL);
const store = new RedisStore({ client: redisClient });
app.use(
    session({
      store: store,//use redis client for session store
      secret: process.env.SESSION_SECRET, // Use a secure secret key
      resave: false, // Prevents session from being saved back to the store if it wasn't modified
      saveUninitialized: false, // Prevents saving uninitialized sessions
      cookie: {
        sameSite: 'strict', // Helps prevent CSRF attacks
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production" || false , // Use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
      },
    })
  );
  
//routes
app.use("/api/auth",authRoutes);
app.use("/api/users", userRoutes);




export default app;