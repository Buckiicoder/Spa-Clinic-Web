import { api } from "../../services/api";

export const getMyServiceHistoryAPI = () =>
  api.get("/customer/me/service-history");