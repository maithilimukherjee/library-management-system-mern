import mongoose from "mongoose";

const memStatus = [
    "active",
    "cancelled",
    "suspended"
];

const memberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true, 
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address"
            ]
        },
        memStatus: {
            type: String,
            enum: memStatus,
            default: "active"
        },
        fine: {
            type: Number, 
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const memberStatus = memStatus;
export default mongoose.model('Member', memberSchema);