import mongoose from "mongoose";

export const adminSchema = new mongoose.Schema(
    {
        name:{
                type: String,
                required:true
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

        hireDate: {
            type:Date,
            required: true
        }
    },
    {
        timestamps:true
    }
);

export default mongoose.model('Admin', adminSchema);