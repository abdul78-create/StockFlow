import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // required for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject Workspace ID from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
    if (activeWorkspaceId) {
      config.headers["x-organization-id"] = activeWorkspaceId;
    }
  }
  return config;
});

// Response Interceptor: Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Trigger token refresh if 401 is encountered and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post("/api/v1/auth/refresh", {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Clear state and redirect to login if refresh fails
        if (typeof window !== "undefined") {
          localStorage.removeItem("activeWorkspaceId");
          if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
