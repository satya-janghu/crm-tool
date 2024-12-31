import React, { useState } from 'react';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Container,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    first_name: Yup.string()
        .required('First name is required'),
    last_name: Yup.string()
        .required('Last name is required'),
    role: Yup.string()
        .oneOf(['admin', 'team_member'], 'Invalid role')
        .required('Role is required')
});

const UserRegistration = () => {
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'team_member'
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                await authService.register(values);
                setNotification({
                    open: true,
                    message: 'User registered successfully',
                    severity: 'success'
                });
                resetForm();
            } catch (err) {
                setNotification({
                    open: true,
                    message: err.toString(),
                    severity: 'error'
                });
            }
        },
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ padding: 4 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Register New User
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            id="first_name"
                            name="first_name"
                            label="First Name"
                            value={formik.values.first_name}
                            onChange={formik.handleChange}
                            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                            helperText={formik.touched.first_name && formik.errors.first_name}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            id="last_name"
                            name="last_name"
                            label="Last Name"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                            helperText={formik.touched.last_name && formik.errors.last_name}
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formik.values.role}
                                label="Role"
                                onChange={formik.handleChange}
                                error={formik.touched.role && Boolean(formik.errors.role)}
                            >
                                <MenuItem value="team_member">Team Member</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={formik.isSubmitting}
                        >
                            Register User
                        </Button>
                    </form>
                </Paper>
            </Box>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UserRegistration; 