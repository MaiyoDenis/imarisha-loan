from flask import Blueprint, request, jsonify
from app.models import Loan, LoanType, Member, LoanProduct, LoanProductItem, SavingsAccount
from app import db
from decimal import Decimal
import uuid
from datetime import datetime
from app.utils.decorators import login_required, role_required
from app.services.loan_service import loan_service
from app.services import jwt_service

bp = Blueprint('loans', __name__, url_prefix='/api/loans')

@bp.route('', methods=['GET'])
@login_required
def get_loans():
    status = request.args.get('status')
    
    from app.models import User
    from flask import session
    user_id = session.get('user_id')
    user = User.query.get(user_id)

    query = Loan.query
    if status:
        query = query.filter_by(status=status)
    
    # Filter by branch if user is not admin
    if user and user.role.name != 'admin' and user.branch_id:
        query = query.join(Member).filter(Member.branch_id == user.branch_id)
        
    loans = query.order_by(Loan.created_at.desc()).all()
    return jsonify([loan.to_dict() for loan in loans])

@bp.route('', methods=['POST'])
@login_required
def create_loan():
    data = request.get_json()
    
    member_id = data.get('memberId')
    loan_type_id = data.get('loanTypeId')
    amount = data.get('amount')
    items = data.get('items', []) # List of {productId, quantity}
    
    if not member_id or not loan_type_id:
        return jsonify({'error': 'Missing required fields'}), 400
        
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
        
    loan_type = LoanType.query.get(loan_type_id)
    if not loan_type:
        return jsonify({'error': 'Loan type not found'}), 404
        
    principle_amount = Decimal(0)
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
            total_price = unit_price * quantity
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

    # Check 4x savings rule
    savings_account = SavingsAccount.query.filter_by(member_id=member_id).first()
    savings_balance = savings_account.balance if savings_account else Decimal(0)
    max_loan_limit = savings_balance * 4
    
    if principle_amount > max_loan_limit:
        return jsonify({
            'error': f'Loan amount exceeds limit. Max limit is {max_loan_limit} (4x Savings: {savings_balance})'
        }), 400
        
    # Check risk score
    from app.services.risk_service import risk_service
    risk_data = risk_service.calculate_risk_score(member_id)
    if risk_data['category'] == 'Critical Risk':
        return jsonify({'error': 'Loan application rejected due to critical risk status'}), 400
        
    # Calculate interest and fees
    from app.services.loan_service import loan_service
    
    calculation = loan_service.calculate_total_amount(principle_amount, loan_type)
    interest_amount = calculation['interest']
    charge_fee = calculation['charge_fee']
    total_amount = calculation['total_amount']
    
    loan_number = f"LN-{uuid.uuid4().hex[:8].upper()}"
    
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
        application_date=datetime.utcnow()
    )
    
    db.session.add(loan)
    db.session.flush() # Get ID
    
    # Add items if any
    for item in loan_items:
        product = item['product']
        quantity = item['quantity']
        
        # Double check stock one last time before committing
        if product.stock_quantity < quantity:
            db.session.rollback()
            return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
        # Deduct stock immediately on application
        product.stock_quantity -= quantity
        
        loan_item = LoanProductItem(
            loan_id=loan.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=item['unit_price'],
            total_price=item['total_price']
        )
        db.session.add(loan_item)
        
    db.session.commit()
    
    return jsonify(loan.to_dict()), 201

@bp.route('/<int:id>/cancel', methods=['POST'])
@login_required
def cancel_loan(id):
    from flask import session
    user_id = session.get('user_id')
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
        
    # Check if user is the owner or an admin
    is_owner = loan.member.user_id == user_id
    from app.models import User
    user = User.query.get(user_id)
    is_admin = user and user.role.name == 'admin'
    
    if not (is_owner or is_admin):
        return jsonify({'error': 'Unauthorized'}), 403
        
    if loan.status != 'pending':
        return jsonify({'error': 'Only pending loans can be cancelled'}), 400
        
    # Restore stock
    for item in loan.items:
        item.product.stock_quantity += item.quantity
        
    loan.status = 'cancelled'
    db.session.commit()
    
    return jsonify(loan.to_dict())

@bp.route('/<int:id>', methods=['GET'])
@login_required
def get_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    return jsonify(loan.to_dict())

@bp.route('/<int:id>/under-review', methods=['POST'])
@role_required(['admin', 'branch_manager', 'procurement_officer'])
def mark_loan_under_review(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
        
    if loan.status != 'pending':
        return jsonify({'error': 'Loan must be in pending status'}), 400
        
    loan.status = 'under_review'
    
    db.session.commit()
    
    return jsonify(loan.to_dict())

@bp.route('/<int:id>/approve', methods=['POST'])
@role_required(['admin', 'branch_manager', 'procurement_officer'])
def approve_loan(id):
    from flask import session
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
        
    if loan.status not in ['pending', 'under_review']:
        return jsonify({'error': 'Loan is not pending or under review'}), 400
        
    loan.status = 'approved'
    loan.approval_date = datetime.utcnow()
    loan.approved_by = session.get('user_id')
    
    # Set tentative due date upon approval
    import calendar
    def add_months(sourcedate, months):
        month = sourcedate.month - 1 + months
        year = sourcedate.year + month // 12
        month = month % 12 + 1
        day = min(sourcedate.day, calendar.monthrange(year,month)[1])
        return datetime(year, month, day)
        
    loan.due_date = add_months(datetime.utcnow(), loan.loan_type.duration_months)
    
    db.session.commit()
    
    return jsonify(loan.to_dict())

@bp.route('/<int:id>/reject', methods=['POST'])
@role_required(['admin', 'branch_manager', 'procurement_officer'])
def reject_loan(id):
    from flask import session
    data = request.get_json()
    reason = data.get('reason')
    
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
        
    if loan.status not in ['pending', 'under_review']:
        return jsonify({'error': 'Loan is not in a rejectable state'}), 400
        
    # Restore stock if items exist
    for item in loan.items:
        item.product.stock_quantity += item.quantity
        
    loan.status = 'rejected'
    loan.rejected_date = datetime.utcnow()
    loan.rejected_by = session.get('user_id')
    loan.rejection_reason = reason
    
    db.session.commit()
    
    return jsonify(loan.to_dict())

@bp.route('/<int:id>/disburse', methods=['POST'])
@role_required(['admin', 'branch_manager', 'procurement_officer'])
def disburse_loan(id):
    from flask import session
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
        
    if loan.status != 'approved':
        return jsonify({'error': 'Loan must be approved before disbursement'}), 400
        
    loan.status = 'disbursed'
    loan.disbursement_date = datetime.utcnow()
    loan.disbursed_by = session.get('user_id')
    
    # Set due date (e.g., 1 month from now or based on duration)
    # For simplicity, let's say due date is application date + duration months
    # But better to use disbursement date + duration
    # This is a simplified calculation
    import calendar
    def add_months(sourcedate, months):
        month = sourcedate.month - 1 + months
        year = sourcedate.year + month // 12
        month = month % 12 + 1
        day = min(sourcedate.day, calendar.monthrange(year,month)[1])
        return datetime(year, month, day)
        
    loan.due_date = add_months(datetime.utcnow(), loan.loan_type.duration_months)
    
    db.session.commit()
    
    return jsonify(loan.to_dict())

@bp.route('/<int:id>/release', methods=['POST'])
@role_required(['admin', 'branch_manager', 'procurement_officer'])
def release_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
        
    if loan.status != 'disbursed':
        return jsonify({'error': 'Loan must be disbursed before release'}), 400
        
    loan.status = 'released'
    
    db.session.commit()
    
    return jsonify(loan.to_dict())

@bp.route('/<loan_id>/disbursement', methods=['POST'])
@login_required
def process_loan_disbursement(loan_id):
    loan = Loan.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    
    if loan.status != 'approved':
        return jsonify({'error': 'Loan must be in approved state to disburse'}), 400
    
    try:
        result = loan_service.process_loan_disbursement(loan)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>/schedule', methods=['GET'])
@login_required
def get_loan_schedule(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    
    schedule = loan_service.generate_repayment_schedule(loan)
    return jsonify(schedule)

@bp.route('/<int:member_id>/loan-limit', methods=['GET'])
@login_required
def get_member_loan_limit(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    try:
        limit = loan_service.get_member_loan_limit(member)
        return jsonify(limit)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:member_id>/recommended-product', methods=['POST'])
@login_required
def get_recommended_product(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    data = request.get_json()
    requested_amount = data.get('amount')
    
    if not requested_amount:
        return jsonify({'error': 'Amount is required'}), 400
    
    try:
        product = loan_service.match_loan_product(member, Decimal(str(requested_amount)))
        
        if not product:
            return jsonify({
                'message': 'No suitable loan product found',
                'requested_amount': requested_amount
            }), 404
        
        loan_limit = loan_service.get_member_loan_limit(member)
        
        return jsonify({
            'recommended_product': product.to_dict(),
            'loan_limit': loan_limit,
            'message': f'Product {product.name} is recommended'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:loan_id>/grace-period', methods=['GET'])
@login_required
def check_grace_period_endpoint(loan_id):
    loan = Loan.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    
    try:
        grace_info = loan_service.check_grace_period(loan)
        return jsonify(grace_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:loan_id>/repayment/auto-savings', methods=['POST'])
@login_required
def process_auto_savings_deduction(loan_id):
    loan = Loan.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    
    try:
        result = loan_service.automatic_savings_deduction(loan.member, loan)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
