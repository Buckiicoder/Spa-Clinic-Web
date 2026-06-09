export const SERVER_URL =
  import.meta.env.MODE === "production"
    ? "https://api.spaclinic.online"
    : "http://localhost:5000";

export const API_URL = `${SERVER_URL}/api`;

export const SOCKET_URL = SERVER_URL;