import { api } from "../../services/api"

export const loginAPI = (data: any) =>
  api.post('/auth/staff/login', data)

export const logoutAPI = () => 
  api.post('/auth/staff/logout')

export const meAPI = () => 
  api.get('/auth/staff/me')

export const uploadAvatarAPI = (data: FormData) =>
  api.post("/auth/staff/upload-avatar", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });