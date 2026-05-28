import mongoose from "mongoose";

const borrowalSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book', 
            required: true
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member', 
            required: true
        },
        issueDate: {
            type: Date,
            default: Date.now
        },
        dueDate: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('Borrowal', borrowalSchema);