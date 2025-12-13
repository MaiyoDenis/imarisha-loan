from flask import Blueprint, request, jsonify
from app.models import Transaction, Member, SavingsAccount, DrawdownAccount, Loan
from app import db
import uuid
from decimal import Decimal

bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@bp.route('', methods=['GET'])
def get_transactions():
    member_id = request.args.get('memberId')
    
    query = Transaction.query
    if member_id:
        query = query.filter_by(member_id=member_id)
        
    transactions = query.order_by(Transaction.created_at.desc()).limit(100).all()
    return jsonify([t.to_dict() for t in transactions])

@bp.route('', methods=['POST'])
def create_transaction():
    data = request.get_json()
    
    member_id = data.get('memberId')
    account_type = data.get('accountType') # 'savings', 'drawdown', 'loan'
    transaction_type = data.get('transactionType') # 'deposit', 'withdrawal', 'loan_repayment'
    amount_str = data.get('amount')
    reference = data.get('reference')
    mpesa_code = data.get('mpesaCode')
    loan_id = data.get('loanId')
    
    if not all([member_id, account_type, transaction_type, amount_str]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        amount = Decimal(str(amount_str))
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
    except:
        return jsonify({'error': 'Invalid amount'}), 400
        
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
        
    account = None
    balance_before = Decimal('0.00')
    
    if account_type == 'savings':
        account = SavingsAccount.query.filter_by(member_id=member_id).first()
        if not account:
            account = SavingsAccount(member_id=member_id, account_number=f"SAV-{member.member_code}")
            db.session.add(account)
        balance_before = account.balance
    elif account_type == 'drawdown':
        account = DrawdownAccount.query.filter_by(member_id=member_id).first()
        if not account:
             account = DrawdownAccount(member_id=member_id, account_number=f"DRD-{member.member_code}")
             db.session.add(account)
        balance_before = account.balance
    elif account_type == 'loan':
        if transaction_type != 'loan_repayment':
             return jsonify({'error': 'Loan account type only valid for loan_repayment'}), 400
    else:
        return jsonify({'error': 'Invalid account type'}), 400
        
    balance_after = Decimal('0.00')
    
    if transaction_type == 'deposit':
        if account_type == 'loan':
             return jsonify({'error': 'Cannot deposit to loan account directly'}), 400
        account.balance += amount
        balance_after = account.balance
        
    elif transaction_type == 'withdrawal':
        if account_type == 'loan':
             return jsonify({'error': 'Cannot withdraw from loan account'}), 400
        if account.balance < amount:
            return jsonify({'error': 'Insufficient funds'}), 400
        account.balance -= amount
        balance_after = account.balance
        
    elif transaction_type == 'loan_repayment':
        if not loan_id:
            return jsonify({'error': 'Loan ID required for repayment'}), 400
        loan = Loan.query.get(loan_id)
        if not loan:
            return jsonify({'error': 'Loan not found'}), 404
            
        if account_type == 'savings':
             if account.balance < amount:
                 return jsonify({'error': 'Insufficient funds in savings'}), 400
             account.balance -= amount
             balance_after = account.balance
        elif account_type == 'loan':
             balance_before = loan.outstanding_balance
             # balance_after calculated after loan update
        
        loan.outstanding_balance -= amount
        if loan.outstanding_balance <= 0:
            loan.outstanding_balance = Decimal('0.00')
            loan.status = 'completed'
            
        if account_type == 'loan':
            balance_after = loan.outstanding_balance
            
    else:
        return jsonify({'error': 'Invalid transaction type'}), 400
    
    transaction = Transaction(
        transaction_id=str(uuid.uuid4()),
        member_id=member_id,
        account_type=account_type,
        transaction_type=transaction_type,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
        reference=reference,
        mpesa_code=mpesa_code,
        loan_id=loan_id
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201
