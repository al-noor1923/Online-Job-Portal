// backend/models/cv.js
import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  startDate: Date,
  endDate: Date,
  present: { type: Boolean, default: false },
  bullets: [String]
}, { _id: false });

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  startDate: Date,
  endDate: Date,
  gpa: String
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: String,
  url: String,
  description: String,
  bullets: [String],
  tech: [String]
}, { _id: false });

const cvSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'My CV' },
  template: { type: String, enum: ['classic', 'modern'], default: 'classic' },
  data: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    summary: String,
    skills: [String],
    links: [{ label: String, url: String }],
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema]
  },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.CV || mongoose.model('CV', cvSchema);
