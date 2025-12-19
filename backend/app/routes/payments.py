from flask import Blueprint, request, jsonify
from app.services.payment_service import payment_service
from app.services import audit_service, AuditEventType, RiskLevel

bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@bp.route('/stk-push', methods=['POST'])
def stk_push():
    data = request.get_json()
    phone_number = data.get('phoneNumber')
    amount = data.get('amount')
    account_reference = data.get('accountReference')
    transaction_desc = data.get('transactionDesc')
    
    if not all([phone_number, amount, account_reference, transaction_desc]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate payment
    if not payment_service.validate_payment(amount, phone_number, account_reference):
        return jsonify({'error': 'Invalid payment details'}), 400
        
    try:
        response = payment_service.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=account_reference,
            transaction_desc=transaction_desc
        )
        
        # Log payment initiation
        audit_service.log_event(
            event_type=AuditEventType.PAYMENT_PROCESSED,
            resource="payment",
            action="stk_push_initiated",
            details={'amount': amount, 'phone': phone_number},
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/callback', methods=['POST'])
def callback():
    data = request.get_json()
    try:
        payment_service.handle_callback(data)
        return jsonify({'result': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/register-c2b', methods=['POST'])
def register_c2b():
    data = request.get_json()
    validation_url = data.get('validationUrl')
    confirmation_url = data.get('confirmationUrl')
    
    if not all([validation_url, confirmation_url]):
        return jsonify({'error': 'Missing required URLs'}), 400
    
    try:
        response = payment_service.register_c2b_url(validation_url, confirmation_url)
        
        audit_service.log_event(
            event_type=AuditEventType.SYSTEM_CONFIG,
            resource="payment",
            action="c2b_registered",
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/transaction-status/<transaction_id>', methods=['GET'])
def transaction_status(transaction_id):
    phone_number = request.args.get('phoneNumber')
    
    if not phone_number:
        return jsonify({'error': 'Phone number is required'}), 400
    
    try:
        status = payment_service.query_transaction_status(transaction_id, phone_number)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/reconcile', methods=['POST'])
def reconcile():
    data = request.get_json()
    receipt_number = data.get('receiptNumber')
    amount = data.get('amount')
    phone_number = data.get('phoneNumber')
    
    if not all([receipt_number, amount, phone_number]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        result = payment_service.reconcile_payment(receipt_number, amount, phone_number)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/retry/<transaction_id>', methods=['POST'])
def retry_payment(transaction_id):
    try:
        result = payment_service.retry_failed_payment(transaction_id)
        
        if result['status'] == 'retrying':
            audit_service.log_event(
                event_type=AuditEventType.PAYMENT_PROCESSED,
                resource="payment",
                action="payment_retry",
                details={'transaction_id': transaction_id},
                risk_level=RiskLevel.MEDIUM
            )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/analytics', methods=['GET'])
def analytics():
    days = request.args.get('days', 30, type=int)
    
    try:
        analytics_data = payment_service.get_payment_analytics(days)
        return jsonify(analytics_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
