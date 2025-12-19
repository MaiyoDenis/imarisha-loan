from flask import Blueprint, jsonify
from app.models import Branch
from app.utils.decorators import admin_required

bp = Blueprint('branches', __name__, url_prefix='/api/branches')

@bp.route('/', methods=['GET'])
@admin_required
def get_branches():
    """Retrieves all branches."""
    branches = Branch.query.all()
    return jsonify([branch.to_dict() for branch in branches])

@bp.route('/<int:branch_id>', methods=['GET'])
@admin_required
def get_branch(branch_id):
    """Retrieves a single branch by ID."""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'message': 'Branch not found'}), 404
    return jsonify(branch.to_dict())
