import axios from 'axios';

// Create a base Axios instance for the API client
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});


export default apiClient;
