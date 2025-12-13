from flask import Blueprint, request, jsonify
from app.models import Loan, LoanType, Member, LoanProduct, LoanProductItem
from app import db
from decimal import Decimal
import uuid
from datetime import datetime

bp = Blueprint('loans', __name__, url_prefix='/api/loans')

@bp.route('', methods=['GET'])
def get_loans():
    status = request.args.get('status')
    
    query = Loan.query
    if status:
        query = query.filter_by(status=status)
        
    loans = query.order_by(Loan.created_at.desc()).all()
    return jsonify([loan.to_dict() for loan in loans])

@bp.route('', methods=['POST'])
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
        
    # Calculate interest and fees
    interest_rate = loan_type.interest_rate
    duration = loan_type.duration_months
    
    # Simple interest calculation: P * R * T
    # Assuming rate is per month based on typical loan apps
    interest_amount = principle_amount * (interest_rate / 100) * duration
    
    charge_fee = principle_amount * (loan_type.charge_fee_percentage / 100)
    
    total_amount = principle_amount + interest_amount + charge_fee
    
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
        loan_item = LoanProductItem(
            loan_id=loan.id,
            product_id=item['product'].id,
            quantity=item['quantity'],
            unit_price=item['unit_price'],
            total_price=item['total_price']
        )
        db.session.add(loan_item)
        
        # Update stock? Maybe on disbursement, but let's reserve it now or just check?
        # Usually stock is deducted on disbursement. For now let's just record the item.
        
    db.session.commit()
    
    return jsonify(loan.to_dict()), 201

@bp.route('/<int:id>', methods=['GET'])
def get_loan(id):
    loan = Loan.query.get(id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    return jsonify(loan.to_dict())
