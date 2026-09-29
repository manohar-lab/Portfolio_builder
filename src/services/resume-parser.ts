import { NormalizedImportPayload, ImportedProject, ImportedSkill, ImportedEducation, ImportedExperience, ImportedResearch, ImportedAchievement, ImportedCertification, ImportedSocial } from "@/types/import";

/**
 * Resume Parsing Configuration & Constraints
 */
export const RESUME_IMPORT_CONFIG = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: [".pdf", ".docx", ".txt", ".md"],
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
  ],
};

/**
 * Utility to extract raw text from Buffer based on file type
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  
  if (ext === ".txt" || ext === ".md" || mimeType.includes("text/")) {
    return buffer.toString("utf-8");
  }

  if (ext === ".pdf" || mimeType === "application/pdf") {
    return parsePdfBufferText(buffer);
  }

  if (ext === ".docx" || mimeType.includes("wordprocessingml")) {
    return parseDocxBufferText(buffer);
  }

  // Fallback UTF-8 text conversion
  return buffer.toString("utf-8");
}

/**
 * Lightweight PDF text stream extractor
 */
function parsePdfBufferText(buffer: Buffer): string {
  const content = buffer.toString("binary");
  const textChunks: string[] = [];

  // Match text objects inside stream brackets: (text) Tj or [(text)] TJ
  const tjRegex = /\(([^()]*)\)\s*TJ|\(([^()]*)\)\s*Tj/gi;
  let match;
  while ((match = tjRegex.exec(content)) !== null) {
    const snippet = match[1] || match[2];
    if (snippet) {
      // Unescape PDF characters
      const cleaned = snippet
        .replace(/\\([()\\])/g, "$1")
        .replace(/\\r/g, " ")
        .replace(/\\n/g, " ");
      textChunks.push(cleaned);
    }
  }

  if (textChunks.length > 0) {
    return textChunks.join(" ");
  }

  // Fallback stream text extraction
  return content.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s+/g, " ");
}

/**
 * Lightweight DOCX XML text extractor
 */
function parseDocxBufferText(buffer: Buffer): string {
  const content = buffer.toString("utf-8");
  // Extract text within <w:t> tags in Word XML structure
  const wtRegex = /<w:t[^>]*>(.*?)<\/w:t>/gi;
  const chunks: string[] = [];
  let match;
  while ((match = wtRegex.exec(content)) !== null) {
    if (match[1]) {
      chunks.push(match[1]);
    }
  }

  if (chunks.length > 0) {
    return chunks.join(" ");
  }

  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

/**
 * Common technical skills dictionary for fuzzy extraction
 */
const KNOWN_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "Django", "FastAPI", "Spring Boot", "Flask",
  "HTML5", "CSS3", "TailwindCSS", "Sass", "Bootstrap", "GraphQL", "REST API", "PostgreSQL", "MySQL", "MongoDB",
  "Redis", "SQLite", "Supabase", "Firebase", "Prisma", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git",
  "GitHub", "CI/CD", "Linux", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning",
  "NLP", "Computer Vision", "Data Analysis", "Pandas", "NumPy", "OpenCV", "Unit Testing", "Jest", "Vitest", "Playwright"
];

/**
 * Deterministic Resume Parser Engine
 */
export function parseResumeContent(rawText: string, filename: string): NormalizedImportPayload {
  const cleanedText = rawText.replace(/\r\n/g, "\n").trim();
  const lines = cleanedText.split("\n").map(l => l.trim()).filter(Boolean);

  // 1. Profile Extraction
  const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cleanedText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const githubMatch = cleanedText.match(/https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = cleanedText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);

  // Candidate Name: usually top line or near top
  let candidateName = lines[0] || "Imported User";
  if (candidateName.includes("@") || candidateName.length > 50) {
    candidateName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  }

  // Candidate Headline & Bio
  const headline = "Software Developer & Researcher";
  const bioLines: string[] = [];
  let inBio = false;

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.includes("summary") || lower.includes("about") || lower.includes("profile")) {
      inBio = true;
      return;
    }
    if (inBio) {
      if (lower.includes("experience") || lower.includes("education") || lower.includes("skills") || lower.includes("projects")) {
        inBio = false;
        return;
      }
      if (line.length > 10 && !line.includes("@")) {
        bioLines.push(line);
      }
    }
  });

  const profile = {
    full_name: candidateName,
    headline,
    bio: bioLines.join(" ").slice(0, 500) || "Experienced professional with background in software development and technology.",
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    github_url: githubMatch ? githubMatch[0] : undefined,
    linkedin_url: linkedinMatch ? linkedinMatch[0] : undefined,
    uncertain: !emailMatch || candidateName === "Imported User",
    selected: true,
  };

  // 2. Skills Extraction
  const extractedSkills: ImportedSkill[] = [];
  const skillSet = new Set<string>();

  KNOWN_SKILLS.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(cleanedText)) {
      skillSet.add(skill);
    }
  });

  Array.from(skillSet).forEach((skillName, index) => {
    extractedSkills.push({
      id: `skill-${index + 1}`,
      name: skillName,
      category: "Technical",
      uncertain: false,
      selected: true,
    });
  });

  // 3. Education Extraction
  const extractedEducation: ImportedEducation[] = [];
  const eduKeywords = ["university", "college", "institute", "bachelor", "master", "phd", "degree", "b.s.", "m.s.", "b.tech", "m.tech"];
  
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (eduKeywords.some(kw => lower.includes(kw))) {
      let degree = "Bachelor of Science";
      if (lower.includes("master") || lower.includes("m.s.") || lower.includes("m.tech")) {
        degree = "Master of Science";
      } else if (lower.includes("phd") || lower.includes("doctor")) {
        degree = "Doctor of Philosophy (Ph.D.)";
      } else if (lower.includes("bachelor") || lower.includes("b.s.") || lower.includes("b.tech")) {
        degree = "Bachelor of Technology / Science";
      }

      const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/g);
      const start_year = yearMatch && yearMatch[0] ? parseInt(yearMatch[0], 10) : 2020;
      const end_year = yearMatch && yearMatch[1] ? parseInt(yearMatch[1], 10) : start_year + 4;

      extractedEducation.push({
        id: `edu-${idx + 1}`,
        institution: line.slice(0, 80),
        degree,
        start_year,
        end_year,
        uncertain: !yearMatch,
        selected: true,
      });
    }
  });

  // 4. Experience Extraction
  const extractedExperience: ImportedExperience[] = [];
  let expCount = 0;
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if ((lower.includes("developer") || lower.includes("engineer") || lower.includes("intern") || lower.includes("manager") || lower.includes("lead")) && (lower.includes("at ") || lower.includes(" - ") || lower.includes("|"))) {
      expCount++;
      const parts = line.split(/[-|@]|at /i);
      const position = parts[0]?.trim() || "Software Engineer";
      const company = parts[1]?.trim() || "Tech Organization";

      extractedExperience.push({
        id: `exp-${expCount}`,
        position,
        company,
        start_date: "2022-01",
        end_date: "Present",
        is_current: true,
        description: lines[idx + 1] ? lines[idx + 1].slice(0, 200) : "Developed software solutions and collaborated with cross-functional teams.",
        uncertain: parts.length < 2,
        selected: true,
      });
    }
  });

  // 5. Projects Extraction
  const extractedProjects: ImportedProject[] = [];
  let projCount = 0;
  lines.forEach((line, idx) => {
    if (line.toLowerCase().startsWith("project:") || line.toLowerCase().startsWith("project ") || (idx > 0 && lines[idx - 1].toLowerCase().includes("projects"))) {
      projCount++;
      const title = line.replace(/project:?/i, "").trim() || `Imported Project ${projCount}`;
      const desc = lines[idx + 1] ? lines[idx + 1] : "Project created and extracted from imported resume.";
      
      extractedProjects.push({
        id: `proj-${projCount}`,
        title,
        short_description: desc.slice(0, 150),
        detailed_description: desc,
        technologies: ["TypeScript", "React", "Node.js"],
        duplicate_status: "none",
        uncertain: title.length < 3,
        selected: true,
      });
    }
  });

  // 6. Research Extraction
  const extractedResearch: ImportedResearch[] = [];
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (lower.includes("paper") || lower.includes("publication") || lower.includes("journal") || lower.includes("conference") || lower.includes("ieee") || lower.includes("arxiv")) {
      extractedResearch.push({
        id: `res-${idx + 1}`,
        title: line.slice(0, 100),
        venue_or_journal: "International Journal / Conference",
        publication_year: 2024,
        abstract: lines[idx + 1] ? lines[idx + 1].slice(0, 250) : "Research focus on software engineering and automated systems.",
        uncertain: true,
        selected: true,
      });
    }
  });

  // 7. Achievements Extraction
  const extractedAchievements: ImportedAchievement[] = [];
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (lower.includes("award") || lower.includes("winner") || lower.includes("hackathon") || lower.includes("first place") || lower.includes("scholarship")) {
      extractedAchievements.push({
        id: `ach-${idx + 1}`,
        title: line.slice(0, 80),
        description: "Recognized for outstanding technical performance and achievement.",
        year: "2024",
        uncertain: false,
        selected: true,
      });
    }
  });

  // 8. Certifications Extraction
  const extractedCertifications: ImportedCertification[] = [];
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    if (lower.includes("certified") || lower.includes("certification") || lower.includes("aws certified") || lower.includes("coursera") || lower.includes("udemy")) {
      extractedCertifications.push({
        id: `cert-${idx + 1}`,
        name: line.slice(0, 80),
        issuing_organization: lower.includes("aws") ? "Amazon Web Services" : "Professional Institute",
        issue_year: "2024",
        uncertain: false,
        selected: true,
      });
    }
  });

  // 9. Social Links Extraction
  const extractedSocials: ImportedSocial[] = [];
  if (githubMatch) {
    extractedSocials.push({ id: "soc-1", platform: "GitHub", url: githubMatch[0], selected: true });
  }
  if (linkedinMatch) {
    extractedSocials.push({ id: "soc-2", platform: "LinkedIn", url: linkedinMatch[0], selected: true });
  }

  return {
    source: "resume",
    raw_file_name: filename,
    profile,
    skills: extractedSkills,
    education: extractedEducation,
    experience: extractedExperience,
    projects: extractedProjects,
    research: extractedResearch,
    achievements: extractedAchievements,
    certifications: extractedCertifications,
    socials: extractedSocials,
  };
}
