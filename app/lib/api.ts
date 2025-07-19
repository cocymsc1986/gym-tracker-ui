import { getValidToken, clearAuthToken } from "./auth";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const API_URL = import.meta.env.VITE_API_URL || "";
  const token = await getValidToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = "/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP Error: ${response.status}`);
  }

  return response;
}

export async function apiGet(endpoint: string) {
  const response = await apiRequest(endpoint, { method: "GET" });
  return response.json();
}

export async function apiPost(endpoint: string, data: any) {
  const response = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiPut(endpoint: string, data: any) {
  const response = await apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiDelete(endpoint: string) {
  const response = await apiRequest(endpoint, { method: "DELETE" });
  return response.json();
}