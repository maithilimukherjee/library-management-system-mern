import BookRequest from "../models/BookRequest.js";
import Member from "../models/Member.js"; // IMPORT YOUR MEMBER MODEL HERE

// @desc    Submit a new book request
// @route   POST /api/members/request
// @access  Protected (Members only)
export const requestBook = async (req, res) => {
    try {
        const { requestedTitle, requestedAuthor } = req.body;

        if (!requestedTitle) {
            return res.status(400).json({ message: "Book title is required." });
        }

        // 1. Get the email from the logged-in user (attached by your protect middleware)
        const userEmail = req.user.email; 
        
        // 2. Find the actual Member profile that belongs to this email
        const member = await Member.findOne({ email: userEmail });

        if (!member) {
             return res.status(404).json({ message: "Library member profile not found for this account." });
        }

        // 3. Create the request using the actual Member's _id
        const newRequest = await BookRequest.create({
            memberId: member._id,
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
        const userEmail = req.user.email;

        // Find the member profile first
        const member = await Member.findOne({ email: userEmail });

        if (!member) {
             // If they don't have a member profile, they obviously have no requests
             return res.status(200).json([]); 
        }

        // Fetch requests using the Member ID and sort by newest first
        const myRequests = await BookRequest.find({ memberId: member._id }).sort({ createdAt: -1 });

        return res.status(200).json(myRequests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};