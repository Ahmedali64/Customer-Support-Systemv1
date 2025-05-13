import mongoose from "mongoose";
import { Message } from "./messagesModel.js";

const conversationSchema = new mongoose.Schema({
    customerId: { type:String, ref: "User", required: true },
    agentId: { type: String, ref: "User" }, // Can be null until assigned
    ticketId: { type: String, ref: "Ticket", required: true },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true });
  conversationSchema.index({ customerId: 1, agentId: 1, ticketId: 1 });

  export const Conversation = mongoose.model("Conversation", conversationSchema);
  