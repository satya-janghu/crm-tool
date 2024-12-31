export const LEAD_STATUSES = {
    new: { label: 'New', color: 'default' },
    interested: { label: 'Interested', color: 'primary' },
    not_interested: { label: 'Not Interested', color: 'error' },
    no_response: { label: 'No Response', color: 'warning' },
    scheduled: { label: 'Scheduled', color: 'info' },
    converted: { label: 'Converted', color: 'success' },
    lost: { label: 'Lost', color: 'error' }
};

export const RESPONSE_TYPES = {
    positive: { label: 'Positive', color: 'success' },
    negative: { label: 'Negative', color: 'error' },
    follow_up_requested: { label: 'Follow-up Requested', color: 'info' },
    no_response: { label: 'No Response', color: 'warning' }
};

export const EMAIL_DIRECTIONS = {
    sent: 'sent',
    received: 'received'
};

export const ACTIVITY_TYPES = {
    email_sent: 'Email Sent',
    email_received: 'Email Received',
    meeting_scheduled: 'Meeting Scheduled',
    meeting_completed: 'Meeting Completed',
    note_added: 'Note Added',
    status_changed: 'Status Changed'
}; 