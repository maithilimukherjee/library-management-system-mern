import jwt from "jsonwebtoken"; // Added JWT import
import Member from "../models/Member.js";
import Book from "../models/Book.js";
import Borrowal from "../models/Borrowal.js";
import Admin from "../models/Admin.js";
import BookRequest from "../models/BookRequest.js";

// ==========================================
//          SYSTEM-WIDE VISIBILITY
// ==========================================

// --- GET ALL MEMBERS ---
export const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find({});
        return res.status(200).json({
            count: members.length,
            members
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- GET ALL BOOKS ---
export const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({});
        return res.status(200).json({
            count: books.length,
            books
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- GET ALL BORROWAL LOGS (WITH RELATIONSHIPS) ---
export const getAllTransactions = async (req, res) => {
    try {
        const logs = await Borrowal.find({})
            .populate("bookId", "name isbn avStatus")
            .populate("memberId", "name email memStatus");

        return res.status(200).json({
            count: logs.length,
            logs
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
//         ACCOUNT STATUS MANAGEMENT
// ==========================================

// --- SUSPEND ACCOUNT ---
export const suspendMembership = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required to locate the member account." });
        }

        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(404).json({ message: "Member account not found." });
        }

        if (member.fine <= 100) {
            return res.status(400).json({ 
                message: `Account cannot be suspended. Fine balance (₹${member.fine}) is under the threshold.` 
            });
        }

        member.memStatus = "suspended";
        await member.save();

        return res.status(200).json({
            message: "Membership suspended successfully due to outstanding fine balances.",
            member
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- REACTIVATE ACCOUNT ---
export const reactivateMembership = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email field is required." });
        }

        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(404).json({ message: "Member record not found." });
        }

        if (member.fine > 0) {
            return res.status(400).json({ 
                message: `Reactivation denied. User must pay entire fine. Remaining debt: ₹${member.fine}` 
            });
        }

        member.memStatus = "active";
        await member.save();

        return res.status(200).json({
            message: "Account restored to active standing successfully.",
            member
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
//         ADMIN IDENTITY ACCESS
// ==========================================

// --- ADMIN REGISTRATION ---
export const adminRegister = async (req, res) => {
    try {
        const { name, email, hireDate } = req.body; 

        if (!name || !email || !hireDate) {
            return res.status(400).json({ message: "Name, email, and hireDate are required fields" });
        }

        const oldAdmin = await Admin.findOne({ email });
        if (oldAdmin) {
            return res.status(400).json({ message: "Admin already exists. Log in instead." });
        }

        const newAdmin = await Admin.create({ name, email, hireDate });

        return res.status(201).json({ 
            message: "Admin registered successfully", 
            admin: newAdmin 
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- ADMIN LOGIN ---
export const adminLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) {
            return res.status(403).json({ message: "brother u dont work here lol" }); 
        }

        // 1. Sign the admin-scoped token
        const token = jwt.sign(
            { id: existingAdmin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 2. Return the token signature with the admin object wrapper
        return res.status(200).json({ 
            message: "Welcome back admin", 
            token,
            admin: existingAdmin 
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending book requests
// @route   GET /api/admin/requests
// @access  Protected (Admin only)
export const getPendingRequests = async (req, res) => {
    try {
        // Find all pending requests and populate the member's email/name so the admin knows who asked
        const requests = await BookRequest.find({ status: "pending" })
            .populate("memberId", "name email")
            .sort({ createdAt: 1 }); // Oldest first (queue style)

        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Respond to a book request
// @route   POST /api/admin/requests/:id/respond
// @access  Protected (Admin only)
export const respondToRequest = async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const requestId = req.params.id;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status update." });
        }

        const request = await BookRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request ticket not found." });
        }

        request.status = status;
        request.adminReply = adminReply || "";
        await request.save();

        return res.status(200).json({
            message: `Request marked as ${status}.`,
            request
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};