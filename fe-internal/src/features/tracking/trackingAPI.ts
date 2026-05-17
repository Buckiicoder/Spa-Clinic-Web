import { api } from "../../services/api";

/**
 * ============================================
 * 🔹 START SESSION
 * ============================================
 */
export const startTrackingSessionAPI = (
  id: number,
) =>
  api.patch(`/tracking/session/${id}/start`);

/**
 * ============================================
 * 🔹 COMPLETE STEP
 * ============================================
 */
export const completeStepTrackingAPI = (
  id: number,
  current_step_no: number,
) =>
  api.patch(
    `/tracking/session/${id}/step/complete`,
    {
      current_step_no,
    },
  );

/**
 * ============================================
 * 🔹 PAUSE SESSION
 * ============================================
 */
export const pauseTrackingSessionAPI = (
  id: number,
) =>
  api.patch(`/tracking/session/${id}/pause`);

/**
 * ============================================
 * 🔹 RESUME SESSION
 * ============================================
 */
export const resumeTrackingSessionAPI = (
  id: number,
) =>
  api.patch(`/tracking/session/${id}/resume`);

/**
 * ============================================
 * 🔹 TRANSFER SESSION
 * ============================================
 */
export const transferTrackingSessionAPI = (
  id: number,
) =>
  api.patch(`/tracking/session/${id}/transfer`);

/**
 * ============================================
 * 🔹 COMPLETE SESSION
 * ============================================
 */
export const completeTrackingSessionAPI = (
  id: number,
  data: any,
) =>
  api.patch(
    `/tracking/session/${id}/complete`,
    data,
  );

/**
 * ============================================
 * 🔹 REALTIME DETAIL
 * ============================================
 */
export const getRealtimeTrackingDetailAPI = (
  id: number,
) =>
  api.get(`/tracking/session/${id}/realtime`);