import knexConnection from "../config/knexConnection.js"
import {v4 as uuidv4} from "uuid";
export const ticket = {
    async create(ticketData){
        try{
            await knexConnection("tickets").insert(ticketData);
            return knexConnection("tickets").where({id:ticketData.id})
            .select("id","customer_id","agent_id","subject","description","status");
        }catch(err){
            throw err;
        }
    },
    async getTicket(ticketID){
        return await knexConnection("tickets").where({id:ticketID})
        .select("id","customer_id","agent_id","subject","description","status");;
    },
    async getCustomerTickets(customerId, limit, offset) {
        return await knexConnection("tickets")
            .where({ customer_id: customerId })
            .limit(limit)
            .offset(offset)
            .select("id", "customer_id", "agent_id", "subject", "description", "status");
    },
    async updateTicketStatus(ticketID,stat,changedBy) {
        // Ensure status is valid
        const validStatuses = ["open", "in_progress", "resolved","escalated"];
        if (!validStatuses.includes(stat)) {
            throw new Error("Invalid status provided.");
        };
        // Perform update
        const updatedRows = await knexConnection("tickets").where({ id:ticketID }).update({ status: stat });
        // If no rows were updated, ticket might not exist
        if (!updatedRows) {
            throw new Error("Ticket not found or update failed.");
        };
        //save changes
        //i am thinking if i should del the ticket after updating the status but lets just keep it for now  
        await knexConnection("ticket_history").insert({
            id: uuidv4(),
            changed_by: changedBy,
            ticket_id: ticketID,
            status:stat,
        });        
        // Fetch updated ticket
        return await knexConnection("tickets")
        .where({ id:ticketID })
        .select("id","customer_id","agent_id","subject","description","status")
        .first();
    },
    async deleteTicket(ticketID){
        return await knexConnection("tickets").where({id:ticketID}).del();
    },
    async getTicketHistory(ticketID){
        return await knexConnection("ticket_history")
        .where({ id:ticketID })
        .select("id","changed_by","ticket_id","status")
        .first();
    },
    async updateTicketAgent(ticketID , agentID){
        return await knexConnection("tickets").where({id:ticketID}).update({agent_id:agentID}).select("id","customer_id","agent_id","subject","description","status")
    },
    async countDocuments(reqStatus){
        //[ { 'count(*)': '5' } ] this is the output of the count
        let result = await knexConnection("tickets").where({status:reqStatus}).count();
        return Number(result[0]["count(*)"]);
    },
};