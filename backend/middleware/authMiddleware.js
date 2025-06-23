const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided");
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Received token:", token); // 🔍 Log token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded); // 🔍 Log decoded info

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log("User not found in DB");
      return res.status(401).json({ error: "User not found" });
    }

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
};


module.exports = { protect };
