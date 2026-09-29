import React from "react";
import { TemplateProps } from "../types";
import { ExternalLink, Github, Mail, MapPin, BookOpen, GraduationCap } from "lucide-react";

/**
 * Minimal Template Component
 * Presentation-only component consuming standardized PortfolioData.
 */
export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { profile, sections, projects, skills, education, academicJourney, research, socialLinks, contact } = data;

  const isSectionVisible = (type: string) => {
    const sec = sections.find((s) => s.type === type);
    return sec ? sec.isVisible : true;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto space-y-16">
        
        {/* HERO / PROFILE HEADER */}
        {isSectionVisible("hero") && (
          <header className="border-b border-slate-200 pb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              {profile.fullName}
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              {profile.headline}
            </p>
            {profile.location && (
              <p className="flex items-center text-sm text-slate-500 gap-1.5">
                <MapPin className="w-4 h-4" /> {profile.location}
              </p>
            )}
            
            {/* SOCIAL & CONTACT LINKS */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium underline underline-offset-4 flex items-center gap-1"
                >
                  {link.label || link.platform}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </header>
        )}

        {/* ABOUT SECTION */}
        {isSectionVisible("about") && profile.bio && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">About</h2>
            <p className="text-slate-700 leading-relaxed text-base md:text-lg">
              {profile.bio}
            </p>
          </section>
        )}

        {/* SKILLS SECTION */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md text-sm font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {isSectionVisible("projects") && projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Projects</h2>
            <div className="space-y-8">
              {projects.map((project) => (
                <div key={project.id} className="group space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">{project.shortDescription}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION SECTION */}
        {isSectionVisible("education") && education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                    <span className="text-xs text-slate-500">
                      {edu.startYear} – {edu.isCurrentStatus ? "Present" : edu.endYear}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {edu.degree} in {edu.fieldOfStudy} {edu.cgpa && `(CGPA: ${edu.cgpa})`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACADEMIC JOURNEY SECTION (OPTIONAL FOR STUDENTS) */}
        {isSectionVisible("academic_journey") && academicJourney && academicJourney.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> Academic Journey
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {academicJourney.map((sem) => (
                <div key={sem.id} className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">Semester {sem.semesterNumber}</span>
                    {sem.cgpa && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">GPA: {sem.cgpa}</span>}
                  </div>
                  {sem.subjects.length > 0 && (
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Courses:</span> {sem.subjects.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RESEARCH SECTION */}
        {isSectionVisible("research") && research.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Research & Papers
            </h2>
            <div className="space-y-4">
              {research.map((res) => (
                <div key={res.id} className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-base">{res.title}</h3>
                    {res.paperUrl && (
                      <a href={res.paperUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        Paper <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{res.researchArea} {res.venue && `• ${res.venue}`}</p>
                  <p className="text-sm text-slate-600">{res.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        {isSectionVisible("contact") && contact && (
          <section className="border-t border-slate-200 pt-8 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Contact</h2>
            <p className="text-slate-600 text-sm">
              Feel free to reach out via email:{" "}
              <a href={`mailto:${contact.email}`} className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {contact.email}
              </a>
            </p>
          </section>
        )}
      </div>
    </div>
  );
};
