export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  gallery: string[];
  description: string;
  technologies: string[];
  link: string;
  github: string;
  created_at?: string;
  sort_order?: number;
}

export interface ParsedFeature {
  icon?: string;
  badge?: string;
  title: string;
  description: string;
}
