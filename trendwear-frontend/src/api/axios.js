import axios from "axios";

// Centralized so every page hits the same base URL (configurable per
// environment) and carries the JWT automatically instead of each page
// hardcoding http://localhost:5000 and re-reading localStorage.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Small helper so callers can show a real message instead of "[object Object]".
export const apiErrorMessage = (error, fallback = "Something went wrong") =>
  error.response?.data?.message || error.message || fallback;

export default api;
