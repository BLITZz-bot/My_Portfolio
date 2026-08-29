export type AdminTab = "settings" | "projects" | "ongoing" | "experience" | "comments";

export interface ProjectFormData {
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  gallery: string;
  technologies: string;
  link: string;
  github: string;
}

export interface ExperienceFormData {
  company: string;
  role: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  skills: string;
  company_logo: string;
  company_url: string;
}
