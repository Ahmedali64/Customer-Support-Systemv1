import express from "express";
import { getTicketStats } from "../controllers/adminController.js";
import { authorizedRoles } from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.get("/status/tickets", authorizedRoles("admin"), getTicketStats);

export default router;