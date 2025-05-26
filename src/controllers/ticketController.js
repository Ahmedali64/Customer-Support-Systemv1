import { ticket } from "../models/ticketModel.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger.js";
import{ handleTicketCreation , handleAgentAvailability } from "../config/rabbitmq.js"
// Create ticket
export const creatTicket = async (req, res) => {
    try {
        const { subject, description } = req.body;
        const customer_id = req.user.id;
        const ticketData ={
            id: uuidv4(),
            customer_id,
            agent_id: null,
            subject,
            description,
            status:"open",
        };
        let ticketFromRabbitMQ = await handleTicketCreation(ticketData);
        let finalTicket = await ticket.create(ticketFromRabbitMQ);
        logger.info(`Ticket created successfully. User ID: ${req.user.id}, Ticket ID: ${finalTicket.id}`);
        res.status(201).json({ message: "Ticket created successfully!", finalTicket });
    } catch (err) {
        logger.error(`Error creating ticket. User ID: ${req.user.id}, Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error while creating ticket." });
    }
};

// Get ticket by ID
export const getTicketByID = async (req, res) => {
    try {
        const { id } = req.params; // Ticket ID
        let cusID,cusRole;
        let aId,aRole;
        if(req.user){ 
            ({ id:cusID, role:cusRole } = req.user);
        }else if (req.session){
            ({id:aId,role:aRole} = req.session);//as an agent or admin
        }

        if (!id) {
            return res.status(400).json({ message: "Ticket ID is required." });
        }
   
        const ticketData = await ticket.getTicket(id);
        if (!ticketData) {
            logger.warn(`Ticket not found. Ticket ID: ${id}`);
            return res.status(404).json({ message: "Ticket not found." });
        }

        // Check access permissions
        if (cusRole === "customer" && ticketData.customer_id !== cusID) {
            logger.warn(`Unauthorized access attempt. User ID: ${cusID}, Ticket ID: ${id}`);
            return res.status(403).json({ message: "Forbidden: You do not have access to this ticket." });
        }
        const finalRole = cusRole || aRole;
        const finalId = cusID || aId;
        logger.info(`Ticket retrieved successfully. retrived by user ID: ${finalId} - Role: ${finalRole}, Ticket ID: ${id}`);
        res.status(200).json(ticketData);
    } catch (err) {
        logger.error(`Error retrieving ticket. Ticket ID: ${req.params.id}, Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error while retrieving ticket." });
    }
};

// Get all tickets
export const getAllTickets = async (req, res) => {
    try {
        const { userid:userID_Admin_Agent } = req.params; // ID sent in the request to fetch tickets
        const { id, role } = req.session; // Logged-in admin's ID and role
        const {id:custID, role:cusRole}= req.user;
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 tickets per page
        const offset = (page - 1) * limit;

        let tickets;

        if (role === "admin" || role === "agent") {
            tickets = await ticket.getCustomerTickets(userID_Admin_Agent, limit, offset);
            logger.info(`Tickets retrieved successfully by Admin/Agent. User ID: ${id}, Target User ID: ${userID_Admin_Agent}`);
        } else if (cusRole === "customer") {
            if (userID_Admin_Agent !== custID) {
                logger.warn(`Unauthorized access attempt by customer. User ID: ${custID}, Target User ID: ${userID_Admin_Agent}`);
                return res.status(403).json({ message: "Forbidden: You can only access your own tickets." });
            }
            tickets = await ticket.getCustomerTickets(userID_Admin_Agent, limit, offset);
            logger.info(`Tickets retrieved successfully by Customer. User ID: ${id}`);
        } else {
            logger.warn(`Unauthorized role attempting to access tickets. User ID: ${userID_Admin_Agent}`);
            return res.status(403).json({ message: "Forbidden: You do not have access to this resource." });
        }

        res.status(200).json({ success: true, tickets });
    } catch (err) {
        //logger.error(`Error retrieving tickets. User ID: ${req.user.id}, Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;//ticket id
        const { status } = req.body;//new status
        const changedBy = req.session.userId;//casue only andmin and agent can do this 

        const ticketData = await ticket.getTicket(id);
        if (!ticketData) {
            logger.warn(`Ticket not found for update. Ticket ID: ${id}`);
            return res.status(404).json({ message: "Ticket not found." });
        }
        const validStatuses = ["open", "in_progress", "resolved", "escalated"];
        if (!validStatuses.includes(status)) {
            logger.warn(`Invalid status provided. status: ${status}`);
            return res.status(400).json({ message: "Invalid status provided." });
        }
        const updatedTicket = await ticket.updateTicketStatus(id, status, changedBy);
        logger.info(`Ticket status updated successfully. Ticket ID: ${id}, Updated By: ${changedBy}, New Status: ${status}`);
        res.status(200).json({ message: "Ticket updated successfully!", ticket: updatedTicket });
    } catch (err) {
        logger.error(`Error updating ticket status. Ticket ID: ${req.params.id}, Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error while updating ticket." });
    }
};

// Delete ticket
export const deleteTicket = async (req, res) => {
    try {
        const {id:ticketID } = req.params; // Ticket ID
        //we will solve Error: Cannot destructure property 
        //so why this happend ?
        //js will get confused for some reason she will think that this is a Block of code 
        //so u have to but them in() so she knows that u are doing some destructuring    
        //so when u are doing destructuring proccess again and u are defining vars before assiging them 
        //use () casue when u try to destructure js will think that this is a block of code 
        let cusID,cusRole;
        let aId,aRole;
        if(req.user){ 
            ({ id:cusID, role:cusRole } = req.user);
        }else if (req.session){
            ({id:aId,role:aRole} = req.session);//as an agent or admin
        }
    
        if (!ticketID) {
            return res.status(400).json({ message: "Ticket ID is required." });
        }

        const ticketData = await ticket.getTicket(ticketID);
        if (!ticketData) {
            logger.warn(`Ticket not found for deletion. Ticket ID: ${ticketID}`);
            return res.status(404).json({ message: "Ticket not found." });
        }
        //customer only can del his tickets
        if (cusRole === "customer" && ticketData.customer_id !== cusID) {
            logger.warn(`Unauthorized deletion attempt. User ID: ${cusID}, Ticket ID: ${ticketID}`);
            return res.status(403).json({ message: "Forbidden: You do not have access to delete this ticket." });
        }

        const deleted = await ticket.deleteTicket(ticketID);
        if (!deleted) {
            logger.error(`Failed to delete ticket. Ticket ID: ${ticketID}`);
            return res.status(500).json({ message: "Failed to delete the ticket." });
        }
        const finalRole = cusRole || aRole;
        logger.info(`Ticket deleted successfully. Ticket ID: ${ticketID}, Deleted By: ${finalRole}`);
        res.status(200).json({ message: "Ticket deleted successfully." });
    } catch (err) {
        logger.error(`Error deleting ticket. Ticket ID: ${req.params.id}, Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "An error occurred while deleting the ticket. Please try again later." });
    }
};

// Get ticket history
export const getTicketHistory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Ticket ID is required." });
        }

        const ticketHistory = await ticket.getTicketHistory(id);
        if (!ticketHistory) {
            logger.warn(`Ticket history not found. Ticket ID: ${id}`);
            return res.status(404).json({ message: "Ticket not found." });
        }

        logger.info(`Ticket history retrieved successfully. Ticket ID: ${id}`);
        res.status(200).json(ticketHistory);
    } catch (err) {
        logger.error(`Error retrieving ticket history. Ticket ID: ${req.params.id}, Error: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error while retrieving ticket history." });
    }
};

//get the agent a ticket
export const assignAgentToTicket = async (req,res) => {
    try{
        //this agent is asking for a ticket
        let agentID  = req.session.userId;
        console.log(agentID);
        //here if there is a ticket u wil get it no u will get null  
        let availableTicket = await handleAgentAvailability(agentID);

        if(availableTicket === null){
            //this means no ticket so we just return a messages that he is added to Q
            return res.status(200).json({message:"No tickets available. You have been added to the queue."});
        }else{
            //this means that there is a ticket
            //so we update ticket in the data base and return it in the res
            await ticket.updateTicketAgent(availableTicket.id , agentID);
            logger.info(`A ticket with ID: ${availableTicket.id } has been assigned to agent ${agentID}`)
            return res.status(200).json({
                message: "You have been assigned a ticket.",
                ticket: availableTicket,
            });
        }

    }catch(err){
            logger.error(`Error assigning ticket to agent. Agent ID: ${req.body.agentID}, Error: ${err.message}`, {
            stack: err.stack,
            });
            res.status(500).json({ message: "Server error while assigning ticket." });
    };

};