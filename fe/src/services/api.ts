import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? "https://api.spaclinic.online/api"
      : "http://localhost:5000/api",

  withCredentials: true,
});