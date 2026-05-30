import express from "express";
import { register, memberLogin, cancelMembership } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", memberLogin);
router.post("/member-register", register);

// Secure self-service route for members
router.post("/cancel", protect, cancelMembership);

export default router;