from google.oauth2 import service_account
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64
import os
from ..models.settings import Settings, SettingsKeys

SCOPES = ['https://mail.google.com/']
SERVICE_ACCOUNT_FILE = 'credentials.json'

def create_gmail_service():
    """Create Gmail service using the global email account"""
    try:
        # Get global email from settings
        global_email = Settings.query.filter_by(key=SettingsKeys.GLOBAL_EMAIL).first()
        if not global_email or not global_email.value:
            raise Exception("Global email not configured")

        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )
        
        # Create delegated credentials for the global email
        delegated_credentials = credentials.with_subject(global_email.value)
        
        # Build the Gmail service
        service = build('gmail', 'v1', credentials=delegated_credentials)
        return service
    except Exception as e:
        raise Exception(f"Failed to create Gmail service: {str(e)}")

def send_email(service, to, subject, body):
    """Send an email using the Gmail API with global email settings"""
    try:
        # Get global email settings
        global_email = Settings.query.filter_by(key=SettingsKeys.GLOBAL_EMAIL).first()
        global_email_name = Settings.query.filter_by(key=SettingsKeys.GLOBAL_EMAIL_NAME).first()

        if not global_email or not global_email.value:
            raise Exception("Global email not configured")

        sender = f"{global_email_name.value} <{global_email.value}>" if global_email_name and global_email_name.value else global_email.value

        message = MIMEText(body)
        message['to'] = to
        message['from'] = sender
        message['subject'] = subject

        # Encode the message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Send the email
        sent_message = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        return sent_message
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")

def create_draft(service, to, subject, body):
    """Create an email draft using the Gmail API with global email settings"""
    try:
        # Get global email settings
        global_email = Settings.query.filter_by(key=SettingsKeys.GLOBAL_EMAIL).first()
        global_email_name = Settings.query.filter_by(key=SettingsKeys.GLOBAL_EMAIL_NAME).first()

        if not global_email or not global_email.value:
            raise Exception("Global email not configured")

        sender = f"{global_email_name.value} <{global_email.value}>" if global_email_name and global_email_name.value else global_email.value

        message = MIMEText(body)
        message['to'] = to
        message['from'] = sender
        message['subject'] = subject

        # Encode the message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Create the draft
        draft = service.users().drafts().create(
            userId='me',
            body={
                'message': {
                    'raw': raw_message
                }
            }
        ).execute()
        
        return draft
    except Exception as e:
        raise Exception(f"Failed to create draft: {str(e)}") 