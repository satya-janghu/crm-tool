import axios from 'axios';

const API_URL = 'http://localhost:5000/api/settings';

const getSettings = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data.settings;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch settings';
    }
};

const getSetting = async (key) => {
    try {
        const response = await axios.get(`${API_URL}/${key}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch setting';
    }
};

const updateSettings = async (settings) => {
    try {
        const response = await axios.post(API_URL, settings);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to update settings';
    }
};

const initializeSettings = async () => {
    try {
        const response = await axios.post(`${API_URL}/initialize`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to initialize settings';
    }
};

const settingsService = {
    getSettings,
    getSetting,
    updateSettings,
    initializeSettings,
};

export default settingsService; 