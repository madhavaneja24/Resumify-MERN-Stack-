/**
 * ATS Score Calculator
 * Analyzes resume content against a job description
 * Returns score (0-100) with detailed breakdown
 */

const calculateATSScore = (resume, jobDescription) => {
  const jd = jobDescription.toLowerCase();
  const results = { totalScore: 0, breakdown: [], suggestions: [], keywords: { found: [], missing: [] } };

  // --- 1. Keyword Matching (40 points) ---
  const jdWords = extractKeywords(jd);
  const resumeText = buildResumeText(resume).toLowerCase();
  let matchedCount = 0;

  jdWords.forEach(kw => {
    if (resumeText.includes(kw.toLowerCase())) {
      matchedCount++;
      results.keywords.found.push(kw);
    } else {
      results.keywords.missing.push(kw);
    }
  });

  const keywordScore = jdWords.length > 0
    ? Math.round((matchedCount / jdWords.length) * 40)
    : 20;
  results.breakdown.push({ category: 'Keyword Match', score: keywordScore, max: 40 });

  // --- 2. Section Completeness (25 points) ---
  let sectionScore = 0;
  const sections = [
    { key: 'personalInfo.summary', label: 'Summary', points: 5 },
    { key: 'experience', label: 'Work Experience', points: 7 },
    { key: 'education', label: 'Education', points: 5 },
    { key: 'skills', label: 'Skills', points: 5 },
    { key: 'projects', label: 'Projects', points: 3 },
  ];

  sections.forEach(({ key, label, points }) => {
    const val = getNestedValue(resume, key);
    const filled = Array.isArray(val) ? val.length > 0 : Boolean(val);
    if (filled) { sectionScore += points; }
    else { results.suggestions.push(`Add a ${label} section to improve your score.`); }
  });
  results.breakdown.push({ category: 'Section Completeness', score: sectionScore, max: 25 });

  // --- 3. Contact Info (10 points) ---
  let contactScore = 0;
  const contacts = ['email', 'phone', 'linkedin', 'location'];
  contacts.forEach(field => {
    if (resume.personalInfo?.[field]) contactScore += 2.5;
  });
  contactScore = Math.round(contactScore);
  results.breakdown.push({ category: 'Contact Information', score: contactScore, max: 10 });

  // --- 4. Experience Quality (15 points) ---
  let expScore = 0;
  const experiences = resume.experience || [];
  if (experiences.length > 0) {
    const avgAchievements = experiences.reduce((acc, exp) => acc + (exp.achievements?.length || 0), 0) / experiences.length;
    expScore += Math.min(10, avgAchievements * 2);
    const hasMetrics = experiences.some(exp =>
      exp.description?.match(/\d+%|\$\d+|\d+\s*(users|clients|projects|team)/i)
    );
    if (hasMetrics) expScore += 5;
    else results.suggestions.push('Add quantifiable metrics to your experience (e.g., "increased sales by 30%").');
  }
  expScore = Math.round(expScore);
  results.breakdown.push({ category: 'Experience Quality', score: expScore, max: 15 });

  // --- 5. Skills Relevance (10 points) ---
  let skillScore = 0;
  const allSkills = (resume.skills || []).flatMap(s => s.items || []).map(s => s.toLowerCase());
  const techWords = extractTechKeywords(jd);
  const matchedSkills = techWords.filter(t => allSkills.some(s => s.includes(t)));
  skillScore = techWords.length > 0
    ? Math.round((matchedSkills.length / Math.max(techWords.length, 1)) * 10)
    : 5;
  results.breakdown.push({ category: 'Skills Relevance', score: skillScore, max: 10 });

  results.totalScore = Math.min(100, results.breakdown.reduce((sum, b) => sum + b.score, 0));

  if (results.keywords.missing.length > 0) {
    results.suggestions.push(`Add these missing keywords: ${results.keywords.missing.slice(0, 8).join(', ')}`);
  }

  return results;
};

const buildResumeText = (resume) => {
  const parts = [];
  if (resume.personalInfo) {
    parts.push(Object.values(resume.personalInfo).join(' '));
  }
  (resume.experience || []).forEach(e => {
    parts.push(`${e.position} ${e.company} ${e.description} ${(e.achievements || []).join(' ')}`);
  });
  (resume.skills || []).forEach(s => parts.push(s.items?.join(' ') || ''));
  (resume.projects || []).forEach(p => {
    parts.push(`${p.name} ${p.description} ${(p.techStack || []).join(' ')}`);
  });
  return parts.join(' ');
};

const extractKeywords = (text) => {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','must','shall','that','this','these','those','it','its','we','you','they','he','she','our','your','their','his','her','not','no','nor','so','yet','both','either','neither','each','every','all','any','few','more','most','other','some','such','than','then','there','about','above','after','before','between','during','into','through','under','until','up','down','over','out','off','away']);
  return [...new Set(
    text.match(/\b[a-z][a-z+#.]{2,}\b/g)?.filter(w => !stopWords.has(w)) || []
  )].slice(0, 50);
};

const extractTechKeywords = (text) => {
  const techPattern = /\b(javascript|python|react|node|express|mongodb|sql|aws|docker|kubernetes|git|typescript|java|c\+\+|css|html|rest|api|agile|scrum|redux|graphql|postgresql|mysql|redis|linux|ci\/cd|terraform|machine learning|ml|ai)\b/gi;
  return [...new Set((text.match(techPattern) || []).map(t => t.toLowerCase()))];
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

module.exports = { calculateATSScore };
