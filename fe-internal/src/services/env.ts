export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://api.spaclinic.online/api"
    : "http://localhost:5000/api";

export const SOCKET_URL =
  import.meta.env.MODE === "production"
    ? "https://api.spaclinic.online"
    : "http://localhost:5000";