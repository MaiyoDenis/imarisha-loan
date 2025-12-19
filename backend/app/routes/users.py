from flask import Blueprint, jsonify
from app.models import User
from app.utils.decorators import admin_required

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/', methods=['GET'])
@admin_required
def get_users():
    """Retrieves all users."""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@bp.route('/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    """Retrieves a single user by ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict())
