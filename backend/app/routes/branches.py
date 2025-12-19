from flask import Blueprint, jsonify, request
from app.models import Branch, User
from app import db
from app.utils.decorators import admin_required

bp = Blueprint('branches', __name__, url_prefix='/api/branches')

@bp.route('', methods=['GET'])
@admin_required
def get_branches():
    """Retrieves all branches."""
    branches = Branch.query.all()
    return jsonify([branch.to_dict() for branch in branches])

@bp.route('', methods=['POST'])
@admin_required
def create_branch():
    """Creates a new branch."""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('location'):
        return jsonify({'message': 'Name and location are required'}), 400
        
    if Branch.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Branch with this name already exists'}), 400
        
    branch = Branch(
        name=data['name'],
        location=data['location'],
        manager_id=data.get('managerId')
    )
    
    db.session.add(branch)
    db.session.commit()
    
    return jsonify(branch.to_dict()), 201

@bp.route('/<int:branch_id>', methods=['GET'])
@admin_required
def get_branch(branch_id):
    """Retrieves a single branch by ID."""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'message': 'Branch not found'}), 404
    return jsonify(branch.to_dict())

@bp.route('/<int:branch_id>', methods=['PUT'])
@admin_required
def update_branch(branch_id):
    """Updates an existing branch."""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'message': 'Branch not found'}), 404
        
    data = request.get_json()
    
    if 'name' in data:
        existing = Branch.query.filter_by(name=data['name']).first()
        if existing and existing.id != branch_id:
            return jsonify({'message': 'Branch with this name already exists'}), 400
        branch.name = data['name']
        
    if 'location' in data:
        branch.location = data['location']
        
    if 'managerId' in data:
        branch.manager_id = data['managerId']
        
    if 'isActive' in data:
        branch.is_active = data['isActive']
        
    db.session.commit()
    return jsonify(branch.to_dict())

@bp.route('/<int:branch_id>', methods=['DELETE'])
@admin_required
def delete_branch(branch_id):
    """Deletes a branch."""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'message': 'Branch not found'}), 404
        
    # Check if branch has associated users or groups
    if branch.users or branch.groups:
        return jsonify({'message': 'Cannot delete branch with associated users or groups'}), 400
        
    db.session.delete(branch)
    db.session.commit()
    return jsonify({'message': 'Branch deleted successfully'})

@bp.route('/<int:branch_id>/staff', methods=['GET'])
@admin_required
def get_branch_staff(branch_id):
    """Retrieves staff members for a specific branch."""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'message': 'Branch not found'}), 404
        
    staff = User.query.filter_by(branch_id=branch_id).all()
    return jsonify([user.to_dict() for user in staff])
