import axios from 'axios'

export const api = axios.create({
  // local url
  // baseURL: 'http://localhost:5000/api',
  
  baseURL: 'https://spa-clinic-web.onrender.com',
  withCredentials: true
})
