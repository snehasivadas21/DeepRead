export interface UserProfile {
  user_id: number;
  name: string;
  profile_image: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  name: string;
  profile_image: string | null;
}

