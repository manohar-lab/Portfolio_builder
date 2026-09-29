/* eslint-disable @next/next/no-img-element */
import React from "react";
import { TemplateProps } from "../types";
import { Github, ExternalLink, Mail, MapPin, Code2, Terminal, Briefcase, GraduationCap, FileText } from "lucide-react";

/**
 * Developer Template Component
 * Presentation component consuming standardized PortfolioData.
 */
export const DeveloperTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { profile, sections, projects, skills, education, experience, socialLinks, contact } = data;

  const isSectionVisible = (type: string) => {
    const sec = sections.find((s) => s.type === type);
    return sec ? sec.isVisible : true;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* BACKGROUND DECORATIVE GLOW */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-950 to-slate-950 pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-20">
        
        {/* HERO SECTION */}
        {isSectionVisible("hero") && (
          <header className="space-y-6 border-b border-slate-800/80 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                {profile.isAvailableForWork && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Available for new opportunities
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
                  {profile.fullName}
                </h1>
                <p className="text-xl text-blue-400 font-medium">
                  {profile.headline}
                </p>
                {profile.location && (
                  <p className="flex items-center text-sm text-slate-400 gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" /> {profile.location}
                  </p>
                )}
              </div>

              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover ring-2 ring-slate-800 shadow-xl"
                />
              )}
            </div>

            {/* SOCIAL LINKS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                >
                  {link.platform === "github" && <Github className="w-3.5 h-3.5" />}
                  {link.label || link.platform}
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              ))}
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Resume
                </a>
              )}
            </div>
          </header>
        )}

        {/* ABOUT SECTION */}
        {isSectionVisible("about") && profile.bio && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" /> About Me
            </h2>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light">
              {profile.bio}
            </p>
          </section>
        )}

        {/* SKILLS SECTION */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" /> Tech Stack & Tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="font-semibold text-sm text-slate-200">{skill.name}</div>
                  {skill.proficiency && (
                    <div className="text-[11px] text-slate-500 capitalize">{skill.proficiency}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {isSectionVisible("projects") && projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" /> Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-40 object-cover rounded-xl border border-slate-800"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      {project.isFeatured && (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs font-mono bg-slate-800/80 text-slate-300 rounded border border-slate-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-800/60 text-xs font-medium">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" /> Source
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE SECTION */}
        {isSectionVisible("experience") && experience && experience.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" /> Work Experience
            </h2>
            <div className="space-y-6 border-l-2 border-slate-800 pl-6 ml-2">
              {experience.map((exp) => (
                <div key={exp.id} className="relative space-y-2">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950" />
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-400">{exp.company}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION SECTION */}
        {isSectionVisible("education") && education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" /> Education
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {education.map((edu) => (
                <div key={edu.id} className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base font-bold text-white">{edu.institution}</h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {edu.startYear} – {edu.isCurrentStatus ? "Present" : edu.endYear}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  {edu.cgpa && (
                    <p className="text-xs text-blue-400 font-mono pt-1">
                      CGPA: {edu.cgpa} / {edu.maxCgpa || "4.0"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT SECTION */}
        {isSectionVisible("contact") && contact && (
          <section className="border-t border-slate-800/80 pt-12 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Get In Touch</h2>
            <div className="p-8 bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 rounded-2xl space-y-4 text-center">
              <p className="text-xl font-bold text-white">Let&apos;s build something great together.</p>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {contact.customNote || "Open to full-time roles, freelance projects, and collaborations."}
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25"
              >
                <Mail className="w-4 h-4" /> Send Email
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
