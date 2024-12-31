from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from ..models.user import User
from .. import db

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401
    
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    })

@bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admins can register new users'}), 403
    
    data = request.get_json()
    required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    new_user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role']
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user = User.query.get(get_jwt_identity())
    return jsonify(current_user.to_dict())

@bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admins can view all users'}), 403
    
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]})

@bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin' and current_user.id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'password' in data:
        user.set_password(data['password'])
    if 'role' in data and current_user.role == 'admin':
        user.role = data['role']
    if 'is_active' in data and current_user.role == 'admin':
        user.is_active = data['is_active']
    
    db.session.commit()
    return jsonify({'message': 'User updated successfully', 'user': user.to_dict()}) 