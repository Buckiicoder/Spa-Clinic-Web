import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://spa-clinic-web.onrender.com',
  withCredentials: true
})
