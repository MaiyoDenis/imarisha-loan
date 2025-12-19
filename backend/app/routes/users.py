from flask import Blueprint, jsonify, request
from app.models import User, Role
from app import db, bcrypt
from app.utils.decorators import admin_required

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('', methods=['GET'])
def get_users():
    """Retrieves users with branch filtering for branch_managers and admins."""
    from flask import session
    
    user_id = session.get('user_id')
    current_user = User.query.get(user_id) if user_id else None
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    role_filter = request.args.get('role')
    branch_filter = request.args.get('branch_id', type=int)
    
    query = User.query
    
    # Branch managers can only see their branch's users
    if current_user and current_user.role.name == 'branch_manager':
        if current_user.branch_id:
            query = query.filter(User.branch_id == current_user.branch_id)
    elif current_user and current_user.role.name != 'admin':
        # Non-admin, non-branch-manager roles cannot access user list
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Admin can filter by branch if specified
    if branch_filter and (not current_user or current_user.role.name == 'admin'):
        query = query.filter(User.branch_id == branch_filter)
    
    if role_filter and role_filter != 'all':
        query = query.join(Role).filter(Role.name == role_filter)
        
    users = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': users.page
    })

@bp.route('', methods=['POST'])
@admin_required
def create_user():
    """Creates a new user."""
    data = request.get_json()
    
    required_fields = ['username', 'password', 'role', 'firstName', 'lastName', 'phone']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400
            
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
        
    if User.query.filter_by(phone=data['phone']).first():
        return jsonify({'message': 'Phone number already exists'}), 400
        
    role = Role.query.filter_by(name=data['role']).first()
    if not role:
        return jsonify({'message': 'Invalid role'}), 400
        
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    user = User(
        username=data['username'],
        phone=data['phone'],
        password=hashed_password,
        role_id=role.id,
        first_name=data['firstName'],
        last_name=data['lastName'],
        branch_id=data.get('branchId'),
        is_active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

@bp.route('/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """Retrieves a single user by ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict())

@bp.route('/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Updates an existing user."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    data = request.get_json()
    
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'phone' in data:
        existing = User.query.filter_by(phone=data['phone']).first()
        if existing and existing.id != user_id:
            return jsonify({'message': 'Phone number already exists'}), 400
        user.phone = data['phone']
    if 'branchId' in data:
        user.branch_id = data['branchId']
    if 'isActive' in data:
        user.is_active = data['isActive']
    if 'role' in data:
        role = Role.query.filter_by(name=data['role']).first()
        if role:
            user.role_id = role.id
            
    db.session.commit()
    return jsonify(user.to_dict())

@bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Deletes (deactivates) a user."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    # Soft delete by deactivating
    user.is_active = False
    db.session.commit()
    
    return jsonify({'message': 'User deactivated successfully'})
