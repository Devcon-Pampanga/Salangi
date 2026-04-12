import axios from "axios";

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? 'https://salangi-backend.onrender.com' : 'http://localhost:8000');
const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const API = axios.create({
  baseURL: baseUrl,
});

export const registerUser = async (data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) => {
  const response = await API.post("/api/auth/register", data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await API.post("/api/auth/login", data);
  return response.data;
};