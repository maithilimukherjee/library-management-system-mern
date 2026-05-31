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

        // Assuming your 'protect' middleware attaches the logged-in user to req.user
        const memberId = req.user._id; 

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