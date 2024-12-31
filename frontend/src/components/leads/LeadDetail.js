import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Divider,
    Chip,
    TextField,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Edit as EditIcon,
    Email as EmailIcon,
    Event as EventIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import leadService from '../../services/leadService';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
        {value === index && children}
    </div>
);

const LEAD_STATUSES = {
    new: { label: 'New', color: 'default' },
    interested: { label: 'Interested', color: 'primary' },
    not_interested: { label: 'Not Interested', color: 'error' },
    no_response: { label: 'No Response', color: 'warning' },
    scheduled: { label: 'Scheduled', color: 'info' },
    converted: { label: 'Converted', color: 'success' },
    lost: { label: 'Lost', color: 'error' }
};

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [notes, setNotes] = useState([]);
    const [emails, setEmails] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        fetchLeadData();
    }, [id]);

    const fetchLeadData = async () => {
        try {
            const leadData = await leadService.getLead(id);
            setLead(leadData);
            setEditForm(leadData);
            
            const [fetchedNotes, fetchedEmails] = await Promise.all([
                leadService.getNotes(id),
                leadService.getEmails(id)
            ]);
            setNotes(fetchedNotes);
            setEmails(fetchedEmails);
        } catch (error) {
            console.error('Failed to fetch lead data:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditForm(lead);
        }
    };

    const handleEditChange = (event) => {
        setEditForm({
            ...editForm,
            [event.target.name]: event.target.value,
        });
    };

    const handleSave = async () => {
        try {
            await leadService.updateLead(id, editForm);
            setLead(editForm);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update lead:', error);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        
        try {
            await leadService.addNote(id, newNote);
            const updatedNotes = await leadService.getNotes(id);
            setNotes(updatedNotes);
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const getStatusColor = (status) => {
        return LEAD_STATUSES[status]?.color || 'default';
    };

    const getStatusLabel = (status) => {
        return LEAD_STATUSES[status]?.label || status;
    };

    const renderDetailsTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                {isEditing ? (
                    <>
                        <TextField
                            fullWidth
                            name="name"
                            label="Name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name="email"
                            label="Email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name="company_name"
                            label="Company"
                            value={editForm.company_name}
                            onChange={handleEditChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            name="industry"
                            label="Industry"
                            value={editForm.industry}
                            onChange={handleEditChange}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={editForm.status}
                                onChange={handleEditChange}
                                label="Status"
                            >
                                {Object.entries(LEAD_STATUSES).map(([value, { label }]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                ) : (
                    <>
                        <Typography variant="body1">
                            <strong>Email:</strong> {lead.email}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <strong>Company:</strong> {lead.company_name}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <strong>Industry:</strong> {lead.industry}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            <strong>Status:</strong>{' '}
                            <Chip
                                label={getStatusLabel(lead.status)}
                                color={getStatusColor(lead.status)}
                                size="small"
                            />
                        </Typography>
                    </>
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="body1">
                    <strong>Last Contact:</strong>{' '}
                    {lead.last_contact_date
                        ? format(new Date(lead.last_contact_date), 'MMM dd, yyyy')
                        : 'Never'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    <strong>Next Follow-up:</strong>{' '}
                    {lead.next_follow_up
                        ? format(new Date(lead.next_follow_up), 'MMM dd, yyyy')
                        : 'Not scheduled'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    <strong>Created:</strong>{' '}
                    {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                </Typography>
            </Grid>
        </Grid>
    );

    if (!lead) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" component="h2">
                            {isEditing ? 'Edit Lead' : lead.name}
                        </Typography>
                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<EmailIcon />}
                                onClick={() => navigate(`/leads/${id}/email`)}
                                sx={{ mr: 1 }}
                            >
                                Send Email
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                                onClick={isEditing ? handleSave : handleEditToggle}
                            >
                                {isEditing ? 'Save' : 'Edit'}
                            </Button>
                            {isEditing && (
                                <IconButton onClick={handleEditToggle}>
                                    <CancelIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Details" />
                        <Tab label="Notes" />
                        <Tab label="Email History" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        {renderDetailsTab()}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddNote}
                                sx={{ mt: 1 }}
                            >
                                Add Note
                            </Button>
                        </Box>
                        <List>
                            {notes.map((note) => (
                                <React.Fragment key={note.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={note.content}
                                            secondary={format(
                                                new Date(note.created_at),
                                                'MMM dd, yyyy HH:mm'
                                            )}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <List>
                            {emails.map((email) => (
                                <React.Fragment key={email.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={email.subject}
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textPrimary"
                                                    >
                                                        {email.direction === 'sent' ? 'Sent to' : 'Received from'}{' '}
                                                        {lead.name}
                                                    </Typography>
                                                    {' — '}{email.content}
                                                </>
                                            }
                                        />
                                        <Typography variant="caption">
                                            {format(new Date(email.sent_at), 'MMM dd, yyyy HH:mm')}
                                        </Typography>
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </TabPanel>
                </Paper>
            </Box>
        </Container>
    );
};

export default LeadDetail; 