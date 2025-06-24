const mongoose = require('mongoose');

const SubBoxSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  images: [String], // URLs of uploaded images
  coords: {
    lat: Number,
    lng: Number,
  }, // for location sub-box only
});

const SectionSchema = new mongoose.Schema({
  type: Map,
  of: SubBoxSchema,
});

const BusinessSubmissionSchema = new mongoose.Schema({
  profile: {
    name: String,
    phone: String,
    profilePic: String,
  },
  section: Object, // or Map<String, SubBoxSchema>
  category: {
    type: String,
    enum: ['hotel', 'restaurant', 'activity'],
    required: true,
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('BusinessSubmission', BusinessSubmissionSchema);
