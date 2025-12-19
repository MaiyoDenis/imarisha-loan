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
