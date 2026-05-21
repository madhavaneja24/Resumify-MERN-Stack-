import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../utils/api';
import toast from 'react-hot-toast';
import ResumePreview from '../components/ResumePreview';
import styles from './Builder.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SECTIONS = ['Personal', 'Experience', 'Education', 'Skills', 'Projects', 'Certifications'];

const emptyResume = {
  title: 'My Resume',
  personalInfo: { fullName:'', email:'', phone:'', location:'', linkedin:'', github:'', website:'', summary:'' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  template: 'modern',
};

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(emptyResume);
  const [activeSection, setActiveSection] = useState('Personal');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem('token');
      axios.get(`${BASE_URL}/api/resume/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => setResume(data))
        .catch(() => toast.error('Failed to load resume'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`${BASE_URL}/api/resume/${id}`, resume, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Saved!');
      } else {
        const { data } = await axios.post(`${BASE_URL}/api/resume`, resume, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Resume created!');
        navigate(`/builder/${data._id}`);
      }
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const updatePersonal = (field, val) =>
    setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, [field]: val } }));

  const addItem = (section, template) =>
    setResume(r => ({ ...r, [section]: [...r[section], template] }));

  const updateItem = (section, idx, field, val) =>
    setResume(r => ({ ...r, [section]: r[section].map((it, i) => i === idx ? { ...it, [field]: val } : it) }));

  const removeItem = (section, idx) =>
    setResume(r => ({ ...r, [section]: r[section].filter((_, i) => i !== idx) }));

  const downloadPDF = async () => {
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

      const fileName = `${resume.personalInfo?.fullName || 'resume'}_${resume.title || 'cv'}.pdf`;
      pdf.save(fileName);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) return <div className={styles.loadingPage}><div className="score-ring"><div style={{animation:'spin 0.8s linear infinite',border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',width:40,height:40}} /></div></div>;

  return (
    <div className={styles.builder}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <input className="form-input" value={resume.title}
            onChange={e => setResume(r => ({...r, title: e.target.value}))}
            placeholder="Resume title" style={{marginBottom:16}} />
          {SECTIONS.map(s => (
            <button key={s} className={`${styles.sideBtn} ${activeSection === s ? styles.active : ''}`}
              onClick={() => setActiveSection(s)}>{s}</button>
          ))}
        </div>
        <div className={styles.sidebarBottom}>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : (id ? '💾 Save Changes' : '🚀 Create Resume')}
          </button>
          <button 
            className="btn btn-secondary" 
            style={{width:'100%',marginTop:8}} 
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '📝 Edit Resume' : '👁️ Preview Resume'}
          </button>
          {showPreview && (
            <button 
              className="btn btn-success" 
              style={{width:'100%',marginTop:8}} 
              onClick={downloadPDF} 
              disabled={downloadingPDF}
            >
              {downloadingPDF ? '⏳ Generating PDF...' : '📄 Download PDF'}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" style={{width:'100%',marginTop:8}} onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {showPreview ? (
          <div className={styles.previewContainer}>
            <div className={styles.previewHeader}>
              <h2>Resume Preview</h2>
              <p>This is how your resume will look when downloaded as PDF</p>
            </div>
            <ResumePreview resume={resume} />
          </div>
        ) : (
          <>
            {activeSection === 'Personal' && (
              <Section title="Personal Information" icon="👤">
            <div className="grid-2">
              {[['fullName','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn URL'],['github','GitHub URL'],['website','Portfolio URL']].map(([f,l]) => (
                <div key={f} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={resume.personalInfo[f] || ''} onChange={e => updatePersonal(f, e.target.value)} placeholder={l} />
                </div>
              ))}
            </div>
            <div className="form-group" style={{marginTop:16}}>
              <label className="form-label">Professional Summary</label>
              <textarea className="form-input" rows={4} value={resume.personalInfo.summary || ''} onChange={e => updatePersonal('summary', e.target.value)} placeholder="Write a compelling 2-3 sentence summary..." />
            </div>
          </Section>
        )}

        {activeSection === 'Experience' && (
          <Section title="Work Experience" icon="💼" onAdd={() => addItem('experience', {company:'',position:'',startDate:'',endDate:'',current:false,description:'',achievements:[]})}>
            {resume.experience.map((exp, i) => (
              <div key={i} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <h4>Experience #{i+1}</h4>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem('experience', i)}>Remove</button>
                </div>
                <div className="grid-2">
                  {[['position','Job Title'],['company','Company']].map(([f,l]) => (
                    <div key={f} className="form-group">
                      <label className="form-label">{l}</label>
                      <input className="form-input" value={exp[f]||''} onChange={e=>updateItem('experience',i,f,e.target.value)} placeholder={l} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" value={exp.startDate||''} onChange={e=>updateItem('experience',i,'startDate',e.target.value)} placeholder="Jan 2022" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" value={exp.endDate||''} disabled={exp.current} onChange={e=>updateItem('experience',i,'endDate',e.target.value)} placeholder="Present" />
                  </div>
                </div>
                <label style={{display:'flex',alignItems:'center',gap:8,marginTop:8,cursor:'pointer',fontSize:'0.88rem',color:'var(--text-muted)'}}>
                  <input type="checkbox" checked={exp.current||false} onChange={e=>updateItem('experience',i,'current',e.target.checked)} />
                  Currently working here
                </label>
                <div className="form-group" style={{marginTop:12}}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={exp.description||''} onChange={e=>updateItem('experience',i,'description',e.target.value)} placeholder="Describe your responsibilities..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Achievements (one per line)</label>
                  <textarea className="form-input" value={(exp.achievements||[]).join('\n')} onChange={e=>updateItem('experience',i,'achievements',e.target.value.split('\n'))} placeholder="Increased sales by 30%&#10;Led a team of 5 engineers" />
                </div>
              </div>
            ))}
          </Section>
        )}

        {activeSection === 'Education' && (
          <Section title="Education" icon="🎓" onAdd={() => addItem('education', {institution:'',degree:'',field:'',startDate:'',endDate:'',gpa:''})}>
            {resume.education.map((edu, i) => (
              <div key={i} className={styles.itemCard}>
                <div className={styles.itemHeader}><h4>Education #{i+1}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('education', i)}>Remove</button></div>
                <div className="grid-2">
                  {[['institution','Institution'],['degree','Degree'],['field','Field of Study'],['gpa','GPA (optional)'],['startDate','Start Year'],['endDate','End Year']].map(([f,l]) => (
                    <div key={f} className="form-group"><label className="form-label">{l}</label><input className="form-input" value={edu[f]||''} onChange={e=>updateItem('education',i,f,e.target.value)} placeholder={l} /></div>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        )}

        {activeSection === 'Skills' && (
          <Section title="Skills" icon="⚡" onAdd={() => addItem('skills', {category:'',items:[]})}>
            {resume.skills.map((skill, i) => (
              <div key={i} className={styles.itemCard}>
                <div className={styles.itemHeader}><h4>Skill Group #{i+1}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('skills', i)}>Remove</button></div>
                <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={skill.category||''} onChange={e=>updateItem('skills',i,'category',e.target.value)} placeholder="e.g. Frontend, Languages, Tools" /></div>
                <div className="form-group"><label className="form-label">Skills (comma separated)</label><input className="form-input" value={(skill.items||[]).join(', ')} onChange={e=>updateItem('skills',i,'items',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="React, TypeScript, CSS, Node.js" /></div>
              </div>
            ))}
          </Section>
        )}

        {activeSection === 'Projects' && (
          <Section title="Projects" icon="🚀" onAdd={() => addItem('projects', {name:'',description:'',techStack:[],link:'',github:''})}>
            {resume.projects.map((proj, i) => (
              <div key={i} className={styles.itemCard}>
                <div className={styles.itemHeader}><h4>{proj.name || `Project #${i+1}`}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('projects', i)}>Remove</button></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Project Name</label><input className="form-input" value={proj.name||''} onChange={e=>updateItem('projects',i,'name',e.target.value)} placeholder="My Awesome App" /></div>
                  <div className="form-group"><label className="form-label">Tech Stack (comma separated)</label><input className="form-input" value={(proj.techStack||[]).join(', ')} onChange={e=>updateItem('projects',i,'techStack',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="React, Node, MongoDB" /></div>
                  <div className="form-group"><label className="form-label">Live Link</label><input className="form-input" value={proj.link||''} onChange={e=>updateItem('projects',i,'link',e.target.value)} placeholder="https://myapp.com" /></div>
                  <div className="form-group"><label className="form-label">GitHub</label><input className="form-input" value={proj.github||''} onChange={e=>updateItem('projects',i,'github',e.target.value)} placeholder="https://github.com/..." /></div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={proj.description||''} onChange={e=>updateItem('projects',i,'description',e.target.value)} placeholder="What does this project do?" /></div>
              </div>
            ))}
          </Section>
        )}

        {activeSection === 'Certifications' && (
          <Section title="Certifications" icon="🏆" onAdd={() => addItem('certifications', {name:'',issuer:'',date:'',link:''})}>
            {resume.certifications.map((cert, i) => (
              <div key={i} className={styles.itemCard}>
                <div className={styles.itemHeader}><h4>{cert.name || `Cert #${i+1}`}</h4><button className="btn btn-danger btn-sm" onClick={() => removeItem('certifications', i)}>Remove</button></div>
                <div className="grid-2">
                  {[['name','Certification Name'],['issuer','Issuing Organization'],['date','Date'],['link','Credential Link']].map(([f,l]) => (
                    <div key={f} className="form-group"><label className="form-label">{l}</label><input className="form-input" value={cert[f]||''} onChange={e=>updateItem('certifications',i,f,e.target.value)} placeholder={l} /></div>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        )}
        </>
        )}
      </main>
    </div>
  );
}

function Section({ title, icon, children, onAdd }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>{icon} {title}</h2>
        {onAdd && <button className="btn btn-secondary btn-sm" onClick={onAdd}>+ Add {title.split(' ')[0]}</button>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}
