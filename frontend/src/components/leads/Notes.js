import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import leadService from '../../services/leadService';

const Notes = ({ leadId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [leadId]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const fetchedNotes = await leadService.getNotes(leadId);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setSubmitting(true);
        try {
            await leadService.addNote(leadId, newNote);
            setNewNote('');
            await fetchNotes();
        } catch (error) {
            console.error('Failed to add note:', error);
        }
        setSubmitting(false);
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                Notes
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={submitting}
                    sx={{ mb: 1 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
                    disabled={submitting || !newNote.trim()}
                >
                    {submitting ? 'Adding...' : 'Add Note'}
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {notes.map((note, index) => (
                        <React.Fragment key={note.id}>
                            {index > 0 && <Divider />}
                            <ListItem alignItems="flex-start">
                                <ListItemText
                                    primary={note.content}
                                    secondary={
                                        <>
                                            Added by {note.user_name} on{' '}
                                            {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                                        </>
                                    }
                                />
                            </ListItem>
                        </React.Fragment>
                    ))}
                    {notes.length === 0 && (
                        <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
                            No notes yet
                        </Typography>
                    )}
                </List>
            )}
        </Paper>
    );
};

export default Notes; 