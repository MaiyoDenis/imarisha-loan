from flask import Blueprint, request, jsonify
from app.models import Transaction, Member, SavingsAccount, DrawdownAccount, Loan
from app import db
from app.services.loan_service import loan_service
import uuid
from decimal import Decimal

bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@bp.route('', methods=['GET'])
def get_transactions():
    member_id = request.args.get('memberId')
    account_type = request.args.get('accountType')
    status = request.args.get('status')
    
    from flask import session
    from app.models import User
    
    query = Transaction.query
    
    if member_id:
        query = query.filter_by(member_id=member_id)
        
    if account_type:
        query = query.filter_by(account_type=account_type)

    if status:
        query = query.filter_by(status=status)
        
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user and user.role.name != 'admin' and user.branch_id:
            query = query.join(Member).filter(Member.branch_id == user.branch_id)
        
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
    
    if transaction_type == 'deposit' and not mpesa_code:
        return jsonify({'error': 'M-Pesa code is required for deposits'}), 400
        
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
        balance_after = account.balance + amount
        
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
            
    elif transaction_type == 'transfer':
        to_account_type = data.get('toAccountType')
        if not to_account_type:
             return jsonify({'error': 'Destination account type required'}), 400
             
        if account_type == to_account_type:
             return jsonify({'error': 'Source and destination accounts must be different'}), 400
             
        # Get dest account
        dest_account = None
        if to_account_type == 'savings':
            dest_account = SavingsAccount.query.filter_by(member_id=member_id).first()
            if not dest_account:
                dest_account = SavingsAccount(member_id=member_id, account_number=f"SAV-{member.member_code}")
                db.session.add(dest_account)
        elif to_account_type == 'drawdown':
            dest_account = DrawdownAccount.query.filter_by(member_id=member_id).first()
            if not dest_account:
                dest_account = DrawdownAccount(member_id=member_id, account_number=f"DRD-{member.member_code}")
                db.session.add(dest_account)
        else:
             return jsonify({'error': 'Invalid destination account type'}), 400
             
        if account.balance < amount:
             return jsonify({'error': 'Insufficient funds'}), 400
             
        account.balance -= amount
        dest_account.balance += amount
        
        balance_after = account.balance
            
    else:
        return jsonify({'error': 'Invalid transaction type'}), 400
    
    transaction_status = 'pending' if transaction_type in ['deposit', 'withdrawal'] else 'confirmed'
    
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
        loan_id=loan_id,
        status=transaction_status
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201

@bp.route('/<int:transaction_id>/approve', methods=['POST'])
def approve_transaction(transaction_id):
    from flask import session
    from app.models import User
    from datetime import datetime
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    if transaction.transaction_type not in ['deposit', 'withdrawal']:
        return jsonify({'error': 'Only deposit and withdrawal transactions can be approved'}), 400
    
    if transaction.status != 'pending':
        return jsonify({'error': f'Transaction is already {transaction.status}'}), 400
    
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 401
    
    if user.role.name not in ['procurement_officer', 'branch_manager', 'admin']:
        return jsonify({'error': 'Only procurement officers can approve transactions'}), 403
    
    account = None
    if transaction.account_type == 'savings':
        account = SavingsAccount.query.filter_by(member_id=transaction.member_id).first()
    elif transaction.account_type == 'drawdown':
        account = DrawdownAccount.query.filter_by(member_id=transaction.member_id).first()
    
    if not account:
        return jsonify({'error': f'{transaction.account_type} account not found'}), 404
    
    # If deposit, add funds. If withdrawal, funds already deducted in create_transaction, so just confirm.
    if transaction.transaction_type == 'deposit':
        account.balance += transaction.amount
        
        # Check if member needs activation and registration fee deduction
        member = Member.query.get(transaction.member_id)
        if member and not member.registration_fee_paid:
            if member.drawdown_account:
                # If drawdown balance is now >= 0, it means fee is paid
                if member.drawdown_account.balance >= 0:
                    member.registration_fee_paid = True
                    
                    # If this was a savings deposit, we should record the fee clearance in drawdown
                    if transaction.account_type == 'savings':
                        fee_txn_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-FEE-{uuid.uuid4().hex[:4].upper()}"
                        fee_txn = Transaction(
                            transaction_id=fee_txn_id,
                            member_id=member.id,
                            account_type='drawdown',
                            transaction_type='registration_fee',
                            amount=member.registration_fee,
                            balance_before=member.drawdown_account.balance - member.registration_fee,
                            balance_after=member.drawdown_account.balance,
                            reference=f'Registration fee cleared by deposit {transaction.transaction_id}',
                            processed_by=user_id,
                            status='confirmed',
                            confirmed_by=user_id,
                            confirmed_at=datetime.utcnow()
                        )
                        db.session.add(fee_txn)
                
                # Activate member if they were inactive (approved) and fee is now paid
                if member.status == 'inactive' and member.registration_fee_paid:
                    member.status = 'active'
        
        # Auto-repay loans if deposited to drawdown
        if transaction.account_type == 'drawdown':
            db.session.flush() # Ensure balance is updated
            loan_service.auto_repay_from_drawdown(transaction.member_id)
    
    transaction.status = 'confirmed'
    transaction.confirmed_by = user_id
    transaction.confirmed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction approved successfully',
        'transaction': transaction.to_dict()
    }), 200

@bp.route('/<int:transaction_id>/reject', methods=['POST'])
def reject_transaction(transaction_id):
    from flask import session
    from app.models import User
    from datetime import datetime
    
    data = request.get_json() or {}
    reason = data.get('reason', 'No reason provided')
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    if transaction.transaction_type not in ['deposit', 'withdrawal']:
        return jsonify({'error': 'Only deposit and withdrawal transactions can be rejected'}), 400
    
    if transaction.status != 'pending':
        return jsonify({'error': f'Transaction is already {transaction.status}'}), 400
    
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 401
    
    if user.role.name not in ['procurement_officer', 'branch_manager', 'admin']:
        return jsonify({'error': 'Only procurement officers can reject transactions'}), 403
    
    # Handle Refund for withdrawal
    if transaction.transaction_type == 'withdrawal':
        account = None
        if transaction.account_type == 'savings':
            account = SavingsAccount.query.filter_by(member_id=transaction.member_id).first()
        elif transaction.account_type == 'drawdown':
            account = DrawdownAccount.query.filter_by(member_id=transaction.member_id).first()
            
        if account:
            account.balance += transaction.amount
    
    transaction.status = 'failed'
    transaction.confirmed_by = user_id
    transaction.confirmed_at = datetime.utcnow()
    transaction.reference = f"{transaction.reference or ''} [REJECTED: {reason}]".strip()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Transaction rejected successfully',
        'transaction': transaction.to_dict()
    }), 200

@bp.route('/stk-push', methods=['POST'])
def initiate_stk_push():
    data = request.get_json()
    
    member_id = data.get('memberId')
    amount_str = data.get('amount')
    account_type = data.get('accountType', 'savings')
    
    if not all([member_id, amount_str]):
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
    
    from app.models import User
    user = member.user
    if not user or not user.phone:
        return jsonify({'error': 'Member phone number not found'}), 400
    
    phone = user.phone.replace('+', '').replace(' ', '')
    if not phone.startswith('254'):
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        else:
            phone = '254' + phone
    
    try:
        import os
        import requests
        from datetime import datetime
        
        mpesa_url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        
        business_short_code = os.getenv('MPESA_SHORTCODE', '174379')
        passkey = os.getenv('MPESA_PASSKEY', 'bfb279f9ba9b9d1380007480acacu1405068114f2fcb987000f202d898cd2c49')
        callback_url = os.getenv('MPESA_CALLBACK_URL', 'https://imarisha-loans.onrender.com/api/mpesa-callback')
        
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        from hashlib import sha256
        import base64
        password = base64.b64encode(f"{business_short_code}{passkey}{timestamp}".encode()).decode()
        
        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": business_short_code,
            "PhoneNumber": phone,
            "CallBackURL": callback_url,
            "AccountReference": f"MEM-{member.member_code}",
            "TransactionDesc": f"Deposit to {account_type} account"
        }
        
        response = requests.post(mpesa_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('ResponseCode') == '0':
                return jsonify({
                    'message': 'STK push initiated successfully',
                    'requestId': result.get('CheckoutRequestID'),
                    'phone': phone,
                    'amount': str(amount)
                }), 200
            else:
                return jsonify({
                    'error': result.get('ResponseDescription', 'Failed to initiate STK push')
                }), 400
        else:
            return jsonify({
                'error': 'Failed to connect to M-Pesa API'
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': f'STK push failed: {str(e)}'
        }), 500
