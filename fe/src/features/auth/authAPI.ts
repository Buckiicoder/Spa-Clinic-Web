import { api } from '../../services/api'

export const loginAPI = (data: any) =>
  api.post('/auth/login/customer', data)

export const registerAPI = (data: any) =>
  api.post('/auth/register', data)

export const logoutAPI = () => 
  api.post('/auth/logout')

export const meAPI = () => 
  api.get('/auth/me')

export const uploadAvatarAPI = (data: FormData) =>
  api.post("/auth/upload-avatar", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });