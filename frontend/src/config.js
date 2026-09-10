// Central API configuration
// Change BACKEND_URL here to switch between local tunnel and ngrok
// Local (SSH tunnel):  http://localhost:8000
// Ngrok public:        https://your-ngrok-url.ngrok-free.app

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default BACKEND_URL;
