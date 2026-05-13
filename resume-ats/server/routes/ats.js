const express = require('express');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const { calculateATSScore } = require('../utils/atsCalculator');

const router = express.Router();

// POST /api/ats/check  — check resume against job description
router.post('/check', protect, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription)
      return res.status(400).json({ message: 'Resume ID and job description required' });

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const results = calculateATSScore(resume.toObject(), jobDescription);

    // Save ATS score to resume
    resume.atsScore = results.totalScore;
    await resume.save();

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ats/quick  — quick check without saving (no auth required)
router.post('/quick', async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription)
      return res.status(400).json({ message: 'Resume data and job description required' });
    const results = calculateATSScore(resumeData, jobDescription);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
