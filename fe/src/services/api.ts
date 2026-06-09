import axios from "axios";
import { API_URL } from "./env";

export const api = axios.create({
  // baseURL:
  //   import.meta.env.MODE === "production"
  //     ? "https://api.spaclinic.online/api"
  //     : "http://localhost:5000/api",
   baseURL: API_URL,

  withCredentials: true,
});