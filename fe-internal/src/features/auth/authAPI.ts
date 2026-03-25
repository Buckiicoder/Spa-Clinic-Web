import { api } from "../../services/api"

export const loginAPI = (data: any) =>
  api.post('/auth/login/staff', data)

export const logoutAPI = () => 
  api.post('/auth/logout/staff')

export const meAPI = () => 
  api.get('/auth/me')

export const uploadAvatarAPI = (data: FormData) =>
  api.post("/auth/upload-avatar", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });