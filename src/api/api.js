import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: "https://chat-backend-6r6t.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
