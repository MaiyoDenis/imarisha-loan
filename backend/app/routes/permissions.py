from flask import Blueprint, request, jsonify
from app.models import Permission, Role, RolePermission
from app import db
from app.utils.decorators import admin_required

bp = Blueprint('permissions', __name__, url_prefix='/api/permissions')

@bp.route('/', methods=['GET'])
@admin_required
def get_permissions():
    """Retrieves all permissions."""
    permissions = Permission.query.all()
    return jsonify([{'id': p.id, 'name': p.name} for p in permissions])

@bp.route('/roles', methods=['GET'])
@admin_required
def get_roles():
    """Retrieves all roles with their permissions."""
    roles = Role.query.all()
    return jsonify([role.to_dict() for role in roles])

@bp.route('/roles/<int:role_id>/permissions', methods=['POST'])
@admin_required
def assign_permission_to_role(role_id):
    """Assigns a permission to a role."""
    data = request.get_json()
    permission_id = data.get('permission_id')

    role = Role.query.get(role_id)
    permission = Permission.query.get(permission_id)

    if not role or not permission:
        return jsonify({'message': 'Role or permission not found'}), 404

    # Check if the permission is already assigned
    if any(p.permission_id == permission_id for p in role.permissions):
        return jsonify({'message': 'Permission already assigned to this role'}), 400

    role_permission = RolePermission(role_id=role_id, permission_id=permission_id)
    db.session.add(role_permission)
    db.session.commit()

    return jsonify({'message': 'Permission assigned successfully'})
