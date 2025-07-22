import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Function to get current auth token from localStorage
export function getStoredToken(): string | null {
  try {
    const storedTokens = localStorage.getItem("gym-tracker-tokens");
    if (storedTokens) {
      const parsed = JSON.parse(storedTokens);
      return parsed.token || null;
    }
  } catch (error) {
    console.error("Failed to get stored token:", error);
  }
  return null;
}

// Set up request interceptor to automatically add token
apiClient.interceptors.request.use(
  (config) => {
    // Log the request URL for debugging
    console.info(`<${config.method?.toUpperCase()}> - ${config.url}`);
    // If no auth header is set, try to get token from storage
    if (!config.headers.Authorization) {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set up response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear storage and redirect to login
      console.log("Received 401, clearing tokens and redirecting to login");
      localStorage.removeItem("gym-tracker-tokens");

      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
