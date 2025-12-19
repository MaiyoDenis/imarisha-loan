from functools import wraps
from flask import session, jsonify
from app.models import User, Role

def login_required(f):
    """Decorator to ensure a user is logged in."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def permission_required(permission):
    """Decorator for permission-based access control."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'message': 'Authentication required'}), 401

            user = User.query.get(session['user_id'])
            if not user or not any(p.permission.name == permission for p in user.role.permissions):
                return jsonify({'message': 'Unauthorized access'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator for admin-only endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401

        user = User.query.get(session['user_id'])
        if not user or user.role.name != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        return f(*args, **kwargs)
    return decorated_function

def role_required(roles):
    """Decorator to ensure a user has one of the required roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'message': 'Authentication required'}), 401

            user = User.query.get(session['user_id'])
            if not user:
                return jsonify({'message': 'User not found'}), 404
                
            if user.role.name not in roles:
                return jsonify({'message': 'Unauthorized access'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def staff_required(f):
    """Decorator for staff access (admin, branch_manager, loan_officer, staff)."""
    return role_required(['admin', 'branch_manager', 'loan_officer', 'staff'])(f)
