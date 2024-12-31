import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const { token, user } = response.data;
        setAuthToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        throw error.response?.data?.error || 'Login failed';
    }
};

const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
};

const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Registration failed';
    }
};

const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_URL}/me`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to get user data';
    }
};

const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to update user';
    }
};

const getUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data.users;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to get users';
    }
};

// Initialize auth token from localStorage
const token = localStorage.getItem('token');
if (token) {
    setAuthToken(token);
}

const authService = {
    login,
    logout,
    register,
    getCurrentUser,
    updateUser,
    getUsers,
    setAuthToken
};

export default authService; 