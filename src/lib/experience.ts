export interface Experience {
  id: string;
  company: string;
  role: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  skills: string[];
  company_logo: string | null;
  company_url: string | null;
  created_at?: string;
}
