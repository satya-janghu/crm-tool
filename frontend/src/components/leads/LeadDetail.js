import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Box,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Email as EmailIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import leadService from '../../services/leadService';
import Notes from './Notes';
import ActivityLog from './ActivityLog';

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            const leadData = await leadService.getLead(id);
            setLead(leadData);
        } catch (error) {
            console.error('Failed to fetch lead:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!lead) {
        return (
            <Typography variant="h6" align="center">
                Lead not found
            </Typography>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                {/* Lead Header */}
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" component="h1" gutterBottom>
                                {lead.name}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                {lead.company_name} • {lead.industry}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                {lead.email}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                <Button
                                    variant="contained"
                                    startIcon={<EmailIcon />}
                                    onClick={() => navigate(`/leads/${id}/email`)}
                                >
                                    Send Email
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => navigate(`/leads/${id}/edit`)}
                                >
                                    Edit
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Status
                            </Typography>
                            <Chip
                                label={lead.status}
                                color={lead.status === 'active' ? 'success' : 'default'}
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Assigned To
                            </Typography>
                            <Typography variant="body1">
                                {lead.assigned_to_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Last Contact
                            </Typography>
                            <Typography variant="body1">
                                {lead.last_contact_date ? format(new Date(lead.last_contact_date), 'MMM d, yyyy') : 'Never'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Next Follow-up
                            </Typography>
                            <Typography variant="body1">
                                {lead.next_follow_up ? format(new Date(lead.next_follow_up), 'MMM d, yyyy') : 'Not scheduled'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Notes and Activity Log */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Notes leadId={id} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ActivityLog leadId={id} />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default LeadDetail; 