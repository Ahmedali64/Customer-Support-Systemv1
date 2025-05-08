import express from "express";
import authorizedRoles from "../middlewares/roleMiddleware.js";
import authCustomer from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validationMiddleware.js"
import { ticketCreationValidation } from "../utils/ticketValidation.js";
import { 
    creatTicket,
    getTicketByID,
    getAllTickets,
    updateTicketStatus,
    deleteTicket,
    getTicketHistory
 } from "../controllers/ticketController";
const router = express.Router();

router.post("/create",
    authorizedRoles("customer", "agent", "admin"),
    validate(ticketCreationValidation),creatTicket);
router.get("/:userid",
    authCustomer,
    authorizedRoles("customer", "agent", "admin"),getAllTickets);
router.get("historyOf/:id",
    authorizedRoles("agent", "admin"),getTicketHistory);
router.route("/:id")
    .patch(authorizedRoles("agent", "admin"),updateTicketStatus)
    .delete(authCustomer,authorizedRoles("customer", "agent", "admin"),deleteTicket)
    .get(authCustomer,authorizedRoles("customer", "agent", "admin"),getTicketByID);





export default router;