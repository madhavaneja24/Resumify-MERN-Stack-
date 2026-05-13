import React from 'react';
import styles from './ResumePreview.module.css';

export default function ResumePreview({ resume, isForPDF = false }) {
  const { personalInfo, experience, education, skills, projects, certifications } = resume;

  const containerClass = isForPDF ? styles.pdfContainer : styles.previewContainer;

  return (
    <div className={containerClass} id="resume-preview">
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.name}>{personalInfo?.fullName || 'Your Name'}</h1>
        <div className={styles.contact}>
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
        </div>
        <div className={styles.links}>
          {personalInfo?.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
          {personalInfo?.github && <span>GitHub: {personalInfo.github}</span>}
          {personalInfo?.website && <span>Portfolio: {personalInfo.website}</span>}
        </div>
        {personalInfo?.summary && (
          <div className={styles.summary}>
            <p>{personalInfo.summary}</p>
          </div>
        )}
      </div>

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Experience</h2>
          {experience.map((exp, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{exp.position}</h3>
                <span className={styles.itemDate}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className={styles.itemSubheader}>
                <span className={styles.itemCompany}>{exp.company}</span>
              </div>
              {exp.description && (
                <p className={styles.itemDescription}>{exp.description}</p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className={styles.achievements}>
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {education.map((edu, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{edu.degree}</h3>
                <span className={styles.itemDate}>
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div className={styles.itemSubheader}>
                <span className={styles.itemCompany}>{edu.institution}</span>
                {edu.field && <span className={styles.itemField}>{edu.field}</span>}
                {edu.gpa && <span className={styles.itemGPA}>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          {skills.map((skillGroup, index) => (
            <div key={index} className={styles.skillGroup}>
              <h3 className={styles.skillCategory}>{skillGroup.category}</h3>
              <div className={styles.skillList}>
                {skillGroup.items && skillGroup.items.map((skill, idx) => (
                  <span key={idx} className={styles.skill}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Projects</h2>
          {projects.map((project, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{project.name}</h3>
                <div className={styles.projectLinks}>
                  {project.link && <span className={styles.link}>Live: {project.link}</span>}
                  {project.github && <span className={styles.link}>GitHub: {project.github}</span>}
                </div>
              </div>
              {project.techStack && project.techStack.length > 0 && (
                <div className={styles.techStack}>
                  <strong>Tech Stack:</strong> {project.techStack.join(', ')}
                </div>
              )}
              {project.description && (
                <p className={styles.itemDescription}>{project.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          {certifications.map((cert, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{cert.name}</h3>
                <span className={styles.itemDate}>{cert.date}</span>
              </div>
              <div className={styles.itemSubheader}>
                <span className={styles.itemCompany}>{cert.issuer}</span>
                {cert.link && <span className={styles.link}>Credential: {cert.link}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
