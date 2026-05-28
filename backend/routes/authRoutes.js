import { register, memberLogin, adminRegister, adminLogin } from "../controllers/authController.js";
import express from "express";

const router = express.Router();

router.post("/",memberLogin);

router.post("/member-register",register);

router.post("/admin-register",adminRegister);

router.post("/admin-login",adminLogin);

export default router;
