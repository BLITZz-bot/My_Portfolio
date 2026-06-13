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
}

export const projects: Project[] = [];
