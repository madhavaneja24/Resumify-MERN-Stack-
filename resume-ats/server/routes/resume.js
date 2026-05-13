const express = require('express');
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET all resumes for user
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort('-updatedAt');
    res.json(resumes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single resume
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create resume
router.post('/', protect, async (req, res) => {
  try {
    const resume = await Resume.create({ ...req.body, user: req.user._id });
    res.status(201).json(resume);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update resume
router.put('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE resume
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
