import express from "express";
import {
    getAllMembers,
    getAllBooks,
    getAllTransactions,
    suspendMembership,
    reactivateMembership,
    adminRegister, // Imported
    adminLogin    // Imported
} from "../controllers/AdminController.js";

const router = express.Router();

// Identity Authentication
router.post("/register", adminRegister);
router.post("/login", adminLogin);

// Dashboard Data View Links
router.get("/members", getAllMembers);
router.get("/books", getAllBooks);
router.get("/transactions", getAllTransactions);

// Account Lifecycle Modifications
router.post("/suspend", suspendMembership);
router.post("/reactivate", reactivateMembership);

export default router;