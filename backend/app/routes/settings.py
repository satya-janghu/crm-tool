from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.settings import Settings, SettingsKeys
from ..models.user import User
from .. import db

bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@bp.route('', methods=['GET'])
@jwt_required()
def get_settings():
    """Get all settings"""
    current_user = User.query.get(get_jwt_identity())
    if not current_user.role == 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    settings = Settings.query.all()
    return jsonify({'settings': [setting.to_dict() for setting in settings]})

@bp.route('/<string:key>', methods=['GET'])
@jwt_required()
def get_setting(key):
    """Get a specific setting by key"""
    setting = Settings.query.filter_by(key=key).first()
    if not setting:
        return jsonify({'error': 'Setting not found'}), 404
    return jsonify(setting.to_dict())

@bp.route('', methods=['POST'])
@jwt_required()
def update_settings():
    """Update multiple settings at once"""
    current_user = User.query.get(get_jwt_identity())
    if not current_user.role == 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not isinstance(data, dict):
        return jsonify({'error': 'Invalid data format'}), 400

    updated_settings = []
    for key, value in data.items():
        setting = Settings.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = Settings(
                key=key,
                value=value,
                description=f'Setting for {key}'
            )
            db.session.add(setting)
        updated_settings.append(setting)

    db.session.commit()
    return jsonify({
        'message': 'Settings updated successfully',
        'settings': [setting.to_dict() for setting in updated_settings]
    })

@bp.route('/initialize', methods=['POST'])
@jwt_required()
def initialize_settings():
    """Initialize default settings if they don't exist"""
    current_user = User.query.get(get_jwt_identity())
    if not current_user.role == 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    default_settings = {
        SettingsKeys.GLOBAL_EMAIL: {
            'value': '',
            'description': 'Global email address used for sending emails'
        },
        SettingsKeys.GLOBAL_EMAIL_NAME: {
            'value': 'CRM System',
            'description': 'Display name for the global email address'
        }
    }

    created_settings = []
    for key, data in default_settings.items():
        if not Settings.query.filter_by(key=key).first():
            setting = Settings(
                key=key,
                value=data['value'],
                description=data['description']
            )
            db.session.add(setting)
            created_settings.append(setting)

    db.session.commit()
    return jsonify({
        'message': 'Default settings initialized',
        'settings': [setting.to_dict() for setting in created_settings]
    }) 