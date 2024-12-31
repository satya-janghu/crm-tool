import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await authService.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            setNotification({
                open: true,
                message: 'Failed to fetch users',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        navigate('/register-user');
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
    };

    const handleUpdateUserStatus = async (userId, isActive) => {
        try {
            await authService.updateUser(userId, { is_active: !isActive });
            await fetchUsers();
            setNotification({
                open: true,
                message: 'User status updated successfully',
                severity: 'success'
            });
        } catch (error) {
            setNotification({
                open: true,
                message: 'Failed to update user status',
                severity: 'error'
            });
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'first_name', headerName: 'First Name', width: 130 },
        { field: 'last_name', headerName: 'Last Name', width: 130 },
        { field: 'role', headerName: 'Role', width: 100 },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    color={params.value ? 'success' : 'error'}
                    size="small"
                    onClick={() => handleUpdateUserStatus(params.row.id, params.value)}
                >
                    {params.value ? 'Active' : 'Inactive'}
                </Button>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <IconButton
                    color="primary"
                    onClick={() => handleEditUser(params.row)}
                >
                    <EditIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" component="h2">
                            User Management
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddUser}
                        >
                            Add User
                        </Button>
                    </Box>

                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={users}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            checkboxSelection
                            disableSelectionOnClick
                            loading={loading}
                        />
                    </div>
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

export default UserManagement; 