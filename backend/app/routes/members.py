from flask import Blueprint, request, jsonify, send_file, session
from app.models import Member, User, Group, SavingsAccount, DrawdownAccount
from app import db
import qrcode
from io import BytesIO
from datetime import datetime

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
    branch_id = data.get('branchId')
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
        # Use group branch_id if member branch_id not provided
        if not branch_id:
            branch_id = group.branch_id
            
    # Generate unique member code with format: MEM-{branch_id}-{group_id}-{sequence}
    # Get the next sequence number for this branch/group combination
    if group_id:
        existing_count = Member.query.filter_by(group_id=group_id).count()
        sequence = existing_count + 1
        member_code = f"MEM-{branch_id or 'UNK'}-{group_id}-{sequence:03d}"
    else:
        existing_count = Member.query.filter_by(branch_id=branch_id).count()
        sequence = existing_count + 1
        member_code = f"MEM-{branch_id or 'UNK'}-G{sequence:03d}"
    
    # Create member with pending status (requires approval)
    member = Member(
        user_id=user_id,
        group_id=group_id,
        branch_id=branch_id,
        member_code=member_code,
        registration_fee=registration_fee,
        registration_fee_paid=False,  # Will be set when first deposit is made
        status='pending'  # Must be approved by procurement officer/branch manager/admin
    )
    
    db.session.add(member)
    db.session.flush() # Get ID
    
    # Create savings account with 0 balance
    savings = SavingsAccount(
        member_id=member.id,
        account_number=f"SAV-{member_code}",
        balance=0.0
    )
    
    # Create drawdown account with -800 balance (registration fee debt)
    drawdown = DrawdownAccount(
        member_id=member.id,
        account_number=f"DRD-{member_code}",
        balance=-float(registration_fee)  # Negative balance representing debt
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

@bp.route('/<int:id>/approve', methods=['POST'])
def approve_member(id):
    """Approve a pending member - only for procurement officer, branch manager, or admin"""
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'pending':
        return jsonify({'error': 'Member is not pending approval'}), 400
    
    # Check if user has permission to approve
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Only procurement officer, branch manager, or admin can approve
    allowed_roles = ['procurement_officer', 'branch_manager', 'admin']
    if user.role.name not in allowed_roles:
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    # Update member status to inactive (waiting for registration fee payment)
    member.status = 'inactive'
    db.session.commit()
    
    return jsonify({
        'message': 'Member approved successfully. Status set to inactive pending registration fee payment.',
        'member': member.to_dict()
    })

@bp.route('/<int:id>/process-registration-fee', methods=['POST'])
def process_registration_fee(id):
    """Process registration fee deduction and activate member if not already active"""
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    # Check if registration fee is already paid
    if member.registration_fee_paid:
        return jsonify({'message': 'Registration fee already processed'}), 200
    
    # Process registration fee deduction
    # This would typically be called after first deposit transaction
    member.registration_fee_paid = True
    
    # If member is still pending (hasn't been approved yet), keep pending
    # If member was already approved, ensure they're active
    if member.status == 'pending':
        # Wait for approval from procurement officer/branch manager/admin
        pass
    elif member.status == 'inactive':
        member.status = 'active'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Registration fee processed successfully',
        'member': member.to_dict()
    })

@bp.route('/pending', methods=['GET'])
def get_pending_members():
    """Get all members pending approval - for procurement officer/branch manager/admin dashboard"""
    # Check if user has permission
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Only procurement officer, branch manager, or admin can view pending approvals
    allowed_roles = ['procurement_officer', 'branch_manager', 'admin']
    if user.role.name not in allowed_roles:
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    # Get pending members for this branch (or all if admin)
    query = Member.query.filter_by(status='pending')
    
    if user.role.name != 'admin' and user.branch_id:
        query = query.filter_by(branch_id=user.branch_id)
    
    pending_members = query.order_by(Member.created_at.desc()).all()
    
    result = []
    for member in pending_members:
        member_data = member.to_dict()
        # Add nested user data
        member_data['user'] = {
            'id': member.user.id,
            'firstName': member.user.first_name,
            'lastName': member.user.last_name,
            'username': member.user.username,
            'phone': member.user.phone
        }
        # Add nested group data if exists
        if member.group:
            member_data['group'] = {
                'id': member.group.id,
                'name': member.group.name
            }
        # Add nested branch data if exists
        if member.branch:
            member_data['branch'] = {
                'id': member.branch.id,
                'name': member.branch.name,
                'location': member.branch.location
            }
        result.append(member_data)
    
    return jsonify(result)

@bp.route('/bulk-approve', methods=['POST'])
def bulk_approve_members():
    """Approve multiple pending members at once"""
    # Check permission
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    allowed_roles = ['procurement_officer', 'branch_manager', 'admin']
    if user.role.name not in allowed_roles:
        return jsonify({'error': 'Insufficient permissions'}), 403
        
    data = request.get_json()
    member_ids = data.get('memberIds', [])
    
    if not member_ids:
        return jsonify({'error': 'No members selected'}), 400
        
    success_count = 0
    failed_count = 0
    
    for member_id in member_ids:
        member = Member.query.get(member_id)
        if member and member.status == 'pending':
            # Check branch permission for non-admins
            if user.role.name != 'admin' and member.branch_id != user.branch_id:
                failed_count += 1
                continue
                
            member.status = 'inactive' # Approved but inactive until registration fee paid
            success_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'Successfully approved {success_count} members',
        'processed': success_count,
        'failed': failed_count
    })

@bp.route('/<int:id>/reject', methods=['POST'])
def reject_member(id):
    """Reject a pending member application"""
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'pending':
        return jsonify({'error': 'Member is not pending approval'}), 400
    
    # Check permissions
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    allowed_roles = ['procurement_officer', 'branch_manager', 'admin']
    if user.role.name not in allowed_roles:
        return jsonify({'error': 'Insufficient permissions'}), 403
        
    # Check branch permission for non-admins
    if user.role.name != 'admin' and member.branch_id != user.branch_id:
        return jsonify({'error': 'Cannot reject member from another branch'}), 403
    
    # Update status to rejected
    member.status = 'rejected'
    db.session.commit()
    
    return jsonify({
        'message': 'Member application rejected',
        'member': member.to_dict()
    })

@bp.route('/<int:id>/loan-limit', methods=['GET'])
def get_loan_limit(id):
    """Get calculated loan limit for a member (4x savings balance)"""
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'active':
        return jsonify({'error': 'Member must be active to apply for loans'}), 400
    
    # Calculate loan limit: 4x total savings
    total_savings = member.savings_account.balance if member.savings_account else 0
    loan_limit = total_savings * 4
    
    # Apply maximum limit of 50,000
    loan_limit = min(loan_limit, 50000)
    
    return jsonify({
        'member_id': id,
        'total_savings': float(total_savings),
        'loan_limit': float(loan_limit),
        'calculation': f"4 × {total_savings} = {loan_limit}"
    })

@bp.route('/<int:id>/sync-status', methods=['POST'])
def sync_member_status(id):
    """Force sync member status based on registration fee payment"""
    member = Member.query.get(id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
        
    updated = False
    
    # Check if registration fee is actually paid (balance >= 0)
    if not member.registration_fee_paid and member.drawdown_account and member.drawdown_account.balance >= 0:
        member.registration_fee_paid = True
        updated = True
        
    # Activate if they are inactive but fee is paid
    if member.status == 'inactive' and member.registration_fee_paid:
        member.status = 'active'
        updated = True
        
    if updated:
        db.session.commit()
        return jsonify({
            'message': 'Member status synced successfully',
            'member': member.to_dict()
        })
    else:
        return jsonify({
            'message': 'No status changes needed',
            'member': member.to_dict()
        })
