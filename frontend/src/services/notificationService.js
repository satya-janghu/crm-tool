import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getNotifications = async (status = 'unread') => {
    try {
        const response = await axios.get(API_URL, { params: { status } });
        return response.data.notifications;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch notifications';
    }
};

const markAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_URL}/${notificationId}/mark-as-read`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to mark notification as read';
    }
};

const dismissNotification = async (notificationId) => {
    try {
        const response = await axios.put(`${API_URL}/${notificationId}/dismiss`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to dismiss notification';
    }
};

const checkFollowUps = async () => {
    try {
        const response = await axios.get(`${API_URL}/check-follow-ups`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to check follow-ups';
    }
};

const notificationService = {
    getNotifications,
    markAsRead,
    dismissNotification,
    checkFollowUps,
};

export default notificationService; 