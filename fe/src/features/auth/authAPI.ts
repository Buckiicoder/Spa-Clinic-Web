import { api } from '../../services/api'

export const loginAPI = (data: any) =>
  api.post('/auth/customer/login', data)

export const registerAPI = (data: any) =>
  api.post('/auth/customer/register', data)

export const logoutAPI = () => 
  api.post('/auth/customer/logout')

export const meAPI = () => 
  api.get('/auth/customer/me')

export const uploadAvatarAPI = (data: FormData) =>
  api.post("/auth/customer/upload-avatar", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getPendingRatingsAPI = () =>
  api.get("/auth/customer/pending-ratings");

export const getCustomerRatingsAPI = () =>
  api.get("/auth/customer/ratings");

export const rateSessionAPI = (data: {
  sessionId: number;
  rating: number;
  feedback?: string;
}) =>
  api.post(
    "/auth/customer/rate-session",
    data
  );