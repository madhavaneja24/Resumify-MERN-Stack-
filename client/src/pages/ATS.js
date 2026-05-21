import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import ResumePreview from '../components/ResumePreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './ATS.module.css';

export default function ATSChecker() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preloadedId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(preloadedId || '');
  const [jobDesc, setJobDesc] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (user) API.get('/resume').then(({ data }) => setResumes(data));
  }, [user]);

  useEffect(() => {
    if (selectedId && resumes.length > 0) {
      const resume = resumes.find(r => r._id === selectedId);
      setSelectedResume(resume);
    }
  }, [selectedId, resumes]);

  const downloadPDF = async () => {
    if (!selectedResume) {
      toast.error('No resume selected');
      return;
    }
    
    setDownloadingPDF(true);
    try {
      const element = document.getElementById('resume-preview');
      if (!element) {
        toast.error('Resume preview not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${selectedResume.personalInfo?.fullName || 'resume'}_${selectedResume.title || 'cv'}.pdf`;
      pdf.save(fileName);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleCheck = async () => {
    if (!selectedId) return toast.error('Select a resume first');
    if (jobDesc.trim().length < 50) return toast.error('Please paste a longer job description (50+ chars)');
    setLoading(true); setResults(null); setAiRecommendations(null);
    try {
      const { data } = await API.post('/ats/check', { resumeId: selectedId, jobDescription: jobDesc });
      setResults(data);
      toast.success('ATS analysis complete!');
    } catch (err) { toast.error(err.response?.data?.message || 'Check failed'); }
    finally { setLoading(false); }
  };

  const handleGetRecommendations = async () => {
    if (!results) return toast.error('Run ATS check first');
    setLoadingRecommendations(true);
    try {
      const { data } = await API.post('/ats/recommendations', {
        resumeId: selectedId,
        jobDescription: jobDesc,
        atsResults: results
      });
      setAiRecommendations(data.recommendations);
      toast.success('AI recommendations generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
      setAiRecommendations(['Add the missing keywords from the job description to your resume', 'Include more quantifiable achievements in your experience section', 'Ensure your summary aligns with the job requirements']);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreLabel = (score) => {
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>ATS Checker</h1>
            <p className={styles.sub}>Paste a job description and see how well your resume matches</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left: Input */}
          <div className={styles.inputPanel}>
            <div className="card">
              <h3 style={{marginBottom:20}}>📋 Configure Check</h3>

              {user ? (
                <div className="form-group" style={{marginBottom:20}}>
                  <label className="form-label">Select Resume</label>
                  {resumes.length === 0 ? (
                    <div className={styles.noResume}>
                      <p>No resumes found.</p>
                      <Link to="/builder" className="btn btn-primary btn-sm">Build One →</Link>
                    </div>
                  ) : (
                    <select className="form-input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                      <option value="">— Choose a resume —</option>
                      {resumes.map(r => (
                        <option key={r._id} value={r._id}>{r.title} — {r.personalInfo?.fullName || 'No name'}</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className={styles.loginPrompt}>
                  <p>🔒 <Link to="/login" style={{color:'var(--accent)'}}>Log in</Link> to check your saved resumes</p>
                </div>
              )}

              <div className="form-group" style={{marginBottom:20}}>
                <label className="form-label">Job Description</label>
                <textarea className="form-input" rows={12} value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here...&#10;&#10;We're looking for a Full Stack Developer with experience in React, Node.js, MongoDB..." />
                <span style={{fontSize:'0.75rem',color:'var(--text-dim)'}}>{jobDesc.length} characters</span>
              </div>

              <button className="btn btn-primary" style={{width:'100%'}} onClick={handleCheck} disabled={loading || !user || !selectedId}>
                {loading ? '⚡ Analyzing...' : '🔍 Check ATS Score'}
              </button>
              {selectedResume && (
                <button 
                  className="btn btn-success" 
                  style={{width:'100%', marginTop: 10}} 
                  onClick={downloadPDF} 
                  disabled={downloadingPDF}
                >
                  {downloadingPDF ? '⏳ Generating PDF...' : '📄 Download Resume PDF'}
                </button>
              )}
              {!user && <p style={{textAlign:'center',marginTop:12,fontSize:'0.85rem',color:'var(--text-muted)'}}>Please <Link to="/login" style={{color:'var(--accent)'}}>log in</Link> to use the ATS checker</p>}
            </div>
          </div>

          {/* Right: Results */}
          <div className={styles.resultsPanel}>
            {loading && (
              <div className={styles.loadingCard}>
                <div className={styles.spinner} />
                <p>Analyzing your resume...</p>
              </div>
            )}

            {results && !loading && (
              <div className={styles.results}>
                {/* Score */}
                <div className={`card ${styles.scoreCard}`}>
                  <svg viewBox="0 0 120 120" width="120" height="120" className={styles.ring}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor(results.totalScore)} strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (results.totalScore / 100) * circumference}
                      strokeLinecap="round" style={{transition:'stroke-dashoffset 1s ease',transform:'rotate(-90deg)',transformOrigin:'60px 60px'}} />
                  </svg>
                  <div className={styles.scoreInfo}>
                    <div className={styles.scoreNum} style={{color: scoreColor(results.totalScore)}}>{results.totalScore}</div>
                    <div className={styles.scoreMax}>/100</div>
                    <div className={styles.scoreLabel}>{scoreLabel(results.totalScore)}</div>
                    <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginTop:4}}>ATS Match Score</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="card">
                  <h3 style={{marginBottom:16}}>📊 Score Breakdown</h3>
                  {results.breakdown.map(b => (
                    <div key={b.category} className={styles.breakdownItem}>
                      <div className={styles.breakdownLabel}>
                        <span>{b.category}</span>
                        <span style={{fontWeight:700,color:scoreColor(Math.round(b.score/b.max*100))}}>{b.score}/{b.max}</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill}
                          style={{width:`${(b.score/b.max)*100}%`, background:scoreColor(Math.round(b.score/b.max*100))}} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Keywords */}
                <div className="card">
                  <h3 style={{marginBottom:16}}>🔑 Keyword Analysis</h3>
                  {results.keywords.found.length > 0 && (
                    <div style={{marginBottom:16}}>
                      <p style={{fontSize:'0.82rem',color:'var(--success)',fontWeight:600,marginBottom:8}}>✓ FOUND ({results.keywords.found.length})</p>
                      <div className={styles.tags}>
                        {results.keywords.found.slice(0,20).map(k => <span key={k} className="badge badge-success">{k}</span>)}
                      </div>
                    </div>
                  )}
                  {results.keywords.missing.length > 0 && (
                    <div>
                      <p style={{fontSize:'0.82rem',color:'var(--danger)',fontWeight:600,marginBottom:8}}>✗ MISSING ({results.keywords.missing.length})</p>
                      <div className={styles.tags}>
                        {results.keywords.missing.slice(0,20).map(k => <span key={k} className="badge badge-danger">{k}</span>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Recommendations */}
                <div className="card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                    <h3 style={{margin:0}}>🤖 AI Recommendations</h3>
                    {!aiRecommendations && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleGetRecommendations}
                        disabled={loadingRecommendations}
                      >
                        {loadingRecommendations ? '⚡ Generating...' : 'Get AI Tips'}
                      </button>
                    )}
                  </div>
                  {loadingRecommendations && (
                    <div style={{textAlign:'center', padding:'20px', color:'var(--text-muted)'}}>
                      <div className={styles.spinner} style={{margin:'0 auto 10px'}} />
                      <p>AI is analyzing your resume...</p>
                    </div>
                  )}
                  {aiRecommendations && (
                    <div className={styles.suggestions}>
                      {aiRecommendations.map((rec, i) => (
                        <div key={i} className={styles.suggestion}>
                          <span className={styles.suggestionDot} style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}} />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!aiRecommendations && !loadingRecommendations && (
                    <p style={{color:'var(--text-muted)', fontSize:'0.9rem', textAlign:'center', padding:'10px'}}>
                      Click "Get AI Tips" to receive personalized recommendations based on your resume and job description
                    </p>
                  )}
                </div>

                {/* Suggestions */}
                {results.suggestions.length > 0 && (
                  <div className="card">
                    <h3 style={{marginBottom:16}}>💡 Suggestions</h3>
                    <div className={styles.suggestions}>
                      {results.suggestions.map((s, i) => (
                        <div key={i} className={styles.suggestion}>
                          <span className={styles.suggestionDot} />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!results && !loading && selectedResume && (
              <div className={styles.resumePreviewSection}>
                <div className={styles.previewHeader}>
                  <h3>Resume Preview</h3>
                  <p>Selected resume for ATS analysis</p>
                </div>
                <ResumePreview resume={selectedResume} />
              </div>
            )}

            {!results && !loading && !selectedResume && (
              <div className={styles.emptyResults}>
                <div className={styles.emptyIcon}>◈</div>
                <h3>Run an ATS Check</h3>
                <p>Select your resume, paste a job description, and get instant keyword matching and score analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
