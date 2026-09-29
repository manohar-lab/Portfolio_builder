/* eslint-disable @next/next/no-img-element */
import React from "react";
import { TemplateProps } from "../types";
import { BookOpen, ExternalLink, GraduationCap, Github, Mail, MapPin, FileText, Code2 } from "lucide-react";

/**
 * Research / Academic Template Component
 * Presentation-only component consuming standardized PortfolioData.
 * Emphasizes research areas, methodology, datasets, papers, publications, and academic journey.
 */
export const ResearchTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { profile, sections, research, education, academicJourney, projects, socialLinks, contact } = data;

  const isSectionVisible = (type: string) => {
    const sec = sections.find((s) => s.type === type);
    return sec ? sec.isVisible : true;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-serif selection:bg-amber-200 selection:text-stone-900 px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* HEADER / ACADEMIC PROFILE */}
        {isSectionVisible("hero") && (
          <header className="border-b border-stone-300 pb-10 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" /> Academic & Research Profile
                </span>
                
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900">
                  {profile.fullName}
                </h1>
                
                <p className="text-xl text-stone-700 font-medium italic">
                  {profile.headline}
                </p>

                {profile.location && (
                  <p className="flex items-center text-sm text-stone-600 gap-1.5 font-sans">
                    <MapPin className="w-4 h-4 text-stone-500" /> {profile.location}
                  </p>
                )}
              </div>

              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-xl object-cover ring-4 ring-stone-200 shadow-md"
                />
              )}
            </div>

            {/* LINKS BAR */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-sans text-xs">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md font-medium transition-colors flex items-center gap-1.5"
                >
                  {link.label || link.platform}
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              ))}
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-md font-medium transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> CV / Paper List
                </a>
              )}
            </div>
          </header>
        )}

        {/* ABOUT / RESEARCH OVERVIEW */}
        {isSectionVisible("about") && profile.bio && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-amber-900 font-sans font-bold border-b border-stone-300 pb-1">
              Research Focus & Biography
            </h2>
            <p className="text-stone-800 leading-relaxed text-base md:text-lg">
              {profile.bio}
            </p>
          </section>
        )}

        {/* RESEARCH PAPERS & PUBLICATIONS */}
        {isSectionVisible("research") && research && research.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-amber-900 font-sans font-bold border-b border-stone-300 pb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-800" /> Peer-Reviewed Research & Manuscripts
            </h2>

            <div className="space-y-6">
              {research.map((res) => (
                <div key={res.id} className="p-6 bg-white border border-stone-200 rounded-xl space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-stone-900">{res.title}</h3>
                    <span className="text-xs font-sans font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 capitalize">
                      {res.publicationStatus.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs font-sans font-medium text-stone-500">
                    Field: <strong className="text-stone-700">{res.researchArea}</strong> {res.venue && `• ${res.venue}`}
                  </p>

                  <p className="text-sm text-stone-700 leading-relaxed">{res.description}</p>

                  {res.methodology && (
                    <p className="text-xs text-stone-600">
                      <strong className="text-stone-800 font-sans">Methodology:</strong> {res.methodology}
                    </p>
                  )}

                  {res.dataset && (
                    <p className="text-xs text-stone-600">
                      <strong className="text-stone-800 font-sans">Dataset:</strong> {res.dataset}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-stone-100 text-xs font-sans">
                    {res.paperUrl && (
                      <a href={res.paperUrl} target="_blank" rel="noopener noreferrer" className="text-amber-800 hover:underline font-semibold flex items-center gap-1">
                        Read Full Paper <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {res.githubUrl && (
                      <a href={res.githubUrl} target="_blank" rel="noopener noreferrer" className="text-stone-700 hover:underline flex items-center gap-1">
                        Code Repository <Github className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION & ACADEMIC JOURNEY */}
        {isSectionVisible("education") && education && education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-amber-900 font-sans font-bold border-b border-stone-300 pb-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-800" /> Academic Credentials & Degrees
            </h2>

            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="p-5 bg-white border border-stone-200 rounded-xl space-y-2 shadow-sm">
                  <div className="flex justify-between items-baseline font-sans">
                    <h3 className="text-base font-bold text-stone-900">{edu.institution}</h3>
                    <span className="text-xs text-stone-500 font-mono">
                      {edu.startYear} – {edu.isCurrentStatus ? "Present" : edu.endYear}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700">
                    {edu.degree} in {edu.fieldOfStudy} {edu.cgpa && `(Cumulative GPA: ${edu.cgpa}/${edu.maxCgpa || "4.0"})`}
                  </p>
                  {edu.description && <p className="text-xs text-stone-600">{edu.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SEMESTER-BY-SEMESTER ACADEMIC PROGRESS */}
        {isSectionVisible("academic_journey") && academicJourney && academicJourney.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-amber-900 font-sans font-bold border-b border-stone-300 pb-1">
              Semester-Wise Academic Journey
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
              {academicJourney.map((sem) => (
                <div key={sem.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900 text-sm">Semester {sem.semesterNumber}</span>
                    {sem.cgpa && <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">GPA: {sem.cgpa}</span>}
                  </div>
                  {sem.subjects.length > 0 && (
                    <p className="text-xs text-stone-600">
                      <strong>Courses:</strong> {sem.subjects.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {isSectionVisible("projects") && projects && projects.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-amber-900 font-sans font-bold border-b border-stone-300 pb-1 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-800" /> Applied Research Projects & Implementations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-stone-900 text-base">{proj.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{proj.shortDescription}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 font-sans text-xs">
                    <div className="flex flex-wrap gap-1 pb-2">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="bg-stone-100 px-2 py-0.5 rounded text-[10px] text-stone-700">
                          {t}
                        </span>
                      ))}
                    </div>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-stone-700 hover:underline flex items-center gap-1">
                        View Code <Github className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT FOOTER */}
        {isSectionVisible("contact") && contact && (
          <section className="border-t border-stone-300 pt-8 space-y-3 font-sans">
            <h2 className="text-xs uppercase tracking-widest text-amber-900 font-bold">Contact & Correspondence</h2>
            <p className="text-stone-700 text-sm">
              Direct inquiries & collaboration proposals to:{" "}
              <a href={`mailto:${contact.email}`} className="text-amber-800 font-semibold hover:underline inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {contact.email}
              </a>
            </p>
          </section>
        )}

      </div>
    </div>
  );
};
