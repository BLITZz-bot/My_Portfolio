export interface SettingsData {
  about_text: string;
  projects_built: number;
  hackathons_won: number;
  awards_won: number;
  location?: string;
  location_status?: string;
  skills: string[];
  vision_text: string;
  resume_url?: string;
}

export interface SettingsFormData {
  about_text?: string;
  projects_built?: number;
  hackathons_won?: number;
  awards_won?: number;
  location?: string;
  location_status?: string;
  skills?: string[];
  vision_text?: string;
  resume_url?: string;
}
