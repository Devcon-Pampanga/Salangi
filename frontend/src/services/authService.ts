import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
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