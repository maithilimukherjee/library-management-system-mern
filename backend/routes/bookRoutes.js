import express from "express";
import { 
    addNewBook, 
    lendBook, 
    returnBook, 
    updateFine 
} from "../controllers/bookController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js"; // Import guards

const router = express.Router();

// All operational routes now require a valid token and an admin role
router.post("/add", protect, adminOnly, addNewBook);
router.post("/lend", protect, adminOnly, lendBook);
router.post("/return", protect, adminOnly, returnBook);
router.post("/pay-fine", protect, adminOnly, updateFine);

export default router;