from flask import Blueprint, request, jsonify
from app.models import Branch, User
from app import db

bp = Blueprint('branches', __name__, url_prefix='/api/branches')

@bp.route('', methods=['GET'])
def get_branches():
    branches = Branch.query.order_by(Branch.created_at.desc()).all()
    return jsonify([branch.to_dict() for branch in branches])

@bp.route('/<int:id>', methods=['GET'])
def get_branch(id):
    branch = Branch.query.get(id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    return jsonify(branch.to_dict())

@bp.route('', methods=['POST'])
def create_branch():
    data = request.get_json()
    if not data.get('name') or not data.get('location'):
        return jsonify({'error': 'Name and location are required'}), 400
        
    branch = Branch(
        name=data['name'],
        location=data['location'],
        manager_id=data.get('managerId')
    )
    
    try:
        db.session.add(branch)
        db.session.commit()
        return jsonify(branch.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['PUT'])
def update_branch(id):
    branch = Branch.query.get(id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        branch.name = data['name']
    if 'location' in data:
        branch.location = data['location']
    if 'managerId' in data:
        branch.manager_id = data['managerId']
    if 'isActive' in data:
        branch.is_active = data['isActive']
    
    try:
        db.session.commit()
        return jsonify(branch.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['DELETE'])
def delete_branch(id):
    branch = Branch.query.get(id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    
    try:
        db.session.delete(branch)
        db.session.commit()
        return jsonify({'message': 'Branch deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>/staff', methods=['GET'])
def get_branch_staff(id):
    branch = Branch.query.get(id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    
    staff = User.query.filter_by(branch_id=id).all()
    return jsonify([user.to_dict() for user in staff])
