// Central API configuration
// Change BACKEND_URL here to switch between local tunnel and ngrok
// Local (SSH tunnel):  http://localhost:8000
// Ngrok public:        https://your-ngrok-url.ngrok-free.app

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// Use this instead of raw fetch() so ngrok CORS headers are always included
export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(options.headers || {})
  };
  return fetch(`${BACKEND_URL}${path}`, { ...options, headers });
}

export default BACKEND_URL;
