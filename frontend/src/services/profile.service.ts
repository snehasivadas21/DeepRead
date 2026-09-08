import { apiRequest } from "@/services/api";
import {
  UserProfile,
  ProfileUpdateData,
} from "@/types/profile";

export async function getProfile(): Promise<UserProfile> {
  return apiRequest("/auth/profile", {
    method: "GET",
  });
}

export async function updateProfile(
  data: ProfileUpdateData
): Promise<UserProfile> {
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

