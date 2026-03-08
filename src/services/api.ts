import axios from "axios";
import { clearAuthToken, getAuthToken } from "./authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 10000);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  config.headers = config.headers ?? {};

  // attach auth token
  if (token) {
    if (typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // skip ngrok warning page
  if (typeof config.headers.set === "function") {
    config.headers.set("ngrok-skip-browser-warning", "true");
  } else {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // optional redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export { api, API_BASE_URL };