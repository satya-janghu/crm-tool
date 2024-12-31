from google.oauth2 import service_account
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64
import os

SCOPES = ['https://mail.google.com/']
SERVICE_ACCOUNT_FILE = 'credentials.json'

def create_gmail_service(user_email):
    """Create Gmail service for a specific user using domain-wide delegation."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )
        
        # Create delegated credentials for the user
        delegated_credentials = credentials.with_subject(user_email)
        
        # Build the Gmail service
        service = build('gmail', 'v1', credentials=delegated_credentials)
        return service
    except Exception as e:
        raise Exception(f"Failed to create Gmail service: {str(e)}")

def send_email(service, sender, to, subject, body):
    """Send an email using the Gmail API."""
    try:
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

def create_draft(service, sender, to, subject, body):
    """Create an email draft using the Gmail API."""
    try:
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