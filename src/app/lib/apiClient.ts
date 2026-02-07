import axios from "axios";
import { Capacitor } from "@capacitor/core";

// Determine API URL based on environment
function getApiUrl() {
  // Priority 1: Capacitor-specific URL (for mobile development)
  if (import.meta.env.VITE_CAPACITOR_API_URL && Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_CAPACITOR_API_URL;
  }

  // Priority 2: General API URL (for web and production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Priority 3: Default (web development only)
  if (!Capacitor.isNativePlatform()) {
    return 'http://localhost:8080';
  }

  // Error case: Running on native platform without configuration
  throw new Error(
    'VITE_CAPACITOR_API_URL must be set when running on mobile devices. ' +
    'Create a .env.local file with your development machine IP address.'
  );
}

const API_URL = getApiUrl();
console.log('[API Client] Using API URL:', API_URL);

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
      console.info("Received 401, clearing tokens and redirecting to login");
      localStorage.removeItem("gym-tracker-tokens");

      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
