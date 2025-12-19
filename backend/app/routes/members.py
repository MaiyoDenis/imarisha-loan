from flask import Blueprint, request, jsonify, send_file
from app.models import Member, User, Group, SavingsAccount, DrawdownAccount
from app import db
import qrcode
from io import BytesIO

bp = Blueprint('members', __name__, url_prefix='/api/members')

@bp.route('/<int:id>/qr', methods=['GET'])
def get_member_qr(id):
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
        
    # Data to encode: Member Code
    data = member.member_code
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

@bp.route('', methods=['GET'])
def get_members():
    from flask import session
    from app.models import User
    
    query = Member.query
    
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user and user.role.name != 'admin' and user.branch_id:
            query = query.filter_by(branch_id=user.branch_id)
            
    members = query.order_by(Member.created_at.desc()).all()
    return jsonify([member.to_dict() for member in members])

@bp.route('', methods=['POST'])
def create_member():
    data = request.get_json()
    
    user_id = data.get('userId')
    group_id = data.get('groupId')
    registration_fee = data.get('registrationFee', 800)
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if Member.query.filter_by(user_id=user_id).first():
        return jsonify({'error': 'User is already a member'}), 400
        
    if group_id:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
            
    # Generate member code
    # Format: MB-{Year}-{ID}
    # Since we don't have the ID yet, we can use a temporary placeholder or count
    count = Member.query.count() + 1
    member_code = f"MB{count:04d}"
    
    member = Member(
        user_id=user_id,
        group_id=group_id,
        member_code=member_code,
        registration_fee=registration_fee,
        status='pending'
    )
    
    db.session.add(member)
    db.session.flush() # Get ID
    
    # Create accounts
    savings = SavingsAccount(
        member_id=member.id,
        account_number=f"SAV-{member_code}"
    )
    
    drawdown = DrawdownAccount(
        member_id=member.id,
        account_number=f"DRD-{member_code}"
    )
    
    db.session.add_all([savings, drawdown])
    db.session.commit()
    
    return jsonify(member.to_dict()), 201

@bp.route('/<int:id>', methods=['GET'])
def get_member(id):
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    return jsonify(member.to_dict())
