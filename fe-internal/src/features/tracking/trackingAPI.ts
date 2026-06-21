import { api } from "../../services/api";

/**
 * ============================================
 * 🔹 START SESSION
 * ============================================
 */
export const startTrackingSessionAPI = (
  id: number,
  before_image_url?: string,
) =>
  api.patch(`/tracking/session/${id}/start`, {
    before_image_url,
  });

/**
 * ============================================
 * 🔹 COMPLETE STEP
 * ============================================
 */
export const completeStepTrackingAPI = (id: number, current_step_no: number) =>
  api.patch(`/tracking/session/${id}/step/complete`, {
    current_step_no,
  });

/**
 * ============================================
 * 🔹 PAUSE SESSION
 * ============================================
 */
export const pauseTrackingSessionAPI = (id: number) =>
  api.patch(`/tracking/session/${id}/pause`);

/**
 * ============================================
 * 🔹 RESUME SESSION
 * ============================================
 */
export const resumeTrackingSessionAPI = (id: number) =>
  api.patch(`/tracking/session/${id}/resume`);

/**
 * ============================================
 * 🔹 TRANSFER SESSION
 * ============================================
 */
export const transferTrackingSessionAPI = (id: number) =>
  api.patch(`/tracking/session/${id}/transfer`);

/**
 * ============================================
 * 🔹 COMPLETE SESSION
 * ============================================
 */
export const completeTrackingSessionAPI = (id: number, data: any) =>
  api.patch(`/tracking/session/${id}/complete`, data);

/**
 * ============================================
 * 🔹 REALTIME DETAIL
 * ============================================
 */
export const getRealtimeTrackingDetailAPI = (id: number) =>
  api.get(`/tracking/session/${id}/realtime`);

export const checkPauseTimeoutAPI = (id: number) =>
  api.get(`/tracking/session/${id}/check-pause`);

export const stopAfterPauseTimeoutAPI = (id: number) =>
  api.post(`/tracking/session/${id}/stop-after-pause`);

export const uploadTrackingImageAPI = (file: File) => {
  const formData = new FormData();

  formData.append("image", file);

  return api.post(
    "/tracking/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};