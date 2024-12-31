import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import leadService from '../../services/leadService';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    company_name: Yup.string().required('Company name is required'),
    industry: Yup.string().required('Industry is required'),
});

const LeadForm = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            company_name: '',
            industry: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await leadService.createLead(values);
                navigate(`/leads/${response.lead.id}`);
            } catch (error) {
                console.error('Failed to create lead:', error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Add New Lead
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
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
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="company_name"
                                    name="company_name"
                                    label="Company Name"
                                    value={formik.values.company_name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                                    helperText={formik.touched.company_name && formik.errors.company_name}
                                    margin="normal"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="industry"
                                    name="industry"
                                    label="Industry"
                                    value={formik.values.industry}
                                    onChange={formik.handleChange}
                                    error={formik.touched.industry && Boolean(formik.errors.industry)}
                                    helperText={formik.touched.industry && formik.errors.industry}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/leads')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={formik.isSubmitting}
                            >
                                Add Lead
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default LeadForm; 