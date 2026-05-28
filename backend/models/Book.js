import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        isbn: {
            type: String,
            required: true,
            unique: true // Ensures no two books share the same ISBN
        },
        info: {
            type: String
        },
        avStatus: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('Book', bookSchema);