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