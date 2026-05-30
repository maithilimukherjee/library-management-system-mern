import jwt from "jsonwebtoken"; // Added JWT import
import Member from "../models/Member.js";
import Admin from "../models/Admin.js";

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

        // 1. Generate the JWT token with member privileges
        const token = jwt.sign(
            { id: member._id, role: "member" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Token stays active for 24 hours
        );

        // 2. Return response body carrying the signed token
        return res.status(200).json({
            message: "Login successful",
            token, // Client will extract this to authorize future network actions
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

export const cancelMembership = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(404).json({ message: "Member not found." });
        }

        // Prevent abandonment of accounts with unpaid system debts
        if (member.fine > 0) {
            return res.status(400).json({ 
                message: `Account cannot be cancelled. Please settle outstanding fine of ₹${member.fine} first.` 
            });
        }

        member.memStatus = "cancelled";
        await member.save();

        return res.status(200).json({
            message: "Membership cancelled successfully. Historical parameters retained.",
            member
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};