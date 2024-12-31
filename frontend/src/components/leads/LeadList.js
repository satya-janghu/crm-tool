import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Typography,
    Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import leadService from '../../services/leadService';

const LEAD_STATUSES = {
    new: { label: 'New', color: 'default' },
    interested: { label: 'Interested', color: 'primary' },
    not_interested: { label: 'Not Interested', color: 'error' },
    no_response: { label: 'No Response', color: 'warning' },
    scheduled: { label: 'Scheduled', color: 'info' },
    converted: { label: 'Converted', color: 'success' },
    lost: { label: 'Lost', color: 'error' }
};

const LeadList = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState({
        search: '',
        status: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        fetchLeads();
    }, [searchParams]);

    const fetchLeads = async () => {
        try {
            const fetchedLeads = await leadService.getLeads(searchParams);
            setLeads(fetchedLeads);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchParams({
            ...searchParams,
            [event.target.name]: event.target.value,
        });
    };

    const getStatusColor = (status) => {
        return LEAD_STATUSES[status]?.color || 'default';
    };

    const getStatusLabel = (status) => {
        return LEAD_STATUSES[status]?.label || status;
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Name',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2">{params.value}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {params.row.company_name}
                    </Typography>
                </Box>
            ),
        },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'industry', headerName: 'Industry', width: 150 },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={getStatusLabel(params.value)}
                    color={getStatusColor(params.value)}
                    size="small"
                />
            ),
        },
        {
            field: 'last_contact_date',
            headerName: 'Last Contact',
            width: 150,
            valueFormatter: (params) =>
                params.value ? format(new Date(params.value), 'MMM dd, yyyy') : 'Never',
        },
        {
            field: 'next_follow_up',
            headerName: 'Next Follow-up',
            width: 150,
            valueFormatter: (params) =>
                params.value ? format(new Date(params.value), 'MMM dd, yyyy') : 'Not scheduled',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/leads/${params.row.id}`)}
                        >
                            <ViewIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Email">
                        <IconButton
                            size="small"
                            onClick={() => navigate(`/leads/${params.row.id}/email`)}
                        >
                            <EmailIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Container maxWidth="xl">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" component="h2">
                            Leads
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/leads/new')}
                        >
                            Add Lead
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                            name="search"
                            label="Search"
                            variant="outlined"
                            size="small"
                            value={searchParams.search}
                            onChange={handleSearchChange}
                            sx={{ flexGrow: 1 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                label="Status"
                                value={searchParams.status}
                                onChange={handleSearchChange}
                            >
                                <MenuItem value="">All</MenuItem>
                                {Object.entries(LEAD_STATUSES).map(([value, { label }]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            name="start_date"
                            label="From Date"
                            type="date"
                            size="small"
                            value={searchParams.start_date}
                            onChange={handleSearchChange}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            name="end_date"
                            label="To Date"
                            type="date"
                            size="small"
                            value={searchParams.end_date}
                            onChange={handleSearchChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={leads}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            checkboxSelection
                            disableSelectionOnClick
                            loading={loading}
                            density="comfortable"
                        />
                    </div>
                </Paper>
            </Box>
        </Container>
    );
};

export default LeadList; 