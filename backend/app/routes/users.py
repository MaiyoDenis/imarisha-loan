from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models import User, Branch
from app import db, bcrypt
from app.services import audit_service, AuditEventType, RiskLevel

bp = Blueprint('users', __name__, url_prefix='/api/users')

def check_admin_permission():
    """Check if current user is admin"""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return False
    return True

@bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    role = request.args.get('role', None)
    branch_id = request.args.get('branch_id', None, type=int)
    
    query = User.query
    
    if role:
        query = query.filter_by(role=role)
    
    if branch_id:
        query = query.filter_by(branch_id=branch_id)
    
    users = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': users.total,
            'pages': users.pages
        }
    })

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    """Get a specific user"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict())

@bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    """Create a new user (admin only)"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    data = request.get_json()
    
    required_fields = ['username', 'phone', 'password', 'firstName', 'lastName', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields: username, phone, password, firstName, lastName, role'}), 400
    
    # Validate role
    valid_roles = ['admin', 'branch_manager', 'loan_officer', 'procurement_officer', 'customer']
    if data['role'] not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # Check if phone already exists
    if User.query.filter_by(phone=data['phone']).first():
        return jsonify({'error': 'Phone number already exists'}), 400
    
    # Validate branch if provided
    branch_id = data.get('branchId')
    if branch_id:
        branch = Branch.query.get(branch_id)
        if not branch:
            return jsonify({'error': 'Branch not found'}), 404
    
    try:
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        user = User(
            username=data['username'],
            phone=data['phone'],
            password=hashed_password,
            first_name=data['firstName'],
            last_name=data['lastName'],
            role=data['role'],
            branch_id=branch_id,
            is_active=data.get('isActive', True)
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Audit log
        audit_service.log_event(
            event_type=AuditEventType.USER_CREATED,
            user_id=get_jwt()['sub'],
            resource="user",
            action="create",
            entity_id=user.id,
            details={
                'username': data['username'],
                'role': data['role'],
                'firstName': data['firstName'],
                'lastName': data['lastName']
            },
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    """Update a user (admin only)"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Store old values for audit
    old_values = {
        'username': user.username,
        'phone': user.phone,
        'role': user.role,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'branchId': user.branch_id,
        'isActive': user.is_active
    }
    
    try:
        # Update fields
        if 'firstName' in data:
            user.first_name = data['firstName']
        if 'lastName' in data:
            user.last_name = data['lastName']
        if 'phone' in data:
            # Check if new phone is unique
            existing = User.query.filter_by(phone=data['phone']).filter(User.id != id).first()
            if existing:
                return jsonify({'error': 'Phone number already exists'}), 400
            user.phone = data['phone']
        if 'role' in data:
            valid_roles = ['admin', 'branch_manager', 'loan_officer', 'procurement_officer', 'customer']
            if data['role'] not in valid_roles:
                return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
            user.role = data['role']
        if 'branchId' in data:
            if data['branchId']:
                branch = Branch.query.get(data['branchId'])
                if not branch:
                    return jsonify({'error': 'Branch not found'}), 404
            user.branch_id = data['branchId']
        if 'isActive' in data:
            user.is_active = data['isActive']
        if 'password' in data:
            user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        db.session.commit()
        
        # Audit log
        audit_service.log_event(
            event_type=AuditEventType.USER_UPDATED,
            user_id=get_jwt()['sub'],
            resource="user",
            action="update",
            entity_id=user.id,
            details={
                'old_values': old_values,
                'new_values': {k: getattr(user, k, None) for k in old_values.keys()}
            },
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    """Delete a user (admin only)"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent deletion of the only admin
    if user.role == 'admin':
        admin_count = User.query.filter_by(role='admin').count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot delete the last admin user'}), 400
    
    try:
        db.session.delete(user)
        db.session.commit()
        
        # Audit log
        audit_service.log_event(
            event_type=AuditEventType.USER_DELETED,
            user_id=get_jwt()['sub'],
            resource="user",
            action="delete",
            entity_id=id,
            details={
                'username': user.username,
                'role': user.role
            },
            risk_level=RiskLevel.HIGH
        )
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>/activate', methods=['PUT'])
@jwt_required()
def activate_user(id):
    """Activate a user"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        user.is_active = True
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.USER_ACTIVATED,
            user_id=get_jwt()['sub'],
            resource="user",
            action="activate",
            entity_id=id,
            details={'username': user.username},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'message': 'User activated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>/deactivate', methods=['PUT'])
@jwt_required()
def deactivate_user(id):
    """Deactivate a user"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin access required'}), 403
    
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent deactivation of the only admin
    if user.role == 'admin':
        active_admin_count = User.query.filter_by(role='admin', is_active=True).count()
        if active_admin_count <= 1:
            return jsonify({'error': 'Cannot deactivate the last active admin'}), 400
    
    try:
        user.is_active = False
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.USER_DEACTIVATED,
            user_id=get_jwt()['sub'],
            resource="user",
            action="deactivate",
            entity_id=id,
            details={'username': user.username},
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({
            'message': 'User deactivated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
