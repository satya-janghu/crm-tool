import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leads';

const createLead = async (leadData) => {
    try {
        const response = await axios.post(API_URL, leadData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to create lead';
    }
};

const getLeads = async (params = {}) => {
    try {
        const response = await axios.get(API_URL, { params });
        return response.data.leads;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch leads';
    }
};

const getLead = async (leadId) => {
    try {
        const response = await axios.get(`${API_URL}/${leadId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch lead';
    }
};

const updateLead = async (leadId, leadData) => {
    try {
        const response = await axios.put(`${API_URL}/${leadId}`, leadData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to update lead';
    }
};

const addNote = async (leadId, content) => {
    try {
        const response = await axios.post(`${API_URL}/${leadId}/notes`, { content });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to add note';
    }
};

const getNotes = async (leadId) => {
    try {
        const response = await axios.get(`${API_URL}/${leadId}/notes`);
        return response.data.notes;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch notes';
    }
};

const logEmail = async (leadId, emailData) => {
    try {
        const response = await axios.post(`${API_URL}/${leadId}/emails`, emailData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to log email';
    }
};

const getEmails = async (leadId) => {
    try {
        const response = await axios.get(`${API_URL}/${leadId}/emails`);
        return response.data.emails;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to fetch emails';
    }
};

const searchLeads = async (searchParams) => {
    try {
        const response = await axios.get(API_URL, { params: searchParams });
        return response.data.leads;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to search leads';
    }
};

const sendEmail = async (leadId, emailData) => {
    try {
        const response = await axios.post(`${API_URL}/${leadId}/send-email`, emailData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Failed to send email';
    }
};

const leadService = {
    createLead,
    getLeads,
    getLead,
    updateLead,
    addNote,
    getNotes,
    logEmail,
    getEmails,
    searchLeads,
    sendEmail
};

export default leadService; 