import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  requirements: [{
    type: String
  }],
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  remote: {
    type: Boolean,
    default: false
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'entry'
  },
  // New fields for application deadline and age limit
  applicationDeadline: {
    type: Date,
    required: true
  },
  ageLimit: {
    min: {
      type: Number,
      default: 18,
      min: 16
    },
    max: {
      type: Number,
      default: 65,
      max: 100
    }
  },
  // Link to the recruiter who created this job
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Application status
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  // Total applications count for quick access
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual to check if application deadline has passed
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.applicationDeadline;
});

// Method to check if applicant age is within limits
jobSchema.methods.isAgeEligible = function(age) {
  return age >= this.ageLimit.min && age <= this.ageLimit.max;
};

export default mongoose.models.Job || mongoose.model('Job', jobSchema);
