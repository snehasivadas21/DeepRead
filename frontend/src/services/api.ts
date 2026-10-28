import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null,
) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const response = await api.request({
      url: endpoint,
      method: options.method ?? "GET",
      data: options.body,
      headers,
      signal: options.signal,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail || "Something went wrong",
      );
    }

    throw error;
  }
}
