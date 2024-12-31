from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_, and_
from ..models.lead import Lead, Note, Activity, EmailLog, LeadStatus, ResponseType
from ..models.user import User
from .. import db
from ..utils.gmail_service import create_gmail_service, send_email
from ..utils.error_handlers import APIError

bp = Blueprint('leads', __name__, url_prefix='/api/leads')

@bp.route('', methods=['POST'])
@jwt_required()
def create_lead():
    current_user = User.query.get(get_jwt_identity())
    data = request.get_json()

    required_fields = ['name', 'email', 'company_name']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    lead = Lead(
        name=data['name'],
        email=data['email'],
        company_name=data['company_name'],
        industry=data.get('industry'),
        status=LeadStatus.NEW,
        assigned_to=current_user.id
    )

    db.session.add(lead)
    db.session.commit()

    return jsonify({'message': 'Lead created successfully', 'lead': lead.to_dict()}), 201

@bp.route('', methods=['GET'])
@jwt_required()
def get_leads():
    current_user = User.query.get(get_jwt_identity())
    query = Lead.query

    # Search and filter parameters
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    assigned_to = request.args.get('assigned_to')

    if search:
        query = query.filter(or_(
            Lead.name.ilike(f'%{search}%'),
            Lead.email.ilike(f'%{search}%'),
            Lead.company_name.ilike(f'%{search}%')
        ))

    if status:
        query = query.filter(Lead.status == status)

    if start_date and end_date:
        query = query.filter(and_(
            Lead.created_at >= datetime.fromisoformat(start_date),
            Lead.created_at <= datetime.fromisoformat(end_date)
        ))

    if assigned_to:
        query = query.filter(Lead.assigned_to == assigned_to)
    elif not current_user.role == 'admin':
        query = query.filter(Lead.assigned_to == current_user.id)

    leads = query.order_by(Lead.created_at.desc()).all()
    return jsonify({'leads': [lead.to_dict() for lead in leads]})

@bp.route('/<int:lead_id>', methods=['GET'])
@jwt_required()
def get_lead(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(lead.to_dict())

@bp.route('/<int:lead_id>', methods=['PUT'])
@jwt_required()
def update_lead(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    
    if 'name' in data:
        lead.name = data['name']
    if 'email' in data:
        lead.email = data['email']
    if 'company_name' in data:
        lead.company_name = data['company_name']
    if 'industry' in data:
        lead.industry = data['industry']
    if 'status' in data:
        lead.status = data['status']
    if 'assigned_to' in data and current_user.role == 'admin':
        lead.assigned_to = data['assigned_to']
    if 'next_follow_up' in data:
        lead.next_follow_up = datetime.fromisoformat(data['next_follow_up'])

    db.session.commit()
    return jsonify({'message': 'Lead updated successfully', 'lead': lead.to_dict()})

@bp.route('/<int:lead_id>/notes', methods=['POST'])
@jwt_required()
def add_note(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not data.get('content'):
        return jsonify({'error': 'Note content is required'}), 400

    note = Note(
        lead_id=lead_id,
        user_id=current_user.id,
        content=data['content']
    )

    db.session.add(note)
    db.session.commit()

    return jsonify({'message': 'Note added successfully', 'note': note.to_dict()}), 201

@bp.route('/<int:lead_id>/notes', methods=['GET'])
@jwt_required()
def get_notes(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    notes = Note.query.filter_by(lead_id=lead_id).order_by(Note.created_at.desc()).all()
    return jsonify({'notes': [note.to_dict() for note in notes]})

@bp.route('/<int:lead_id>/emails', methods=['POST'])
@jwt_required()
def log_email(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    required_fields = ['direction', 'subject', 'content']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    email_log = EmailLog(
        lead_id=lead_id,
        user_id=current_user.id,
        direction=data['direction'],
        subject=data['subject'],
        content=data['content'],
        response_type=data.get('response_type'),
        scheduled_follow_up=datetime.fromisoformat(data['scheduled_follow_up']) if data.get('scheduled_follow_up') else None
    )

    # Update lead's last contact date and next follow-up
    lead.last_contact_date = datetime.utcnow()
    if data.get('scheduled_follow_up'):
        lead.next_follow_up = datetime.fromisoformat(data['scheduled_follow_up'])

    db.session.add(email_log)
    db.session.commit()

    return jsonify({'message': 'Email logged successfully', 'email': email_log.to_dict()}), 201

@bp.route('/<int:lead_id>/emails', methods=['GET'])
@jwt_required()
def get_emails(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    emails = EmailLog.query.filter_by(lead_id=lead_id).order_by(EmailLog.sent_at.desc()).all()
    return jsonify({'emails': [email.to_dict() for email in emails]})

@bp.route('/<int:lead_id>/send-email', methods=['POST'])
@jwt_required()
def send_lead_email(lead_id):
    current_user = User.query.get(get_jwt_identity())
    lead = Lead.query.get_or_404(lead_id)

    if not current_user.role == 'admin' and lead.assigned_to != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    required_fields = ['subject', 'content']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Create Gmail service for the current user
        service = create_gmail_service(current_user.email)
        
        # Send email
        sent_message = send_email(
            service=service,
            sender=current_user.email,
            to=lead.email,
            subject=data['subject'],
            body=data['content']
        )

        # Log the email
        email_log = EmailLog(
            lead_id=lead_id,
            user_id=current_user.id,
            direction='sent',
            subject=data['subject'],
            content=data['content'],
            response_type=data.get('response_type'),
            scheduled_follow_up=datetime.fromisoformat(data['scheduled_follow_up']) if data.get('scheduled_follow_up') else None
        )

        # Update lead's last contact date
        lead.last_contact_date = datetime.utcnow()
        if data.get('scheduled_follow_up'):
            lead.next_follow_up = datetime.fromisoformat(data['scheduled_follow_up'])

        db.session.add(email_log)
        db.session.commit()

        return jsonify({
            'message': 'Email sent successfully',
            'email': email_log.to_dict(),
            'gmail_message_id': sent_message['id']
        }), 201

    except Exception as e:
        raise APIError(f"Failed to send email: {str(e)}") 