import express from "express";
import {authorizedRoles} from "../middlewares/roleMiddleware.js";
import {authCustomer} from "../middlewares/authMiddleware.js";
import {validate} from "../middlewares/validationMiddleware.js"
import { ticketCreationValidation } from "../utils/ticketValidation.js";
import { 
    creatTicket,
    getTicketByID,
    getAllTickets,
    updateTicketStatus,
    deleteTicket,
    getTicketHistory,
    assignAgentToTicket
 } from "../controllers/ticketController.js";
 
const router = express.Router();

router.post("/create",
    authCustomer,
    authorizedRoles("customer", "agent", "admin"),
    validate(ticketCreationValidation),creatTicket);
//get all tickets attached to that user
router.get("/:userid",
    authCustomer,
    authorizedRoles("customer","agent", "admin"),getAllTickets);

router.get("historyOf/:id",
    authorizedRoles("agent", "admin"),getTicketHistory);

router.post("/assign-ticket" ,
     authorizedRoles("agent"),assignAgentToTicket);   

router.route("/:id")
    .patch(authorizedRoles("agent", "admin"),updateTicketStatus)
    .delete(authCustomer,authorizedRoles("customer", "agent", "admin"),deleteTicket)
    .get(authCustomer,authorizedRoles("customer", "agent", "admin"),getTicketByID);

export default router;