import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true }, 
  receiverId: { type: String, required: true }, 
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ senderId: 1, receiverId: 1 });

export const Message = mongoose.model("Message", messageSchema);