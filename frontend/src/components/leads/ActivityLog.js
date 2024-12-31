import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Email as EmailIcon,
    Event as EventIcon,
    Note as NoteIcon,
    CheckCircle as StatusIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import leadService from '../../services/leadService';

const ActivityLog = ({ leadId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, [leadId]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            // Fetch emails, notes, and other activities
            const [emails, notes] = await Promise.all([
                leadService.getEmails(leadId),
                leadService.getNotes(leadId),
            ]);

            // Combine and sort activities by date
            const allActivities = [
                ...emails.map(email => ({
                    type: 'email',
                    data: email,
                    date: new Date(email.sent_at),
                })),
                ...notes.map(note => ({
                    type: 'note',
                    data: note,
                    date: new Date(note.created_at),
                })),
            ].sort((a, b) => b.date - a.date);

            setActivities(allActivities);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        }
        setLoading(false);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'email':
                return <EmailIcon color="primary" />;
            case 'meeting':
                return <EventIcon color="secondary" />;
            case 'note':
                return <NoteIcon color="action" />;
            case 'status':
                return <StatusIcon color="success" />;
            default:
                return null;
        }
    };

    const renderActivityContent = (activity) => {
        switch (activity.type) {
            case 'email':
                return (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2">
                                {activity.data.direction === 'sent' ? 'Sent email to' : 'Received email from'} {activity.data.to || activity.data.from}
                            </Typography>
                            {activity.data.response_type && (
                                <Chip
                                    label={activity.data.response_type}
                                    size="small"
                                    color={activity.data.response_type === 'positive' ? 'success' : 'default'}
                                />
                            )}
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                            Subject: {activity.data.subject}
                        </Typography>
                    </>
                );
            case 'note':
                return (
                    <Typography variant="body2">
                        {activity.data.content}
                    </Typography>
                );
            default:
                return null;
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Activity Log
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {activities.map((activity, index) => (
                        <React.Fragment key={`${activity.type}-${index}`}>
                            {index > 0 && <Divider />}
                            <ListItem alignItems="flex-start">
                                <ListItemIcon>
                                    {getActivityIcon(activity.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={renderActivityContent(activity)}
                                    secondary={
                                        <>
                                            {activity.data.user_name} • {format(activity.date, 'MMM d, yyyy h:mm a')}
                                        </>
                                    }
                                />
                            </ListItem>
                        </React.Fragment>
                    ))}
                    {activities.length === 0 && (
                        <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                            No activities yet
                        </Typography>
                    )}
                </List>
            )}
        </Paper>
    );
};

export default ActivityLog; 