import { PortfolioData } from "@/types/portfolio";
import { normalizePortfolioData } from "@/utilities/portfolio-adapter";

/**
 * Deterministic Sample Portfolio Data for Template Inspection & Previews
 * STRICT PRIVACY REQUIREMENT: This sample data does not contain real user data.
 */
export const SAMPLE_PORTFOLIO_DATA: PortfolioData = normalizePortfolioData({
  id: "sample-preview-portfolio",
  userId: "sample-user-id",
  title: "Alex Morgan - Sample Portfolio",
  slug: "alex-morgan-sample",
  status: "PUBLISHED",
  templateId: "developer",
  isPublished: true,
  isPublic: true,
  profile: {
    fullName: "Alex Morgan",
    headline: "Full Stack Engineer & Distributed Systems Developer",
    bio: "Passionate software engineering graduate building scalable cloud services, open-source web platforms, and fault-tolerant algorithms.",
    detailedBio: "Passionate software engineering graduate building scalable cloud services, open-source web platforms, and fault-tolerant algorithms.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    location: "San Francisco, CA",
    email: "alex.morgan.sample@example.com",
    website: "https://alexmorgan.sample.dev",
    githubUrl: "https://github.com/alexmorgan-sample",
    linkedinUrl: "https://linkedin.com/in/alexmorgan-sample",
    twitterUrl: "https://twitter.com/alexmorgan_sample",
    isAvailableForWork: true,
  },
  skills: [
    { id: "sk-1", name: "TypeScript", category: "languages", proficiency: "expert" },
    { id: "sk-2", name: "React", category: "frontend", proficiency: "advanced" },
    { id: "sk-3", name: "Node.js", category: "backend", proficiency: "expert" },
    { id: "sk-4", name: "Rust", category: "languages", proficiency: "advanced" },
    { id: "sk-5", name: "PostgreSQL", category: "backend", proficiency: "advanced" },
    { id: "sk-6", name: "Docker", category: "devops", proficiency: "intermediate" },
  ],
  projects: [
    {
      id: "proj-1",
      title: "HyperMesh Distributed KV Store",
      shortDescription: "High-performance distributed key-value store with Raft consensus implementation in Rust.",
      detailedDescription: "Designed and implemented a distributed key-value storage engine using Raft consensus for state machine replication.",
      technologies: ["Rust", "Raft", "Tokio", "gRPC"],
      githubUrl: "https://github.com/alexmorgan-sample/hypermesh",
      liveDemoUrl: "https://hypermesh.sample.dev",
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: true,
    },
    {
      id: "proj-2",
      title: "Neural Vision Classifier",
      shortDescription: "Real-time edge computer vision model for automated medical imaging diagnostics.",
      detailedDescription: "Trained PyTorch convolutional neural networks for automated medical image analysis deployed on edge devices.",
      technologies: ["Python", "PyTorch", "ONNX", "FastAPI"],
      githubUrl: "https://github.com/alexmorgan-sample/neural-vision",
      liveDemoUrl: "https://neuralvision.sample.dev",
      status: "COMPLETED",
      isCurrent: false,
      isFeatured: true,
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "B.S. Computer Science",
      fieldOfStudy: "Artificial Intelligence & Systems",
      startYear: 2020,
      endYear: 2024,
      isCurrentStatus: false,
      cgpa: "3.92",
      description: "Dean's Honors List, Senior Thesis on Fault-Tolerant Distributed Consensus.",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "CloudScale Systems",
      role: "Software Engineering Intern",
      location: "San Francisco, CA",
      startDate: "2023-06",
      endDate: "2023-09",
      isCurrent: false,
      description: "Optimized database query latency by 35% across high-volume microservices using Redis caching layer.",
      technologies: ["TypeScript", "Node.js", "Redis", "PostgreSQL"],
    },
  ],
  research: [
    {
      id: "res-1",
      title: "Fault-Tolerant Consensus in Asynchronous Peer-to-Peer Networks",
      description: "Investigation of consensus overhead in sub-optimal network topologies.",
      researchArea: "Distributed Systems",
      technologies: ["Rust", "LaTeX", "Python"],
      publicationStatus: "published",
      venue: "ACM Symposium on Principles of Distributed Computing (PODC)",
      paperUrl: "https://example.com/papers/consensus-podc.pdf",
    },
  ],
  socialLinks: [
    { id: "soc-1", platform: "github", url: "https://github.com/alexmorgan-sample" },
    { id: "soc-2", platform: "linkedin", url: "https://linkedin.com/in/alexmorgan-sample" },
  ],
});
