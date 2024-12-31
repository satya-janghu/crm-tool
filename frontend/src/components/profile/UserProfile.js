import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    Avatar,
    Snackbar,
    Alert,
} from '@mui/material';
import { Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import authService from '../../services/authService';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        calendly_link: '',
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    calendly_link: userData.calendly_link || '',
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                });
            } catch (error) {
                setNotification({
                    open: true,
                    message: 'Failed to fetch user data',
                    severity: 'error',
                });
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();
        try {
            const updateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                calendly_link: formData.calendly_link,
            };
            await authService.updateUser(user.id, updateData);
            
            // Update local storage user data
            const updatedUser = { ...user, ...updateData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setNotification({
                open: true,
                message: 'Profile updated successfully',
                severity: 'success',
            });
        } catch (error) {
            setNotification({
                open: true,
                message: error.toString(),
                severity: 'error',
            });
        }
    };

    const handlePasswordUpdate = async (event) => {
        event.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            setNotification({
                open: true,
                message: 'New passwords do not match',
                severity: 'error',
            });
            return;
        }

        try {
            await authService.updateUser(user.id, {
                current_password: formData.current_password,
                password: formData.new_password,
            });
            setFormData({
                ...formData,
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
            setNotification({
                open: true,
                message: 'Password updated successfully',
                severity: 'success',
            });
        } catch (error) {
            setNotification({
                open: true,
                message: error.toString(),
                severity: 'error',
            });
        }
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                            <PersonIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" component="h2">
                            Profile Settings
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Personal Information
                            </Typography>
                            <form onSubmit={handleProfileUpdate}>
                                <TextField
                                    fullWidth
                                    name="first_name"
                                    label="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    name="last_name"
                                    label="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    name="email"
                                    label="Email"
                                    value={formData.email}
                                    margin="normal"
                                    disabled
                                />
                                <TextField
                                    fullWidth
                                    name="calendly_link"
                                    label="Calendly Link"
                                    value={formData.calendly_link}
                                    onChange={handleChange}
                                    margin="normal"
                                    placeholder="https://calendly.com/your-link"
                                    helperText="Add your Calendly link to use in email communications"
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    sx={{ mt: 2 }}
                                >
                                    Save Changes
                                </Button>
                            </form>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                Change Password
                            </Typography>
                            <form onSubmit={handlePasswordUpdate}>
                                <TextField
                                    fullWidth
                                    name="current_password"
                                    label="Current Password"
                                    type="password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    name="new_password"
                                    label="New Password"
                                    type="password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    fullWidth
                                    name="confirm_password"
                                    label="Confirm New Password"
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<SaveIcon />}
                                    sx={{ mt: 2 }}
                                >
                                    Update Password
                                </Button>
                            </form>
                        </Grid>
                    </Grid>
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

export default UserProfile; 