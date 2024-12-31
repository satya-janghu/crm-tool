import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import settingsService from '../../services/settingsService';

const Settings = () => {
    const [settings, setSettings] = useState({
        global_email: '',
        global_email_name: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            await settingsService.initializeSettings();
            const fetchedSettings = await settingsService.getSettings();
            const settingsObj = {};
            fetchedSettings.forEach(setting => {
                settingsObj[setting.key] = setting.value;
            });
            setSettings(settingsObj);
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.toString()
            });
        }
        setLoading(false);
    };

    const handleChange = (event) => {
        setSettings({
            ...settings,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            setNotification({
                type: 'success',
                message: 'Settings updated successfully'
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.toString()
            });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Global Settings
                    </Typography>
                    
                    <Divider sx={{ my: 3 }} />

                    {notification && (
                        <Alert 
                            severity={notification.type}
                            onClose={() => setNotification(null)}
                            sx={{ mb: 3 }}
                        >
                            {notification.message}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Email Settings
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="Global Email Address"
                            name="global_email"
                            value={settings.global_email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            helperText="This email will be used to send all system emails"
                        />

                        <TextField
                            fullWidth
                            label="Email Display Name"
                            name="global_email_name"
                            value={settings.global_email_name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            helperText="Name that will appear as the sender of emails"
                        />

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Settings; 