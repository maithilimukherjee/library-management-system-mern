import jwt from "jsonwebtoken";

// 1. Guard to verify if a user is logged in (Valid Token Check)
export const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract the token from the header: "Bearer <token_string>"
            token = req.headers.authorization.split(" ")[1];

            // Verify the token signature using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded user information (id and role) directly to the request object
            req.user = decoded;

            // Move on to the next middleware or controller function
            return next();

        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token validation failed" });
        }
    }

    // If no token is provided at all
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token signature found" });
    }
};

// 2. Guard to verify if the user has an Admin role
export const adminOnly = (req, res, next) => {
    // Check the role we attached to req.user in the protect middleware
    if (req.user && req.user.role === "admin") {
        next(); // They are an admin! Proceed to the controller.
    } else {
        return res.status(403).json({ message: "Access denied. Administrative clearance required." });
    }
};