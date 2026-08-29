export interface Comment {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export interface PublicComment {
  id: string;
  name: string;
  role: string;
  designation?: string;
  content: string;
  approved?: boolean;
  created_at?: string;
}

export interface CommentFormData {
  name: string;
  email: string;
  role: string;
  designation?: string;
  content: string;
  user_id?: string;
}
