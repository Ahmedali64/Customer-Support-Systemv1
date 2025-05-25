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
        const { role, id: userId } = req.user; // User role and ID from `req.user`

        if (!id) {
            return res.status(400).json({ message: "Ticket ID is required." });
        }

        const ticketData = await ticket.getTicket(id);
        if (!ticketData) {
            logger.warn(`Ticket not found. Ticket ID: ${id}`);
            return res.status(404).json({ message: "Ticket not found." });
        }

        // Check access permissions
        if (role === "customer" && ticketData.customer_id !== userId) {
            logger.warn(`Unauthorized access attempt. User ID: ${userId}, Ticket ID: ${id}`);
            return res.status(403).json({ message: "Forbidden: You do not have access to this ticket." });
        }

        logger.info(`Ticket retrieved successfully. User ID: ${userId}, Ticket ID: ${id}`);
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
        console.log(userID_Admin_Agent)
        const { id, role } = req.session; // Logged-in user's ID and role
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 tickets per page
        const offset = (page - 1) * limit;

        let tickets;

        if (role === "admin" || role === "agent") {
            tickets = await ticket.getCustomerTickets(userID_Admin_Agent, limit, offset);
            logger.info(`Tickets retrieved successfully by Admin/Agent. User ID: ${id}, Target User ID: ${userID_Admin_Agent}`);
        } else if (role === "customer") {
            if (userID_Admin_Agent !== id) {
                logger.warn(`Unauthorized access attempt by customer. User ID: ${id}, Target User ID: ${userID_Admin_Agent}`);
                return res.status(403).json({ message: "Forbidden: You can only access your own tickets." });
            }
            tickets = await ticket.getCustomerTickets(id, limit, offset);
            logger.info(`Tickets retrieved successfully by Customer. User ID: ${id}`);
        } else {
            logger.warn(`Unauthorized role attempting to access tickets. User ID: ${id}, Role: ${role}`);
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
        const { id } = req.params;
        const { status } = req.body;
        const changedBy = req.user.id;

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
        const { id } = req.params; // Ticket ID
        const { role, id: userId } = req.user; // User role and ID from `req.user`

        if (!id) {
            return res.status(400).json({ message: "Ticket ID is required." });
        }

        const ticketData = await ticket.getTicket(id);
        if (!ticketData) {
            logger.warn(`Ticket not found for deletion. Ticket ID: ${id}`);
            return res.status(404).json({ message: "Ticket not found." });
        }

        if (role === "customer" && ticketData.customer_id !== userId) {
            logger.warn(`Unauthorized deletion attempt. User ID: ${userId}, Ticket ID: ${id}`);
            return res.status(403).json({ message: "Forbidden: You do not have access to delete this ticket." });
        }

        const deleted = await ticket.deleteTicket(id);
        if (!deleted) {
            logger.error(`Failed to delete ticket. Ticket ID: ${id}`);
            return res.status(500).json({ message: "Failed to delete the ticket." });
        }

        logger.info(`Ticket deleted successfully. Ticket ID: ${id}, Deleted By: ${userId}`);
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