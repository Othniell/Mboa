const express = require("express");
const router = express.Router();
const Business = require("../models/Business");
const HotelCollection = require("../models/HotelCollection");
const ActivityCollection = require("../models/ActivityCollection");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const transporter = require("../config/nodemailer");
const AdminActionLog = require("../models/AdminActionLog");

// Get all pending businesses
router.get("/businesses/pending", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingBusinesses = await Business.find({ status: "pending" })
      .populate("owner", "firstName lastName email");
    res.json(pendingBusinesses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Approve business by ID
router.post("/businesses/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("owner", "email firstName lastName");

    if (!business) return res.status(404).json({ message: "Business not found" });

    // Set status to approved
    business.status = "approved";

    // For restaurants, ensure cuisine is provided
   
// routes/adminRoute.js (partial update)
const Restaurant = require("../models/Restaurant");

// Inside POST /businesses/:id/approve
if (business.type === "restaurant") {
  if (!req.body.cuisine) {
    return res.status(400).json({ message: "Cuisine is required for restaurants" });
  }

  business.cuisine = req.body.cuisine;
  await business.save();

  const commonData = business.toObject();
  delete commonData._id;

  const restaurantData = {
    ...commonData,
    cuisine: business.cuisine,
    location: business.location,
    images: business.images,
    owner: business.owner,
    status: "approved",
  };

  await new Restaurant(restaurantData).save();
}

    // Insert into respective collections
    const commonData = business.toObject();
    delete commonData._id; // prevent duplicate key conflict

    if (business.type === "hotel") {
      await new HotelCollection(commonData).save();
    } else if (business.type === "restaurant") {
      await new Restaurant(commonData).save();
    } else if (business.type === "activity") {
      await new ActivityCollection(commonData).save();
    }

    // Log the approval
    await AdminActionLog.create({
      admin: req.user.id,
      business: business._id,
      action: "approved",
    });

    // Notify the owner
    if (business.owner?.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: business.owner.email,
        subject: `Your business "${business.name}" has been approved`,
        text: `Hello ${business.owner.firstName || ""},\n\nYour business "${business.name}" has been approved by the admin.\n\nThank you.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending approval email:", error);
        } else {
          console.log("Approval email sent:", info.response);
        }
      });
    }

    res.json({ message: "Business approved and categorized successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject business by ID
router.post("/businesses/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("owner", "email firstName lastName");

    if (!business) return res.status(404).json({ message: "Business not found" });

    business.status = "rejected";
    await business.save();

    await AdminActionLog.create({
      admin: req.user.id,
      business: business._id,
      action: "rejected",
    });

    if (business.owner?.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: business.owner.email,
        subject: `Your business "${business.name}" has been rejected`,
        text: `Hello ${business.owner.firstName || ""},\n\nYour business "${business.name}" has been rejected by the admin.\n\nThank you.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending rejection email:", error);
        } else {
          console.log("Rejection email sent:", info.response);
        }
      });
    }

    res.json({ message: "Business rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get admin action logs
router.get("/logs", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await AdminActionLog.find()
      .populate("admin", "firstName lastName email")
      .populate("business", "name type")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching logs" });
  }
});

module.exports = router;
