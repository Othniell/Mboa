// middleware/adminMiddleware.js

module.exports = function (req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next(); // Allow the request to proceed to the next middleware or route handler
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
