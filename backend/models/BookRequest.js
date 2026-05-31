// models/BookRequest.js
import mongoose from "mongoose";

const bookRequestSchema = new mongoose.Schema({
    memberId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Member", 
        required: true 
    },
    requestedTitle: { 
        type: String, 
        required: true 
    },
    requestedAuthor: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    adminReply: {
        type: String,
        default: ""
    }
}, { timestamps: true }); // timestamps automatically tracks when they requested it

export default mongoose.model("BookRequest", bookRequestSchema);