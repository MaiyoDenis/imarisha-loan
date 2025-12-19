from flask import Blueprint, request, jsonify, session
from app.models import User, Role
from app import db, bcrypt
from app.services import audit_service, mfa_service, AuditEventType, RiskLevel
from app.utils.decorators import login_required

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    
    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['role'] = user.role.name

        audit_service.log_event(
            event_type=AuditEventType.AUTH_LOGIN,
            user_id=user.id,
            resource="auth",
            action="login",
            details={'username': username},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'status': 'success',
            'user': user.to_dict()
        })
    
    audit_service.log_event(
        event_type=AuditEventType.AUTH_FAILURE,
        resource="auth",
        action="login_failed",
        details={'username': username},
        risk_level=RiskLevel.MEDIUM
    )

    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    phone = data.get('phone')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    role_name = data.get('role', 'customer')
    branch_id = data.get('branchId')
    
    if not all([username, password, phone, first_name, last_name]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if User.query.filter_by(phone=phone).first():
        return jsonify({'error': 'Phone number already exists'}), 400

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({'error': f'Role "{role_name}" does not exist'}), 400
        
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user = User(
        username=username,
        password=hashed_password,
        phone=phone,
        first_name=first_name,
        last_name=last_name,
        role_id=role.id,
        branch_id=branch_id,
        is_active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    audit_service.log_event(
        event_type=AuditEventType.USER_CREATED,
        user_id=user.id,
        resource="user",
        action="register",
        details={'username': username, 'role': role.name},
        risk_level=RiskLevel.LOW
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    }), 201

@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    user_id = session.get('user_id')

    audit_service.log_event(
        event_type=AuditEventType.AUTH_LOGOUT,
        user_id=user_id,
        resource="auth",
        action="logout",
        risk_level=RiskLevel.LOW
    )
    
    session.clear()
    return jsonify({'success': True})

@bp.route('/me', methods=['GET'])
@login_required
def me():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()})
