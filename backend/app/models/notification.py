from datetime import datetime
from .. import db

class NotificationType:
    FOLLOW_UP = 'follow_up'
    MEETING = 'meeting'
    EMAIL_RESPONSE = 'email_response'
    TASK = 'task'

class NotificationStatus:
    UNREAD = 'unread'
    READ = 'read'
    DISMISSED = 'dismissed'

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=True)
    type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default=NotificationStatus.UNREAD)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    scheduled_for = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='notifications')
    lead = db.relationship('Lead', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lead_id': self.lead_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'scheduled_for': self.scheduled_for.isoformat() if self.scheduled_for else None,
            'lead_name': self.lead.name if self.lead else None
        } 