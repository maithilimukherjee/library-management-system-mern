import { register, memberLogin } from "../controllers/authController.js";
import express from "express";

const router = express.Router();

router.post("/",memberLogin);

router.post("/member-register",register);

export default router;
