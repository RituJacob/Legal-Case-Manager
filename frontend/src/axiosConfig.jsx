import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: 'http://52.63.144.39', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
