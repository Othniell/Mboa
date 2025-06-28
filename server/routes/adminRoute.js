const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const AdminActionLog = require("../models/AdminActionLog");

const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/admin");

// ✅ GET all businesses (pending + approved + rejected)
router.get("/all-businesses", protect, adminMiddleware, async (req, res) => {
  try {
    const allBusinesses = await Business.find().populate("owner", "firstName lastName email");
    res.json(allBusinesses);
  } catch (err) {
    console.error("Error fetching all businesses:", err);
    res.status(500).json({ message: "Server error while fetching all businesses" });
  }
});

// ✅ GET pending only (if needed separately)
router.get("/businesses/pending", protect, adminMiddleware, async (req, res) => {
  try {
    const pending = await Business.find({ status: "pending" }).populate("owner", "firstName lastName email");
    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending businesses:", err);
    res.status(500).json({ message: "Server error while fetching pending businesses" });
  }
});

// ✅ Approve business
router.post("/businesses/:id/approve", protect, adminMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    business.status = "approved";
    await business.save();

    await AdminActionLog.create({
      admin: req.user.id,
      business: business._id,
      action: "approved",
    });

    res.json({ message: "Business approved successfully" });
  } catch (err) {
    console.error("Error approving business:", err);
    res.status(500).json({ message: "Server error while approving business" });
  }
});

// ✅ Reject business
router.post("/businesses/:id/reject", protect, adminMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    business.status = "rejected";
    await business.save();

    await AdminActionLog.create({
      admin: req.user.id,
      business: business._id,
      action: "rejected",
    });

    res.json({ message: "Business rejected successfully" });
  } catch (err) {
    console.error("Error rejecting business:", err);
    res.status(500).json({ message: "Server error while rejecting business" });
  }
});

// ✅ Admin logs
router.get("/logs", protect, adminMiddleware, async (req, res) => {
  try {
    const logs = await AdminActionLog.find()
      .populate("admin", "firstName lastName email")
      .populate("business", "name type")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Server error while fetching logs" });
  }
});

module.exports = router;
