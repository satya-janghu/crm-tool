from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import and_
from ..models.notification import Notification, NotificationStatus, NotificationType
from ..models.user import User
from ..models.lead import Lead
from .. import db
from ..utils.gmail_service import create_gmail_service, send_email

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user = User.query.get(get_jwt_identity())
    status = request.args.get('status', 'unread')
    
    query = Notification.query.filter_by(user_id=current_user.id)
    if status != 'all':
        query = query.filter_by(status=status)
    
    notifications = query.order_by(Notification.created_at.desc()).all()
    return jsonify({'notifications': [notif.to_dict() for notif in notifications]})

@bp.route('/<int:notification_id>/mark-as-read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    current_user = User.query.get(get_jwt_identity())
    notification = Notification.query.get_or_404(notification_id)
    
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    notification.status = NotificationStatus.READ
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'})

@bp.route('/<int:notification_id>/dismiss', methods=['PUT'])
@jwt_required()
def dismiss_notification(notification_id):
    current_user = User.query.get(get_jwt_identity())
    notification = Notification.query.get_or_404(notification_id)
    
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    notification.status = NotificationStatus.DISMISSED
    db.session.commit()
    
    return jsonify({'message': 'Notification dismissed'})

@bp.route('/check-follow-ups', methods=['GET'])
@jwt_required()
def check_follow_ups():
    """Check for upcoming follow-ups and create notifications"""
    current_user = User.query.get(get_jwt_identity())
    
    # Find leads with follow-ups in the next 24 hours
    tomorrow = datetime.utcnow() + timedelta(days=1)
    leads = Lead.query.filter(
        and_(
            Lead.assigned_to == current_user.id,
            Lead.next_follow_up <= tomorrow,
            Lead.next_follow_up > datetime.utcnow()
        )
    ).all()
    
    notifications_created = 0
    for lead in leads:
        # Check if notification already exists
        existing_notification = Notification.query.filter(
            and_(
                Notification.lead_id == lead.id,
                Notification.type == NotificationType.FOLLOW_UP,
                Notification.scheduled_for == lead.next_follow_up,
                Notification.status != NotificationStatus.DISMISSED
            )
        ).first()
        
        if not existing_notification:
            notification = Notification(
                user_id=current_user.id,
                lead_id=lead.id,
                type=NotificationType.FOLLOW_UP,
                title=f'Follow-up with {lead.name}',
                message=f'You have a scheduled follow-up with {lead.name} from {lead.company_name}.',
                scheduled_for=lead.next_follow_up
            )
            db.session.add(notification)
            notifications_created += 1
            
            # Send email reminder if follow-up is within next hour
            if lead.next_follow_up - datetime.utcnow() <= timedelta(hours=1):
                try:
                    service = create_gmail_service(current_user.email)
                    send_email(
                        service=service,
                        sender=current_user.email,
                        to=current_user.email,
                        subject=f'Reminder: Follow-up with {lead.name}',
                        body=f'''You have a scheduled follow-up with {lead.name} from {lead.company_name}.
                        
Time: {lead.next_follow_up.strftime('%I:%M %p')}
Date: {lead.next_follow_up.strftime('%B %d, %Y')}

View lead details: http://localhost:3000/leads/{lead.id}'''
                    )
                except Exception as e:
                    print(f"Failed to send email reminder: {str(e)}")
    
    db.session.commit()
    return jsonify({
        'message': f'Created {notifications_created} new notification(s)',
        'count': notifications_created
    }) 