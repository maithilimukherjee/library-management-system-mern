import Member from "../models/Member.js";
import Admin from "../models/Admin.js";

// ==========================================
//            MEMBER ENDPOINTS
// ==========================================

// --- MEMBER REGISTRATION ---
export const register = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Please provide both name and email" });
        }

        const existingMember = await Member.findOne({ email });
        if (existingMember) {
            return res.status(409).json({ message: "Member already exists" });
        }

        const newMember = await Member.create({ name, email });

        return res.status(201).json({ 
            message: "Member registered successfully", 
            member: newMember 
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- MEMBER LOGIN ---
export const memberLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is a required field" });
        }

        const member = await Member.findOne({ email });

        if (!member) {
            return res.status(401).json({ message: "Invalid email address" });
        }

        if (member.memStatus === "suspended") {
            return res.status(403).json({ 
                message: "Login refused. Your account has been suspended. Please contact administration." 
            });
        }

        if (member.memStatus === "cancelled") {
            return res.status(403).json({ 
                message: "This account has been cancelled. Please register a new account with a different email id." 
            });
        }

        return res.status(200).json({
            message: "Login successful",
            member: {
                id: member._id,
                name: member.name,
                email: member.email,
                memStatus: member.memStatus
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
//             ADMIN ENDPOINTS
// ==========================================

