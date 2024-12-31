from .. import db
from datetime import datetime
from enum import Enum

class LeadStatus(str, Enum):
    NEW = 'new'
    INTERESTED = 'interested'
    NOT_INTERESTED = 'not_interested'
    NO_RESPONSE = 'no_response'
    SCHEDULED = 'scheduled'
    CONVERTED = 'converted'
    LOST = 'lost'

class ResponseType(str, Enum):
    POSITIVE = 'positive'
    NEGATIVE = 'negative'
    FOLLOW_UP_REQUESTED = 'follow_up_requested'
    NO_RESPONSE = 'no_response'

class Lead(db.Model):
    __tablename__ = 'leads'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    company_name = db.Column(db.String(100), nullable=False)
    industry = db.Column(db.String(50))
    status = db.Column(db.String(20), default=LeadStatus.NEW)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contact_date = db.Column(db.DateTime)
    next_follow_up = db.Column(db.DateTime)
    calendly_link = db.Column(db.String(255))

    # Relationships
    activities = db.relationship('Activity', backref='lead', lazy=True)
    notes = db.relationship('Note', backref='lead', lazy=True)
    emails = db.relationship('EmailLog', backref='lead', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'company_name': self.company_name,
            'industry': self.industry,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_contact_date': self.last_contact_date.isoformat() if self.last_contact_date else None,
            'next_follow_up': self.next_follow_up.isoformat() if self.next_follow_up else None,
            'calendly_link': self.calendly_link
        }

class Activity(db.Model):
    __tablename__ = 'activities'

    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # email_sent, email_received, meeting_scheduled, etc.
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class EmailLog(db.Model):
    __tablename__ = 'email_logs'

    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    direction = db.Column(db.String(10), nullable=False)  # sent or received
    subject = db.Column(db.String(200))
    content = db.Column(db.Text)
    response_type = db.Column(db.String(20))  # from ResponseType enum
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    scheduled_follow_up = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'user_id': self.user_id,
            'direction': self.direction,
            'subject': self.subject,
            'content': self.content,
            'response_type': self.response_type,
            'sent_at': self.sent_at.isoformat(),
            'scheduled_follow_up': self.scheduled_follow_up.isoformat() if self.scheduled_follow_up else None
        } 