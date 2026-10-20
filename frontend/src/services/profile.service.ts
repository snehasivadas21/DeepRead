import { apiRequest } from "@/services/api";
import {UserProfile} from "@/types/profile";

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
  data: FormData,
  accessToken: string | null
): Promise<UserProfile> {
  return apiRequest(
    "/auth/profile",
    {
      method: "PUT",
      body: data,
    },
    accessToken
  );
}