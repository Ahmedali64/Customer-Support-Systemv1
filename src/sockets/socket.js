import { Server } from "socket.io";
import { Message } from "../database/mongoModels/messagesModel.js";
import { Conversation } from "../database/mongoModels/conversationModel.js";
import jwt from "jsonwebtoken";

export const initializSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST"],
        },
    });

    // Middleware for authenticating users
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: Token is required"));
        }
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = user; // Attach user info to the socket
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    // Handle client connection
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}, User ID: ${socket.user.id}`);

        // Join a conversation room
        socket.on("joinConversation", async ({ conversationId }) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return socket.emit("error", { message: "Conversation not found" });
                }
                // Ensure the user is part of the conversation
                if (
                    conversation.customerId !== socket.user.id &&
                    conversation.agentId !== socket.user.id
                ) {
                    return socket.emit("error", { message: "Unauthorized to join this conversation" });
                }
                socket.join(conversationId);
                console.log(`User joined conversation: ${conversationId}`);
            } catch (err) {
                console.error("Error joining conversation:", err.message);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // Handle sending messages
        socket.on("sendMessage", async ({ conversationId, content }) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return socket.emit("error", { message: "Conversation not found" });
                }
                // Save the message to the database
                const message = await Message.create({
                    conversationId,
                    senderId: socket.user.id,
                    receiverId:
                        conversation.customerId === socket.user.id
                            ? conversation.agentId
                            : conversation.customerId,
                    content,
                    status: "sent",
                });

                // Emit the message to the room
                io.to(conversationId).emit("messageReceived", message);
            } catch (err) {
                console.error("Error saving message:", err.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Handle typing indicators
        socket.on("typing", ({ conversationId }) => {
            socket.to(conversationId).emit("userTyping", { senderId: socket.user.id });
        });

        // Handle message delivery status
        socket.on("messageDelivered", async ({ messageId, conversationId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, { status: "delivered" });
                io.to(conversationId).emit("messageStatus", { messageId, status: "delivered" });
            } catch (err) {
                console.error("Error updating message status:", err.message);
            }
        });

        // Handle message read status
        socket.on("messageRead", async ({ messageId, conversationId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, { status: "read" });
                io.to(conversationId).emit("messageStatus", { messageId, status: "read" });
            } catch (err) {
                console.error("Error updating message status:", err.message);
            }
        });

        // Handle client disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};