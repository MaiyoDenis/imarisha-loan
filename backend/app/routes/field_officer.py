from flask import Blueprint, request, jsonify
from app.models import User, Group, Member, Loan, Transaction, SavingsAccount, DrawdownAccount, LoanType, LoanProduct, LoanProductItem, Role, GroupVisit
from app import db
from decimal import Decimal
import uuid
from datetime import datetime, timedelta
from app.utils.decorators import login_required, role_required
from flask_bcrypt import Bcrypt
from sqlalchemy import func

bcrypt = Bcrypt()

bp = Blueprint('field_officer', __name__, url_prefix='/api/field-officer')

@bp.route('/groups', methods=['GET', 'POST'])
@login_required
def get_officer_groups():
    from flask import session
    from sqlalchemy import func
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role.name not in ['field_officer', 'loan_officer', 'admin', 'branch_manager']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if request.method == 'POST':
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Group name is required'}), 400
        
        # Check for unique group name within the branch
        existing_group = Group.query.filter_by(
            name=data.get('name').strip(),
            branch_id=user.branch_id or 1
        ).first()
        
        if existing_group:
            return jsonify({'error': 'Group name already exists in this branch'}), 400
        
        group = Group(
            name=data.get('name').strip(),
            location=data.get('location', ''),
            description=data.get('description', ''),
            branch_id=user.branch_id or 1,
            loan_officer_id=user_id
        )
        
        try:
            db.session.add(group)
            db.session.commit()
            return jsonify(group.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Failed to create group: {str(e)}'}), 500
    
    query = Group.query
    if user.role.name == 'admin':
        pass
    elif user.role.name == 'branch_manager':
        query = query.filter_by(branch_id=user.branch_id)
    else:
        query = query.filter_by(loan_officer_id=user_id)
    
    groups = query.order_by(Group.created_at.desc()).all()
    group_ids = [g.id for g in groups]
    
    if not group_ids:
        return jsonify([])
    
    member_stats = db.session.query(
        Member.group_id,
        func.count(Member.id).label('total_members'),
        func.coalesce(func.sum(SavingsAccount.balance), Decimal('0')).label('total_savings')
    ).outerjoin(SavingsAccount, Member.id == SavingsAccount.member_id).filter(
        Member.group_id.in_(group_ids)
    ).group_by(Member.group_id).all()
    
    loan_stats = db.session.query(
        Member.group_id,
        func.coalesce(func.sum(Loan.outstanding_balance), Decimal('0')).label('total_outstanding'),
        func.coalesce(func.sum(Loan.total_amount), Decimal('0')).label('total_due'),
        func.count(Loan.id).label('loan_count'),
        func.coalesce(func.sum(Loan.principle_amount), Decimal('0')).label('total_principle')
    ).join(Loan, Member.id == Loan.member_id).filter(
        Member.group_id.in_(group_ids),
        Loan.status.in_(['pending', 'approved', 'disbursed', 'released'])
    ).group_by(Member.group_id).all()
    
    repayment_stats = db.session.query(
        Member.group_id,
        func.coalesce(func.sum(Transaction.amount), Decimal('0')).label('total_repaid')
    ).join(Transaction, Member.id == Transaction.member_id).filter(
        Member.group_id.in_(group_ids),
        Transaction.transaction_type == 'loan_repayment'
    ).group_by(Member.group_id).all()
    
    member_dict = {m[0]: m for m in member_stats}
    loan_dict = {l[0]: l for l in loan_stats}
    repay_dict = {r[0]: r for r in repayment_stats}
    
    groups_data = []
    for group in groups:
        group_dict = group.to_dict()
        
        member_stat = member_dict.get(group.id)
        if member_stat:
            group_dict['totalMembers'] = member_stat.total_members
            group_dict['totalSavings'] = str(member_stat.total_savings)
        else:
            group_dict['totalMembers'] = 0
            group_dict['totalSavings'] = '0'
        
        loan_stat = loan_dict.get(group.id)
        if loan_stat:
            total_outstanding = float(loan_stat.total_outstanding)
            total_due = float(loan_stat.total_due)
            group_dict['totalLoansOutstanding'] = str(total_outstanding)
            group_dict['totalLoans'] = loan_stat.loan_count
            group_dict['totalLoaned'] = str(loan_stat.total_principle)
        else:
            total_outstanding = 0
            total_due = 0
            group_dict['totalLoansOutstanding'] = '0'
            group_dict['totalLoans'] = 0
            group_dict['totalLoaned'] = '0'
        
        repay_stat = repay_dict.get(group.id)
        total_repaid = float(repay_stat.total_repaid) if repay_stat else 0
        
        repayment_rate = 0
        if total_due > 0:
            repayment_rate = (total_repaid / total_due * 100)
        
        group_dict['repaymentRate'] = round(repayment_rate, 2)
        groups_data.append(group_dict)
    
    return jsonify(groups_data)

@bp.route('/groups/<int:group_id>/members', methods=['GET'])
@login_required
def get_group_members(group_id):
    from flask import session
    from sqlalchemy import func
    from sqlalchemy.orm import joinedload
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    if user.role.name != 'admin' and group.loan_officer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    members = Member.query.options(joinedload(Member.user)).filter_by(group_id=group_id).all()
    member_ids = [m.id for m in members]
    
    if not member_ids:
        return jsonify([])
    
    loan_stats = db.session.query(
        Loan.member_id,
        func.count(Loan.id).label('active_loans_count'),
        func.coalesce(func.sum(Loan.outstanding_balance), Decimal('0')).label('total_outstanding')
    ).filter(
        Loan.member_id.in_(member_ids),
        Loan.status.in_(['pending', 'approved', 'disbursed', 'released'])
    ).group_by(Loan.member_id).all()
    
    savings_stats = db.session.query(
        SavingsAccount.member_id,
        SavingsAccount.balance
    ).filter(SavingsAccount.member_id.in_(member_ids)).all()
    
    repayment_stats = db.session.query(
        Transaction.member_id,
        func.coalesce(func.sum(Transaction.amount), Decimal('0')).label('total_repaid')
    ).filter(
        Transaction.member_id.in_(member_ids),
        Transaction.transaction_type == 'loan_repayment'
    ).group_by(Transaction.member_id).all()
    
    loan_dict = {l[0]: l for l in loan_stats}
    savings_dict = {s[0]: s[1] for s in savings_stats}
    repay_dict = {r[0]: r for r in repayment_stats}
    
    members_data = []
    for member in members:
        member_dict = member.to_dict()
        
        loan_stat = loan_dict.get(member.id)
        if loan_stat:
            member_dict['activeLoans'] = loan_stat.active_loans_count
            member_dict['totalOutstanding'] = str(loan_stat.total_outstanding)
        else:
            member_dict['activeLoans'] = 0
            member_dict['totalOutstanding'] = '0'
        
        savings_balance = savings_dict.get(member.id)
        if savings_balance:
            member_dict['savingsBalance'] = str(savings_balance)
        else:
            member_dict['savingsBalance'] = '0'
        
        repay_stat = repay_dict.get(member.id)
        total_repaid = float(repay_stat.total_repaid) if repay_stat else 0
        member_dict['totalRepaid'] = str(total_repaid)
        
        member_dict['user'] = {
            'firstName': member.user.first_name,
            'lastName': member.user.last_name,
            'phone': member.user.phone
        }
        
        members_data.append(member_dict)
    
    return jsonify(members_data)

@bp.route('/members/<int:member_id>/dashboard', methods=['GET'])
@login_required
def get_member_dashboard(member_id):
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    # Allow admin or the member themselves or the member's loan officer
    if user.role.name == 'admin':
        pass
    elif user.id == member.user_id:
        pass
    else:
        group = member.group
        if not group or group.loan_officer_id != user.id:
            return jsonify({'error': 'Unauthorized'}), 403
    
    member_data = member.to_dict()
    member_data['user'] = {
        'id': member.user.id,
        'firstName': member.user.first_name,
        'lastName': member.user.last_name,
        'phone': member.user.phone
    }
    
    # Include pending, approved, and disbursed loans in the dashboard summary
    active_loans = Loan.query.filter(
        Loan.member_id == member_id,
        Loan.status.in_(['pending', 'approved', 'disbursed', 'released'])
    ).all()
    
    loans_data = []
    total_outstanding = Decimal('0')
    
    for loan in active_loans:
        loan_dict = loan.to_dict()
        days_until_due = (loan.due_date - datetime.utcnow()).days if loan.due_date else None
        loan_dict['daysUntilDue'] = days_until_due
        
        # Determine status for display
        if loan.status == 'disbursed':
            loan_dict['status'] = 'overdue' if days_until_due and days_until_due < 0 else 'active'
        else:
            loan_dict['status'] = loan.status
        
        loans_data.append(loan_dict)
        total_outstanding += Decimal(loan.outstanding_balance)
    
    savings = member.savings_account
    savings_balance = Decimal('0')
    if savings:
        savings_balance = savings.balance
    
    drawdown = member.drawdown_account
    drawdown_balance = Decimal('0')
    if drawdown:
        drawdown_balance = drawdown.balance
    
    loans_history = Loan.query.filter_by(member_id=member_id).all()
    total_borrowed = sum([Decimal(loan.principle_amount) for loan in loans_history])
    
    repayments = Transaction.query.filter_by(
        member_id=member_id,
        transaction_type='loan_repayment'
    ).all()
    total_repaid = sum([Decimal(t.amount) for t in repayments])
    
    # Calculate loan limit as 4 times savings balance
    if member.status != 'active':
        max_loan_limit = Decimal('0')
    else:
        max_loan_limit = savings_balance * Decimal('4')
        # Apply minimum and maximum limits only if active
        max_loan_limit = max(max_loan_limit, Decimal('5000'))  # Minimum 5000
        max_loan_limit = min(max_loan_limit, Decimal('50000'))  # Maximum 50000
    
    available_loan = max(Decimal('0'), max_loan_limit - total_outstanding)
    
    member_data['activeLoans'] = loans_data
    member_data['totalOutstanding'] = str(total_outstanding)
    member_data['savingsBalance'] = str(savings_balance)
    member_data['drawdownBalance'] = str(drawdown_balance)
    member_data['maxLoanLimit'] = str(max_loan_limit)
    member_data['availableLoan'] = str(available_loan)
    member_data['totalBorrowed'] = str(total_borrowed)
    member_data['totalRepaid'] = str(total_repaid)
    member_data['repaymentRate'] = round((float(total_repaid) / float(total_borrowed) * 100), 2) if total_borrowed > 0 else 0
    
    recent_transactions = Transaction.query.filter_by(member_id=member_id).order_by(
        Transaction.created_at.desc()
    ).limit(10).all()
    
    member_data['recentTransactions'] = [t.to_dict() for t in recent_transactions]
    
    return jsonify(member_data)

@bp.route('/members/<int:member_id>/apply-loan', methods=['POST'])
@login_required
def apply_loan_for_member(member_id):
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'active':
        return jsonify({'error': 'Member must have active status to apply for loans'}), 400
    
    # Allow admin or the member themselves or the member's loan officer
    if user.role.name == 'admin':
        pass
    elif user.id == member.user_id:
        pass
    elif user.role.name in ['field_officer', 'loan_officer']:
        group = member.group
        if not group or group.loan_officer_id != user.id:
            return jsonify({'error': 'Unauthorized'}), 403
    else:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    loan_type_id = data.get('loanTypeId')
    amount = data.get('amount')
    items = data.get('items', [])
    
    if not loan_type_id:
        return jsonify({'error': 'Loan type is required'}), 400
    
    loan_type = LoanType.query.get(loan_type_id)
    if not loan_type:
        return jsonify({'error': 'Loan type not found'}), 404
    
    principle_amount = Decimal('0')
    loan_items = []
    
    if items:
        for item in items:
            product_id = item.get('productId')
            quantity = item.get('quantity', 1)
            
            product = LoanProduct.query.get(product_id)
            if not product:
                return jsonify({'error': f'Product {product_id} not found'}), 404
            
            if product.stock_quantity < quantity:
                return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
            unit_price = product.selling_price
            total_price = Decimal(str(unit_price)) * Decimal(str(quantity))
            principle_amount += total_price
            
            loan_items.append({
                'product': product,
                'quantity': quantity,
                'unit_price': unit_price,
                'total_price': total_price
            })
    elif amount:
        try:
            principle_amount = Decimal(str(amount))
        except:
            return jsonify({'error': 'Invalid amount'}), 400
    else:
        return jsonify({'error': 'Either amount or items must be provided'}), 400
    
    if principle_amount < loan_type.min_amount or principle_amount > loan_type.max_amount:
        return jsonify({'error': f'Amount must be between {loan_type.min_amount} and {loan_type.max_amount}'}), 400
    
    interest_amount = principle_amount * Decimal(str(loan_type.interest_rate)) / Decimal('100')
    charge_fee = principle_amount * Decimal(str(loan_type.charge_fee_percentage)) / Decimal('100')
    total_amount = principle_amount + interest_amount + charge_fee
    
    loan_number = f"LN-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    due_date = datetime.utcnow() + timedelta(days=loan_type.duration_months * 30)
    
    loan = Loan(
        loan_number=loan_number,
        member_id=member_id,
        loan_type_id=loan_type_id,
        principle_amount=principle_amount,
        interest_amount=interest_amount,
        charge_fee=charge_fee,
        total_amount=total_amount,
        outstanding_balance=total_amount,
        status='pending',
        due_date=due_date
    )
    
    db.session.add(loan)
    db.session.flush()
    
    # Add items if any
    for item_info in loan_items:
        product = item_info['product']
        quantity = item_info['quantity']
        
        # Deduct stock
        if product.stock_quantity < quantity:
            db.session.rollback()
            return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
        product.stock_quantity -= quantity
        
        product_item = LoanProductItem(
            loan_id=loan.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=item_info['unit_price'],
            total_price=item_info['total_price']
        )
        db.session.add(product_item)
    
    db.session.commit()

    # Notify procurement officers
    try:
        from app.services.notification_service import notification_service, NotificationChannel
        procurement_officers = User.query.join(Role).filter(Role.name == 'procurement_officer').all()
        for officer in procurement_officers:
            notification_service.send_notification(
                recipient_id=officer.id,
                template_id="loan_created",
                variables={
                    "loan_number": loan_number,
                    "amount": f"KES {principle_amount}",
                    "field_officer": f"{user.first_name} {user.last_name}"
                },
                channel=NotificationChannel.IN_APP
            )
    except Exception as e:
        # Don't fail the loan application if notification fails
        print(f"Failed to send notification: {str(e)}")
    
    return jsonify({
        'message': 'Loan application created successfully',
        'loan': loan.to_dict()
    }), 201

@bp.route('/members/<int:member_id>/transfer', methods=['POST'])
@login_required
@role_required(['field_officer', 'loan_officer', 'admin'])
def transfer_funds(member_id):
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'active':
        return jsonify({'error': 'Member must have active status to apply for loans'}), 400
    
    if user.role.name != 'admin':
        group = member.group
        if not group or group.loan_officer_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    from_account_type = data.get('fromAccountType')
    to_account_type = data.get('toAccountType')
    amount = data.get('amount')
    reference = data.get('reference', '')
    
    if not all([from_account_type, to_account_type, amount]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        amount_decimal = Decimal(str(amount))
    except:
        return jsonify({'error': 'Invalid amount'}), 400
    
    if amount_decimal <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400
    
    from_account = None
    to_account = None
    
    if from_account_type == 'savings':
        from_account = member.savings_account
    elif from_account_type == 'drawdown':
        from_account = member.drawdown_account
    else:
        return jsonify({'error': 'Invalid from account type'}), 400
    
    if to_account_type == 'savings':
        to_account = member.savings_account
    elif to_account_type == 'drawdown':
        to_account = member.drawdown_account
    else:
        return jsonify({'error': 'Invalid to account type'}), 400
    
    if not from_account or not to_account:
        return jsonify({'error': 'Account not found'}), 404
    
    if from_account.balance < amount_decimal:
        return jsonify({'error': 'Insufficient balance'}), 400
    
    from_account.balance -= amount_decimal
    to_account.balance += amount_decimal
    
    transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    
    transaction = Transaction(
        transaction_id=transaction_id,
        member_id=member_id,
        account_type=from_account_type,
        transaction_type='transfer',
        amount=amount_decimal,
        balance_before=from_account.balance + amount_decimal,
        balance_after=from_account.balance,
        reference=reference or f"Transfer from {from_account_type} to {to_account_type}",
        processed_by=user_id,
        status='confirmed',
        confirmed_by=user_id,
        confirmed_at=datetime.utcnow()
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transfer completed successfully',
        'transaction': transaction.to_dict()
    }), 201

@bp.route('/groups/<int:group_id>/stats', methods=['GET'])
@login_required
def get_group_stats(group_id):
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    if user.role.name != 'admin' and group.loan_officer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    members = Member.query.filter_by(group_id=group_id).all()
    
    total_members = len(members)
    active_members = len([m for m in members if m.status == 'active'])
    
    total_savings = sum(member.savings_account.balance for member in members 
                       if member.savings_account)
    
    loans = Loan.query.join(Member).filter(
        Member.group_id == group_id
    ).all()
    
    total_loans_disbursed = sum([float(loan.principle_amount) for loan in loans if loan.status in ['disbursed', 'released', 'completed']])
    total_loans_outstanding = sum([float(loan.outstanding_balance) for loan in loans if loan.status == 'disbursed'])
    
    repayments = Transaction.query.join(Member).filter(
        Member.group_id == group_id,
        Transaction.transaction_type == 'loan_repayment'
    ).all()
    
    total_repaid = sum([float(t.amount) for t in repayments])
    
    active_loans = [l for l in loans if l.status == 'disbursed']
    repayment_rate = 0
    if active_loans:
        total_due = sum([float(loan.total_amount) for loan in active_loans])
        repayment_rate = (total_repaid / total_due * 100) if total_due > 0 else 0
    
    return jsonify({
        'groupId': group_id,
        'groupName': group.name,
        'totalMembers': total_members,
        'activeMembers': active_members,
        'totalSavings': str(total_savings),
        'totalLoansDisbursed': str(Decimal(str(total_loans_disbursed))),
        'totalLoansOutstanding': str(Decimal(str(total_loans_outstanding))),
        'totalRepaid': str(Decimal(str(total_repaid))),
        'repaymentRate': round(repayment_rate, 2),
        'totalLoans': len(active_loans)
    })

@bp.route('/members', methods=['POST'])
@login_required
def add_member_to_group():
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role.name not in ['field_officer', 'loan_officer', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    required_fields = ['firstName', 'lastName', 'phone', 'groupId']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    group_id = data.get('groupId')
    group = Group.query.get(group_id)
    
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    if user.role.name != 'admin' and group.loan_officer_id != user_id:
        return jsonify({'error': 'Unauthorized to add members to this group'}), 403
    
    existing_user = User.query.filter_by(phone=data.get('phone')).first()
    
    if existing_user:
        member = Member.query.filter_by(user_id=existing_user.id, group_id=group_id).first()
        if member:
            return jsonify({'error': 'User is already a member of this group'}), 409
    else:
        new_user = User(
            username=f"member_{uuid.uuid4().hex[:8]}",
            phone=data.get('phone'),
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            role_id=Role.query.filter_by(name='customer').first().id,
            is_active=True,
            password=bcrypt.generate_password_hash('defaultpassword').decode('utf-8')
        )
        db.session.add(new_user)
        db.session.flush()
        existing_user = new_user
    
    # Generate unique member code in format: MEM-{branch_id}-{group_id}-{sequence}
    def generate_member_code():
        # Get the next sequence number for this branch and group
        max_code = db.session.query(func.max(Member.id)).filter_by(
            branch_id=group.branch_id,
            group_id=group_id
        ).scalar() or 0
        
        sequence = max_code + 1
        return f"MEM-{group.branch_id}-{group_id}-{sequence:04d}"
    
    member_code = generate_member_code()
    
    # Ensure member code is truly unique
    while Member.query.filter_by(member_code=member_code).first():
        member_code = generate_member_code()
    
    member = Member(
        user_id=existing_user.id,
        group_id=group_id,
        branch_id=group.branch_id,
        member_code=member_code,
        status='pending'  # Start as pending, not active
    )
    
    try:
        db.session.add(member)
        db.session.flush()
        
        # Create savings account with 0 balance
        savings_account = SavingsAccount(
            member_id=member.id,
            account_number=f"SAV{member.id}{uuid.uuid4().hex[:6].upper()}",
            balance=Decimal('0')
        )
        
        # Create drawdown account with -800 (registration fee)
        drawdown_account = DrawdownAccount(
            member_id=member.id,
            account_number=f"DRD{member.id}{uuid.uuid4().hex[:6].upper()}",
            balance=Decimal('-800')  # Registration fee
        )
        
        db.session.add(savings_account)
        db.session.add(drawdown_account)
        db.session.commit()
        
        return jsonify(member.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create member: {str(e)}'}), 500

@bp.route('/groups/<int:group_id>/visits', methods=['GET', 'POST'])
@login_required
def manage_group_visits(group_id):
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    if user.role.name != 'admin' and group.loan_officer_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if request.method == 'POST':
        # Import GroupVisit model
        try:
            from app.models import GroupVisit
        except ImportError:
            return jsonify({'error': 'Group visits feature not yet available'}), 501
        
        data = request.get_json()
        
        if not data or not data.get('visitDate') or not data.get('notes'):
            return jsonify({'error': 'visitDate and notes are required'}), 400
        
        try:
            from datetime import datetime
            visit_date_str = data.get('visitDate')
            # Handle 'Z' suffix for Python versions < 3.11
            if visit_date_str.endswith('Z'):
                visit_date_str = visit_date_str.replace('Z', '+00:00')
            visit_date = datetime.fromisoformat(visit_date_str).date()
        except Exception as e:
            return jsonify({'error': f'Invalid visit date format: {str(e)}'}), 400
        
        visit = GroupVisit(
            group_id=group_id,
            field_officer_id=user_id,
            visit_date=visit_date,
            notes=data.get('notes')
        )
        
        db.session.add(visit)
        db.session.commit()
        
        return jsonify(visit.to_dict()), 201
    
    # GET request
    try:
        from app.models import GroupVisit
    except ImportError:
        return jsonify([]), 200
    
    visits = GroupVisit.query.filter_by(group_id=group_id).order_by(GroupVisit.visit_date.desc()).all()
    
    return jsonify([visit.to_dict() for visit in visits])

@bp.route('/reminders', methods=['GET'])
@login_required
def check_meeting_reminders():
    from flask import session
    user_id = session.get('user_id')
    from datetime import datetime, timedelta
    from app.models import GroupVisit, Group
    from app.services.notification_service import notification_service, NotificationChannel
    
    # Check for meetings in the next 2 hours
    now = datetime.utcnow()
    two_hours_later = now + timedelta(hours=2)
    
    # GroupVisit.visit_date is a Date object, so we check today's visits
    today = now.date()
    visits = GroupVisit.query.filter_by(
        field_officer_id=user_id,
        visit_date=today
    ).all()
    
    reminders_sent = 0
    for visit in visits:
        # Check if we already sent a reminder for this visit today in Redis to avoid duplicates
        reminder_key = f"reminder_sent:{user_id}:{visit.id}:{today.isoformat()}"
        if not notification_service.redis_client.get(reminder_key):
            notification_service.send_notification(
                recipient_id=user_id,
                template_id="meeting_reminder",
                variables={
                    "group_name": visit.group.name if visit.group else "Your Group",
                    "time": "Today",
                    "location": visit.group.location if visit.group else "Scheduled Location"
                },
                channel=NotificationChannel.IN_APP
            )
            # Mark as sent for today (expire in 24 hours)
            notification_service.redis_client.setex(reminder_key, 86400, "1")
            reminders_sent += 1
            
    return jsonify({'reminders_sent': reminders_sent})

@bp.route('/members/pending-approval', methods=['GET'])
@login_required
@role_required(['procurement_officer', 'branch_manager', 'admin'])
def get_pending_members():
    """Get all members pending approval"""
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    query = Member.query.filter_by(status='pending')
    
    # If not admin, show only members from the user's branch
    if user.role.name != 'admin':
        query = query.filter_by(branch_id=user.branch_id)
    
    pending_members = query.options(
        db.joinedload(Member.user),
        db.joinedload(Member.group),
        db.joinedload(Member.branch)
    ).all()
    
    members_data = []
    for member in pending_members:
        member_dict = member.to_dict()
        member_dict['user'] = {
            'id': member.user.id,
            'firstName': member.user.first_name,
            'lastName': member.user.last_name,
            'phone': member.user.phone,
            'username': member.user.username
        }
        if member.group:
            member_dict['group'] = {
                'id': member.group.id,
                'name': member.group.name
            }
        if member.branch:
            member_dict['branch'] = {
                'id': member.branch.id,
                'name': member.branch.name,
                'location': member.branch.location
            }
        members_data.append(member_dict)
    
    return jsonify(members_data)

@bp.route('/members/<int:member_id>/approve', methods=['POST'])
@login_required
@role_required(['procurement_officer', 'branch_manager', 'admin'])
def approve_member(member_id):
    """Approve a pending member"""
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'pending':
        return jsonify({'error': 'Member is not in pending status'}), 400
    
    # If not admin, ensure member is from the user's branch
    if user.role.name != 'admin' and member.branch_id != user.branch_id:
        return jsonify({'error': 'Unauthorized to approve members from other branches'}), 403
    
    try:
        member.status = 'active'
        db.session.commit()
        
        return jsonify({
            'message': 'Member approved successfully',
            'member': member.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to approve member: {str(e)}'}), 500

@bp.route('/members/<int:member_id>/reject', methods=['POST'])
@login_required
@role_required(['procurement_officer', 'branch_manager', 'admin'])
def reject_member(member_id):
    """Reject a pending member"""
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    if member.status != 'pending':
        return jsonify({'error': 'Member is not in pending status'}), 400
    
    # If not admin, ensure member is from the user's branch
    if user.role.name != 'admin' and member.branch_id != user.branch_id:
        return jsonify({'error': 'Unauthorized to reject members from other branches'}), 403
    
    try:
        member.status = 'blocked'  # Set to blocked instead of deleting
        db.session.commit()
        
        return jsonify({
            'message': 'Member rejected successfully',
            'member': member.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to reject member: {str(e)}'}), 500

@bp.route('/members/bulk-approve', methods=['POST'])
@login_required
@role_required(['procurement_officer', 'branch_manager', 'admin'])
def bulk_approve_members():
    """Bulk approve multiple pending members"""
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    data = request.get_json()
    member_ids = data.get('memberIds', [])
    
    if not member_ids:
        return jsonify({'error': 'No member IDs provided'}), 400
    
    try:
        # Get pending members that can be approved by this user
        query = Member.query.filter(
            Member.id.in_(member_ids),
            Member.status == 'pending'
        )
        
        # If not admin, filter by branch
        if user.role.name != 'admin':
            query = query.filter_by(branch_id=user.branch_id)
        
        members_to_approve = query.all()
        
        if not members_to_approve:
            return jsonify({'error': 'No valid members found for approval'}), 400
        
        approved_count = 0
        for member in members_to_approve:
            member.status = 'active'
            approved_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully approved {approved_count} members',
            'approvedCount': approved_count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to bulk approve members: {str(e)}'}), 500

@bp.route('/transactions/first-deposit', methods=['POST'])
@login_required
def process_first_deposit():
    """Process first deposit and handle registration fee deduction"""
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    data = request.get_json()
    member_id = data.get('memberId')
    deposit_amount = data.get('amount')
    transaction_reference = data.get('reference', '')
    
    if not all([member_id, deposit_amount]):
        return jsonify({'error': 'Member ID and amount are required'}), 400
    
    try:
        deposit_amount_decimal = Decimal(str(deposit_amount))
    except:
        return jsonify({'error': 'Invalid deposit amount'}), 400
    
    if deposit_amount_decimal <= 0:
        return jsonify({'error': 'Deposit amount must be greater than 0'}), 400
    
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    # Check if this is the first deposit
    existing_deposits = Transaction.query.filter_by(
        member_id=member_id,
        transaction_type='deposit',
        account_type='savings'
    ).count()
    
    if existing_deposits > 0:
        # Regular deposit, no special handling needed
        if not member.savings_account:
            return jsonify({'error': 'Savings account not found'}), 404
        
        balance_before = member.savings_account.balance
        member.savings_account.balance += deposit_amount_decimal
        
        transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        
        transaction = Transaction(
            transaction_id=transaction_id,
            member_id=member_id,
            account_type='savings',
            transaction_type='deposit',
            amount=deposit_amount_decimal,
            balance_before=balance_before,
            balance_after=member.savings_account.balance,
            reference=transaction_reference or 'Regular deposit',
            processed_by=user_id,
            status='confirmed',
            confirmed_by=user_id,
            confirmed_at=datetime.utcnow()
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Deposit processed successfully',
            'transaction': transaction.to_dict()
        }), 201
    
    # This is the first deposit - handle registration fee deduction
    if not member.savings_account or not member.drawdown_account:
        return jsonify({'error': 'Member accounts not found'}), 404
    
    if member.status in ['pending', 'inactive']:
        # Change status to active upon first deposit
        member.status = 'active'
    
    # Process the deposit
    balance_before = member.savings_account.balance
    member.savings_account.balance += deposit_amount_decimal
    
    # Check if we can deduct the registration fee from drawdown
    registration_fee = Decimal('800')
    
    if member.drawdown_account.balance < 0:
        # Deduct registration fee from the deposit
        drawdown_balance_before = member.drawdown_account.balance
        member.drawdown_account.balance += registration_fee  # Moving towards 0
        member.registration_fee_paid = True
        
        # Create transaction for registration fee deduction
        transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
        
        transaction = Transaction(
            transaction_id=transaction_id,
            member_id=member_id,
            account_type='drawdown',
            transaction_type='registration_fee',
            amount=registration_fee,
            balance_before=drawdown_balance_before,
            balance_after=member.drawdown_account.balance,
            reference='Registration fee deducted from first deposit',
            processed_by=user_id,
            status='confirmed',
            confirmed_by=user_id,
            confirmed_at=datetime.utcnow()
        )
        
        db.session.add(transaction)
    
    # Create deposit transaction
    transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    
    transaction = Transaction(
        transaction_id=transaction_id,
        member_id=member_id,
        account_type='savings',
        transaction_type='deposit',
        amount=deposit_amount_decimal,
        balance_before=balance_before,
        balance_after=member.savings_account.balance,
        reference=transaction_reference or 'First deposit',
        processed_by=user_id,
        status='confirmed',
        confirmed_by=user_id,
        confirmed_at=datetime.utcnow()
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'First deposit processed successfully with registration fee deduction',
        'memberStatus': member.status,
        'registrationFeeDeducted': str(registration_fee),
        'transaction': transaction.to_dict()
    }), 201
