import 'dotenv/config'; // Loads environment variables
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; // Ensure file extension is included for ES modules
import authRoutes from './routes/authRoutes.js'

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Essential for parsing JSON request bodies

const PORT = process.env.PORT || 5000;

app.use("/api/auth",authRoutes);

// Connect to DB, then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is live on port ${PORT}`);
    });
});