// routes/memberRoutes.js
import express from "express";
import { requestBook, getMyRequests } from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// All member routes require the user to be logged in
router.post("/request", protect, requestBook);
router.get("/my-requests", protect, getMyRequests);

export default router;