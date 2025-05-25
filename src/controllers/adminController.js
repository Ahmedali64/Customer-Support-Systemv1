import { ticket } from "../models/ticketModel.js";
import logger from "../config/logger.js";
export const getTicketStats = async (req , res) => {
    try{
        //we should return number of open and resoulved tickets
        let openCount= ticket.countDocuments("open");
        let resolvedCount=ticket.countDocuments("resoulved");
         res.status(200).json({
            open: openCount,
            resolved: resolvedCount,
            averageResponseTimeMinutes: avgResponseTime
        });
    }catch(err){
        logger.error("Error fetching ticket stats: " + err.message);
        res.status(500).json({ message: "Error fetching ticket stats", error: err.message });
    };
};