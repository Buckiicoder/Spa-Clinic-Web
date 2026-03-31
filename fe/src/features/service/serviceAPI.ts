import { api } from "../../services/api";

export const getServicesAPI = () =>
  api.get("/service/getServices");
