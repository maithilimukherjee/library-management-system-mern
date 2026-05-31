import 'dotenv/config'; // Loads environment variables
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; // Ensure file extension is included for ES modules
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import memberRoutes from './routes/memberRoutes.js'

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Essential for parsing JSON request bodies

const PORT = process.env.PORT || 5000;

app.use("/api/auth",authRoutes);
app.use("/api/book",bookRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/member",memberRoutes);

// Connect to DB, then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is live on port ${PORT}`);
    });
});