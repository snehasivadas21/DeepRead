import { apiRequest } from "@/services/api";
import {UserProfile,ProfileUpdateData,} from "@/types/profile";

export async function getProfile(
  accessToken: string | null
): Promise<UserProfile> {
  return apiRequest(
    "/auth/profile",
    {
      method: "GET",
    },
    accessToken
  );
}

export async function updateProfile(
  data: ProfileUpdateData,
  accessToken: string | null
): Promise<UserProfile> {
  return apiRequest(
    "/auth/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    accessToken
  );
}