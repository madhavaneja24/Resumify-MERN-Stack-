const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Resume' },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String,
  },
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
    achievements: [String],
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String,
    achievements: [String],
  }],
  skills: [{
    category: String,
    items: [String],
  }],
  projects: [{
    name: String,
    description: String,
    techStack: [String],
    link: String,
    github: String,
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    link: String,
  }],
  template: { type: String, default: 'modern' },
  atsScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
