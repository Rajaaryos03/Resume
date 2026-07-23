export type BlogStatus = "draft" | "published" | "scheduled";
export type ContentStatus = "published" | "hidden";
export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship"
  | "volunteer";
export type CertCategory =
  | "Microsoft"
  | "Power Platform"
  | "Cloud"
  | "AI"
  | "Other";
export type BlogCategory =
  | "Power Platform"
  | "Power Apps"
  | "Power Automate"
  | "Dataverse"
  | "Copilot Studio"
  | "SharePoint"
  | "Productivity"
  | "AI Agent"
  | "Tutorial";

export interface Profile {
  id: string;
  fullName: string;
  professionalTitle: string;
  shortBio: string;
  longDescription: string;
  email: string;
  location?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  microsoftLearnUrl?: string;
  profileImageUrl?: string;
  availabilityStatus?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  coverImageUrl?: string;
  status: BlogStatus;
  publishedAt?: string;
  scheduledAt?: string;
  viewCount: number;
  seriesId?: string;
  seriesOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  roleTitle: string;
  company: string;
  employmentType?: EmploymentType;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  status: ContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateName: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  category?: CertCategory;
  certificateImageUrl?: string;
  description?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  displayName: string;
  version?: string;
  isActive: boolean;
  uploadedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  demoUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
  featured: boolean;
  status: ContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogSeries {
  id: string;
  title: string;
  description?: string;
  slug: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogSeriesWithPosts extends BlogSeries {
  posts: Pick<Blog, "id" | "title" | "slug" | "publishedAt" | "seriesOrder">[];
}
