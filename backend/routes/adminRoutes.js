import express from "express";
import {
    getAllMembers,
    getAllBooks,
    getAllTransactions,
    suspendMembership,
    reactivateMembership,
    adminRegister, 
    adminLogin    
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js"; // Imported guards

const router = express.Router();

// 1. Public Identity Endpoints (No tokens needed to sign up or authenticate)
router.post("/register", adminRegister);
router.post("/login", adminLogin);

// 2. Protected Dashboard Analytics (Requires active admin-level authorization headers)
router.get("/members", protect, adminOnly, getAllMembers);
router.get("/books", protect, adminOnly, getAllBooks);
router.get("/transactions", protect, adminOnly, getAllTransactions);

// 3. Protected Account Lifecycle System Adjustments
router.post("/suspend", protect, adminOnly, suspendMembership);
router.post("/reactivate", protect, adminOnly, reactivateMembership);

export default router;