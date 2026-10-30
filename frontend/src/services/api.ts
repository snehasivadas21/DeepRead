import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null,
) {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (isFormData) {
    delete headers["Content-Type"];
  } else if (options.body) {
    headers["Content-Type"] = "application/json";
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
