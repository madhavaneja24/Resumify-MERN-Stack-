import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/resume').then(({ data }) => setResumes(data)).catch(() => toast.error('Failed to load resumes')).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await API.delete(`/resume/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  const scoreColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Your Resumes</h1>
            <p className={styles.sub}>Welcome back, {user?.name} 👋</p>
          </div>
          <Link to="/builder" className="btn btn-primary">+ New Resume</Link>
        </div>

        {loading ? (
          <div className={styles.emptyState}><div className={styles.spinner} /></div>
        ) : resumes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>◈</div>
            <h3>No resumes yet</h3>
            <p>Build your first ATS-optimized resume in under 3 minutes.</p>
            <Link to="/builder" className="btn btn-primary btn-lg" style={{marginTop:'20px'}}>Create Resume →</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {resumes.map(resume => (
              <div key={resume._id} className={styles.resumeCard}>
                <div className={styles.cardTop}>
                  <div>
                    <h3 className={styles.resumeTitle}>{resume.title || 'Untitled Resume'}</h3>
                    <p className={styles.resumeMeta}>
                      {resume.personalInfo?.fullName || 'No name set'} ·{' '}
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {resume.atsScore > 0 && (
                    <div className={styles.scoreBadge} style={{ color: scoreColor(resume.atsScore), borderColor: scoreColor(resume.atsScore) }}>
                      {resume.atsScore}%
                    </div>
                  )}
                </div>
                <div className={styles.cardTags}>
                  {resume.experience?.length > 0 && <span className="badge badge-accent">{resume.experience.length} Experience</span>}
                  {resume.skills?.length > 0 && <span className="badge badge-accent">{resume.skills.length} Skill Groups</span>}
                  {resume.education?.length > 0 && <span className="badge badge-accent">{resume.education.length} Education</span>}
                </div>
                <div className={styles.cardActions}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/builder/${resume._id}`)}>Edit</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/ats?resumeId=${resume._id}`)}>ATS Check</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(resume._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
