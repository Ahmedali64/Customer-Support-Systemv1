import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { logger } from "./src/config/logger.js";
import mongooseConnection from "./src/config/mongooseConnection.js";
import knexConnection from "./src/config/knexConnection.js";



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







app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
});
