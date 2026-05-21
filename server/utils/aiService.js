const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Get AI-powered resume recommendations based on ATS results
 */
const getResumeRecommendations = async (resume, jobDescription, atsResults) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert resume coach and ATS specialist. Analyze the following resume against a job description and provide actionable recommendations.

RESUME:
Name: ${resume.personalInfo?.fullName || 'Not provided'}
Summary: ${resume.personalInfo?.summary || 'Not provided'}
Skills: ${(resume.skills || []).map(s => s.items?.join(', ')).join(', ') || 'Not provided'}
Experience: ${(resume.experience || []).map(e => `${e.position} at ${e.company}: ${e.description}`).join('\n') || 'Not provided'}
Education: ${(resume.education || []).map(e => `${e.degree} from ${e.school}`).join(', ') || 'Not provided'}

JOB DESCRIPTION:
${jobDescription}

ATS RESULTS:
- Total Score: ${atsResults.totalScore}/100
- Missing Keywords: ${atsResults.keywords.missing.join(', ') || 'None'}
- Current Suggestions: ${atsResults.suggestions.join('; ') || 'None'}

Provide 5-7 specific, actionable recommendations to improve this resume for this job. Focus on:
1. Adding missing keywords naturally
2. Improving section completeness
3. Enhancing experience descriptions with metrics
4. Better alignment with job requirements
5. Formatting and structure improvements

Format your response as a JSON array of strings, each being a specific recommendation.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the AI response to extract recommendations
    try {
      const recommendations = JSON.parse(response);
      return Array.isArray(recommendations) ? recommendations : [response];
    } catch {
      // If JSON parsing fails, split by newlines and clean up
      return response
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .slice(0, 7);
    }
  } catch (error) {
    console.error('AI recommendation error:', error.message);
    // Fallback recommendations if AI fails
    return [
      'Add the missing keywords from the job description to your resume',
      'Include more quantifiable achievements in your experience section',
      'Ensure your summary aligns with the job requirements',
      'Add relevant projects that demonstrate required skills',
      'Improve contact information completeness'
    ];
  }
};

/**
 * General AI chat for resume advice
 */
const getChatResponse = async (message, conversationHistory = []) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const historyText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const prompt = `
You are a helpful resume and career advisor. Provide concise, actionable advice about resume writing, job applications, ATS optimization, and career development. Keep responses under 150 words.

Conversation history:
${historyText}

User message: ${message}
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI chat error:', error.message);
    return "I'm having trouble connecting right now. Please try again later or check your API configuration.";
  }
};

module.exports = {
  getResumeRecommendations,
  getChatResponse,
};
