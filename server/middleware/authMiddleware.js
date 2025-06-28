const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for the Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided");
    return res.status(401).json({ error: "No token provided. Authorization denied." });
  }

  const token = authHeader.split(" ")[1]; // Extract token from Bearer header
  console.log("Authorization header received"); // Mask token in logs for security

  try {
    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log("Decoded JWT:", decoded); // Log decoded token for debugging

    // Attach user data to the request object
    req.user = await User.findById(decoded.id).select("-password"); 

    if (!req.user) {
      console.log("User not found in DB");
      return res.status(401).json({ error: "User not found" });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // Handle specific token errors (e.g., expired token)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token has expired" });
    }
    
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = { protect };
