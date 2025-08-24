import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },

  // Role field with job seeker and recruiter options
  role: {
    type: String,
    enum: ['job_seeker', 'recruiter'],
    required: true,
    default: 'job_seeker'
  },

  // Job seeker specific fields
  dateOfBirth: {
    type: Date,
    required: function () {
      console.log('🔍 Checking dateOfBirth requirement for role:', this.role);
      return this.role === 'job_seeker';
    },
    validate: {
      validator: function (value) {
        if (this.role === 'job_seeker') {
          if (!value) return false;
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 16 && age <= 100;
        }
        return true;
      },
      message: 'Age must be between 16 and 100 years for job seekers'
    }
  },

  // existing lightweight fields
  skills: [{ type: String }],
  experience: { type: String, default: '' }, // summary string (kept for compatibility)
  education: { type: String, default: '' }, // summary string (kept for compatibility)
  resume: { type: String, default: '' },

  // 🔹 NEW: richer profile structure for job seekers
  expertise: [{ type: String }], // e.g., React, Node.js, System Design
  hobbies: [{ type: String }],   // e.g., Reading, Football

  experienceEntries: [{
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    present: { type: Boolean, default: false },
    bullets: [{ type: String }]
  }],

  educationEntries: [{
    school: { type: String, default: '' },
    degree: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    gpa: { type: String, default: '' }
  }],

  // Recruiter specific fields
  company: {
    type: String,
    required: function () { return this.role === 'recruiter'; }
  },
  companyDescription: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual to calculate age
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// THIS IS THE CRUCIAL LINE THAT WAS MISSING:
export default mongoose.models.User || mongoose.model('User', userSchema);
