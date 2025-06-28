const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "othnielmoube45@gmail.com",         // ✅ your Gmail
    pass: "ezrtmoelgctciugh",                 // ✅ your App password
  },
});

// ✅ Called after submission
const sendBusinessSubmittedEmail = async ({ to, name }) => {
  const subject = "Business Submission Received";
  const text = `Hello ${name},\n\nWe have received your business submission. Our admin team will review it shortly ✅.\n\nThank you!\n- MEC TELECOM`;

  try {
    await transporter.sendMail({
      from: `"Mboadiscovery" <othnielmoube45@gmail.com>`,
      to,
      subject,
      text,
    });
    console.log(`📨 Submission confirmation sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send confirmation email:", err.message);
  }
};

// ✅ Called when admin approves or rejects
const sendBusinessStatusEmail = async ({ to, name, status }) => {
  const subject =
    status === "approved" ? "Business Approved" : "Business Rejected";

  const text =
    status === "approved"
      ? `Hello ${name}, your business has been approved ✅. It will now appear on our platform.`
      : `Hello ${name}, we regret to inform you that your business was rejected ❌.`;

  try {
    await transporter.sendMail({
      from: `"Admin Team" <othnielmoube45@gmail.com>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Status email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send status email:", err.message);
  }
};

module.exports = {
  sendBusinessSubmittedEmail,
  sendBusinessStatusEmail,
};
