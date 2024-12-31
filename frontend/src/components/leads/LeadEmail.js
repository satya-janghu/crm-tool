import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Send as SendIcon, Link as LinkIcon } from '@mui/icons-material';
import { RESPONSE_TYPES } from '../../constants/leadConstants';
import leadService from '../../services/leadService';

const LeadEmail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(false);
    const [emailData, setEmailData] = useState({
        subject: '',
        content: '',
        response_type: '',
        scheduled_follow_up: '',
    });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const contentRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const leadData = await leadService.getLead(id);
                setLead(leadData);
            } catch (error) {
                setNotification({
                    open: true,
                    message: 'Failed to fetch lead data',
                    severity: 'error'
                });
            }
        };
        fetchLead();
    }, [id]);

    const handleChange = (event) => {
        setEmailData({
            ...emailData,
            [event.target.name]: event.target.value,
        });
    };

    const insertCalendlyLink = () => {
        if (!user.calendly_link) {
            setNotification({
                open: true,
                message: 'Please add your Calendly link in your profile first',
                severity: 'warning',
            });
            return;
        }

        const textArea = contentRef.current;
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = emailData.content;
        const newText = text.substring(0, start) + user.calendly_link + text.substring(end);
        
        setEmailData({
            ...emailData,
            content: newText,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await leadService.sendEmail(id, emailData);
            setNotification({
                open: true,
                message: 'Email sent successfully',
                severity: 'success',
            });
            navigate(`/leads/${id}`);
        } catch (error) {
            setNotification({
                open: true,
                message: error.toString(),
                severity: 'error',
            });
            setLoading(false);
        }
    };

    if (!lead) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Send Email to {lead.name}
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="subject"
                            label="Subject"
                            value={emailData.subject}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />

                        <Box sx={{ position: 'relative', mt: 2 }}>
                            <TextField
                                fullWidth
                                name="content"
                                label="Content"
                                multiline
                                rows={12}
                                value={emailData.content}
                                onChange={handleChange}
                                inputRef={contentRef}
                                required
                            />
                            <Button
                                variant="outlined"
                                startIcon={<LinkIcon />}
                                onClick={insertCalendlyLink}
                                sx={{ position: 'absolute', top: -8, right: 0 }}
                            >
                                Insert Calendly Link
                            </Button>
                        </Box>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Response Type Expected</InputLabel>
                            <Select
                                name="response_type"
                                value={emailData.response_type}
                                onChange={handleChange}
                                label="Response Type Expected"
                            >
                                {Object.entries(RESPONSE_TYPES).map(([value, { label }]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            name="scheduled_follow_up"
                            label="Schedule Follow-up"
                            type="datetime-local"
                            value={emailData.scheduled_follow_up}
                            onChange={handleChange}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/leads/${id}`)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Email'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default LeadEmail; 