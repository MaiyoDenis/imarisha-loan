from flask import Blueprint, request, jsonify
from app.models import Group
from app import db

bp = Blueprint('groups', __name__, url_prefix='/api/groups')

@bp.route('', methods=['GET'])
def get_groups():
    from flask import session
    from app.models import User
    
    query = Group.query
    
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user and user.role.name != 'admin' and user.branch_id:
            query = query.filter_by(branch_id=user.branch_id)
            
    groups = query.order_by(Group.created_at.desc()).all()
    return jsonify([group.to_dict() for group in groups])

@bp.route('', methods=['POST'])
def create_group():
    data = request.get_json()
    
    if not data.get('name') or not data.get('branchId') or not data.get('loanOfficerId'):
        return jsonify({'error': 'Name, branchId, and loanOfficerId are required'}), 400
        
    group = Group(
        name=data['name'],
        branch_id=data['branchId'],
        loan_officer_id=data['loanOfficerId'],
        max_members=data.get('maxMembers', 8)
    )
    
    try:
        db.session.add(group)
        db.session.commit()
        return jsonify(group.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
