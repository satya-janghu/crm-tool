import React, { useState, useEffect, useRef } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    Button,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import notificationService from '../../services/notificationService';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const checkInterval = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Check for new notifications every minute
        checkInterval.current = setInterval(checkForNewNotifications, 60000);

        return () => {
            if (checkInterval.current) {
                clearInterval(checkInterval.current);
            }
        };
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const fetchedNotifications = await notificationService.getNotifications();
            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
        setLoading(false);
    };

    const checkForNewNotifications = async () => {
        try {
            await notificationService.checkFollowUps();
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to check for new notifications:', error);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDismiss = async (notificationId) => {
        try {
            await notificationService.dismissNotification(notificationId);
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to dismiss notification:', error);
        }
    };

    const formatNotificationDate = (date) => {
        const notificationDate = new Date(date);
        if (isToday(notificationDate)) {
            return format(notificationDate, "'Today at' h:mm a");
        } else if (isYesterday(notificationDate)) {
            return format(notificationDate, "'Yesterday at' h:mm a");
        }
        return format(notificationDate, 'MMM d, yyyy h:mm a');
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-label={`${notifications.length} unread notifications`}
            >
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: { width: 400, maxHeight: 500 }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Notifications
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : notifications.length > 0 ? (
                        <List>
                            {notifications.map((notification, index) => (
                                <React.Fragment key={notification.id}>
                                    {index > 0 && <Divider />}
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            backgroundColor: notification.status === 'unread' ? 'action.hover' : 'inherit'
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {notification.status === 'unread' && (
                                                        <CircleIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                                                    )}
                                                    <Typography variant="subtitle2">
                                                        {notification.title}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="text.primary" sx={{ my: 0.5 }}>
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {formatNotificationDate(notification.created_at)}
                                                    </Typography>
                                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                        {notification.status === 'unread' && (
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                            >
                                                                Mark as read
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDismiss(notification.id)}
                                                        >
                                                            Dismiss
                                                        </Button>
                                                    </Box>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                            No new notifications
                        </Typography>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell; 