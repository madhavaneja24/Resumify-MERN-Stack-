import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

const features = [
  { icon: '✦', title: 'Smart Resume Builder', desc: 'Build professional resumes with guided sections, real-time preview, and multiple templates.' },
  { icon: '◈', title: 'ATS Score Checker', desc: 'Paste any job description and get instant keyword analysis with a match score out of 100.' },
  { icon: '◆', title: 'Keyword Intelligence', desc: 'Discover missing keywords and skills that recruiters and ATS systems are scanning for.' },
  { icon: '⬡', title: 'Multi-Template Export', desc: 'Switch between modern, minimal, and professional resume templates with one click.' },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.glow} />
        <div className={styles.heroContent}>
          <div className={styles.pill}>✦ AI-Powered Resume Tooling</div>
          <h1 className={styles.heroTitle}>
            Build Resumes That<br />
            <span className={styles.highlight}>Beat the ATS</span>
          </h1>
          <p className={styles.heroSub}>
            Create polished, professional resumes and check them against real job descriptions to maximize your interview chances.
          </p>
          <div className={styles.heroCTA}>
            <Link to="/register" className="btn btn-primary btn-lg">Start Building Free →</Link>
            <Link to="/ats" className="btn btn-secondary btn-lg">Try ATS Checker</Link>
          </div>
          <div className={styles.heroStats}>
            {[['98%', 'ATS Pass Rate'], ['10K+', 'Resumes Built'], ['3 min', 'Average Build Time']].map(([val, label]) => (
              <div key={label} className={styles.stat}>
                <span className={styles.statVal}>{val}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className={styles.pill}>Features</div>
            <h2>Everything you need to land the job</h2>
          </div>
          <div className={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.glow2} />
            <h2>Ready to land your dream job?</h2>
            <p>Join thousands of professionals who build ATS-optimized resumes with Resumify.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Create Your Resume →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
