import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
} from '@mui/material';
import {
    AccountCircle as AccountIcon,
} from '@mui/icons-material';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    CRM Tool
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button color="inherit" onClick={() => navigate('/leads')}>
                        Leads
                    </Button>
                    {user?.role === 'admin' && (
                        <Button color="inherit" onClick={() => navigate('/users')}>
                            Users
                        </Button>
                    )}
                    
                    <NotificationBell />

                    <IconButton
                        size="large"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        {user?.avatar ? (
                            <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32 }} />
                        ) : (
                            <AccountIcon />
                        )}
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfile}>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 