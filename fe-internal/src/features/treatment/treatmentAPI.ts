import { api } from "../../services/api";

// ===== PACKAGES =====
export const getTreatmentPackagesAPI = () =>
  api.get("/treatment/packages");

// ===== DETAIL =====
export const getTreatmentDetailAPI = (packageId: number) =>
  api.get(`/treatment/package/${packageId}`);

// ===== SAVE =====
export const saveTreatmentPlanAPI = (packageId: number, data: any) =>
  api.put(`/treatment/package/${packageId}`, data);

// ===== SEARCH STEP =====
export const searchStepsAPI = (keyword: string) =>
  api.get(`/treatment/steps/search?q=${encodeURIComponent(keyword)}`);


// ===== SEARCH SESSION =====
export const searchSessionsAPI = (keyword: string) =>
  api.get(`/treatment/sessions/search?q=${encodeURIComponent(keyword)}`);

