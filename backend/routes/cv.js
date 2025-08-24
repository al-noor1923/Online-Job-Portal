// backend/routes/cv.js
import express from 'express';
import CV from '../models/cv.js';
import { authenticateToken, requireJobSeeker } from '../middleware/auth.js';

const router = express.Router();

// Get current user's CVs
router.get('/my', authenticateToken, requireJobSeeker, async (req, res) => {
  const cvs = await CV.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json({ success: true, data: cvs });
});

// Create CV
router.post('/', authenticateToken, requireJobSeeker, async (req, res) => {
  console.log("📝 Incoming CV payload:", req.body);
  const payload = { ...req.body, user: req.user._id };
  if (payload.isDefault) {
    await CV.updateMany({ user: req.user._id, isDefault: true }, { isDefault: false });
  }
  const cv = await CV.create(payload);
  res.status(201).json({ success: true, data: cv });
});

// Update CV
router.put('/:id', authenticateToken, requireJobSeeker, async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.isDefault) {
    await CV.updateMany({ user: req.user._id, isDefault: true, _id: { $ne: id } }, { isDefault: false });
  }
  const cv = await CV.findOneAndUpdate({ _id: id, user: req.user._id }, payload, { new: true });
  if (!cv) return res.status(404).json({ success: false, message: 'CV not found' });
  res.json({ success: true, data: cv });
});

// Delete CV
router.delete('/:id', authenticateToken, requireJobSeeker, async (req, res) => {
  const { id } = req.params;
  const cv = await CV.findOneAndDelete({ _id: id, user: req.user._id });
  if (!cv) return res.status(404).json({ success: false, message: 'CV not found' });
  res.json({ success: true, message: 'Deleted' });
});

export default router;
