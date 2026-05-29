import express from "express";
import { 
    addNewBook, 
    lendBook, 
    returnBook, 
    cancelMembership, 
    updateFine 
} from "../controllers/bookController.js";

const router = express.Router();

// Inventory Management
router.post("/add", addNewBook);

// Transactional Operations
router.post("/lend", lendBook);
router.post("/return", returnBook);

// Member Lifecycle Operations
router.post("/cancel", cancelMembership);
router.post("/pay-fine", updateFine);

export default router;