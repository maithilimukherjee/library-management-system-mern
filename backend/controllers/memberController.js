// controllers/memberController.js
import BookRequest from "../models/BookRequest.js";

// @desc    Submit a new book request
// @route   POST /api/members/request
// @access  Protected (Members only)
export const requestBook = async (req, res) => {
    try {
        const { requestedTitle, requestedAuthor } = req.body;

        if (!requestedTitle) {
            return res.status(400).json({ message: "Book title is required." });
        }

        // Let's log what the middleware is actually giving us
        console.log("Decoded User from token:", req.user); 

        // Add fallbacks just in case your token uses 'id' instead of '_id', 
        // or if your middleware attaches 'req.member' instead of 'req.user'
        const userObj = req.user || req.member;
        
        if (!userObj) {
             return res.status(401).json({ message: "Not authorized. User data missing from token." });
        }

        const memberId = userObj._id || userObj.id; 

        if (!memberId) {
             return res.status(400).json({ message: "Could not extract member ID from token." });
        }

        const newRequest = await BookRequest.create({
            memberId,
            requestedTitle,
            requestedAuthor
        });

        return res.status(201).json({
            message: "Request submitted successfully. An admin will review it shortly.",
            request: newRequest
        });
    } catch (error) {
        console.error("Request Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get a member's own request history
// @route   GET /api/members/my-requests
// @access  Protected (Members only)
export const getMyRequests = async (req, res) => {
    try {
        const memberId = req.user._id;
        
        // Fetch requests and sort by newest first
        const myRequests = await BookRequest.find({ memberId }).sort({ createdAt: -1 });

        return res.status(200).json(myRequests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};