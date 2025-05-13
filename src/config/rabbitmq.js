import amqplib from "amqplib";
import "dotenv/config";
import logger from "../config/logger.js"
let connection;
let channel;
let ticket_queue = "ticket_queue";
let agent_queue = "agent_queue";
export const connectToRabbitMQ = async () => {
    try{
        //first we make a connection to RabbitMQ srver 
        connection = await amqplib.connect(process.env.RABBITMQ_URL);
        console.log("Connected to RabbitMQ");
        //then we make a channel on that connection to communicate with the exchange
        channel= await connection.createChannel();
        console.log("Channel created");
        //then we should make our main queues(agent , queue)
        await channel.assertQueue(ticket_queue , {durable:true});
        console.log("Ticket Queue created");
        await channel.assertQueue(agent_queue , {durable:true});
        console.log("Agent Queue created");
    }catch(err){
        logger.error(`Failed to connect to RabbitMQ ,Error ${err.message} ,${err.stack}`);
        process.exit(1);
    }
};
// Function to get the channel (for publishing/consuming messages)
// Just to make sure that the channel is created before using it 
export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized. Call connectRabbitMQ first.");
  }
  return channel;
};

//this function we gonnna make it to when agent is free we send him to the queue
export const publishAgent = async (agent) => {
  // just to make sure that there is a connection with a connection
  const channel = getChannel(); 
  channel.sendToQueue(agent_queue , Buffer.from(JSON.stringify(agent)));
  console.log(`Agent published: ${JSON.stringify(agent)}`);
};
//same here when ticket with no agent we send ticket to a queue
export const publishTicket = async (ticket) => {
  const channel = getChannel();
  channel.sendToQueue(ticket_queue , Buffer.from(JSON.stringify(ticket)));
  console.log(`Ticket published: ${JSON.stringify(ticket)}`);
};
// Function to handle ticket and agent assignment
export const handleTicketCreation = async (ticket) => {
  const channel = getChannel();

  // Check if there is an available agent in the Agent Queue
  let agentMessage = await channel.get(agent_queue, { noAck: false });

  if (agentMessage) {
    // An agent is available, assign the agent to the ticket
    let agent = JSON.parse(agentMessage.content.toString());
    console.log(`Assigning Agent ${agent.agentId} to Ticket ${ticket.id}`);

    // Acknowledge the agent message (remove it from the queue)
    channel.ack(agentMessage);

    // Here i will take the ticket and add the agent to it 
    ticket.agentId = agent
    return ticket;
  } else {
    // No agent is available, add the ticket to the Ticket Queue
    await publishTicket(ticket);
    console.log(`No agent available. Ticket ${ticket.id} added to Ticket Queue`);
    return ticket;
  }
};
// Function to handle agent availability
export const handleAgentAvailability = async (agent) => {
  const channel = getChannel();

  // Check if there is a ticket waiting in the Ticket Queue
  let ticketMessage = await channel.get(ticket_queue, { noAck: false });

  if (ticketMessage) {
    // A ticket is waiting, assign the ticket to the agent
    let ticket = JSON.parse(ticketMessage.content.toString());
    console.log(`Assigning Ticket ${ticket.id} to Agent ${agent}`);

    // Acknowledge the ticket message (remove it from the queue)
    channel.ack(ticketMessage);

    //update ticket agent id then save the ticket to the database
    ticket.agent_id = agent
    return ticket;
  } else {
    // No ticket is waiting, add the agent to the Agent Queue
    await publishAgent(agent);
    console.log(`No ticket waiting. Agent ${agent.agentId} added to Agent Queue`);
    return null;
  } 
};