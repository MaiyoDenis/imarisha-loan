from flask import Blueprint, request, jsonify
from app.services.alternative_payment_service import airtel_service, flutterwave_service, payment_router
from app.models import User, Transaction
from app import db
import logging

bp = Blueprint('alternative_payments', __name__, url_prefix='/api/alternative-payments')

@bp.route('/providers', methods=['GET'])
def get_providers():
    """Get available payment providers for a country"""
    try:
        country = request.args.get('country', 'KE').upper()
        
        providers = payment_router.get_available_providers(country)
        
        return jsonify({
            'country': country,
            'providers': providers,
            'total': len(providers)
        })
    except Exception as e:
        logging.error(f"Error getting providers: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/airtel/initiate', methods=['POST'])
def initiate_airtel_payment():
    """Initiate Airtel Money payment"""
    try:
        data = request.get_json()
        
        phone_number = data.get('phone_number')
        amount = data.get('amount')
        reference = data.get('reference')
        
        if not all([phone_number, amount, reference]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = airtel_service.initiate_payment(
            phone_number=phone_number,
            amount=float(amount),
            reference=reference,
            merchant_id=data.get('merchant_id')
        )
        
        if result.get('success'):
            transaction = Transaction(
                member_id=data.get('member_id'),
                amount=float(amount),
                transaction_type='payment',
                status='pending',
                payment_method='airtel_money',
                reference=reference,
                external_reference=result.get('transaction_id'),
                metadata={
                    'provider': 'airtel_money',
                    'phone_number': phone_number
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'transaction_id': result.get('transaction_id'),
                'reference': reference,
                'provider': 'airtel_money',
                'message': 'Payment initiated successfully'
            }), 201
        else:
            return jsonify({'error': result.get('error')}), 400
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error initiating Airtel payment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/airtel/status/<transaction_id>', methods=['GET'])
def check_airtel_status(transaction_id):
    """Check Airtel Money transaction status"""
    try:
        result = airtel_service.check_transaction_status(transaction_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error checking Airtel status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/flutterwave/initiate', methods=['POST'])
def initiate_flutterwave_payment():
    """Initiate Flutterwave payment"""
    try:
        data = request.get_json()
        
        phone_number = data.get('phone_number')
        amount = data.get('amount')
        reference = data.get('reference')
        email = data.get('email')
        
        if not all([phone_number, amount, reference]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = flutterwave_service.initiate_payment(
            phone_number=phone_number,
            amount=float(amount),
            reference=reference,
            email=email
        )
        
        if result.get('success'):
            transaction = Transaction(
                member_id=data.get('member_id'),
                amount=float(amount),
                transaction_type='payment',
                status='pending',
                payment_method='flutterwave',
                reference=reference,
                external_reference=result.get('transaction_id'),
                metadata={
                    'provider': 'flutterwave',
                    'phone_number': phone_number,
                    'payment_link': result.get('payment_link')
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'transaction_id': result.get('transaction_id'),
                'reference': reference,
                'provider': 'flutterwave',
                'payment_link': result.get('payment_link'),
                'message': 'Payment initiated successfully'
            }), 201
        else:
            return jsonify({'error': result.get('error')}), 400
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error initiating Flutterwave payment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/flutterwave/verify/<transaction_id>', methods=['GET'])
def verify_flutterwave_payment(transaction_id):
    """Verify Flutterwave transaction"""
    try:
        result = flutterwave_service.verify_payment(transaction_id)
        
        if 'error' in result:
            return jsonify(result), 400
        
        # Update transaction in database
        transaction = Transaction.query.filter_by(
            external_reference=transaction_id
        ).first()
        
        if transaction:
            transaction.status = 'completed' if result.get('status') == 'successful' else 'failed'
            db.session.commit()
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error verifying Flutterwave payment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/generic/initiate', methods=['POST'])
def initiate_generic_payment():
    """Initiate payment with any provider (routing)"""
    try:
        data = request.get_json()
        
        provider = data.get('provider', 'mpesa').lower()
        phone_number = data.get('phone_number')
        amount = data.get('amount')
        reference = data.get('reference')
        
        if not all([provider, phone_number, amount, reference]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        result = payment_router.initiate_payment(
            provider=provider,
            phone_number=phone_number,
            amount=float(amount),
            reference=reference,
            **data.get('extra', {})
        )
        
        if 'error' in result:
            return jsonify({'error': result.get('error')}), 400
        
        transaction = Transaction(
            member_id=data.get('member_id'),
            amount=float(amount),
            transaction_type='payment',
            status='pending',
            payment_method=provider,
            reference=reference,
            external_reference=result.get('transaction_id'),
            metadata={
                'provider': provider,
                'phone_number': phone_number
            }
        )
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'transaction_id': result.get('transaction_id'),
            'reference': reference,
            'provider': provider,
            'message': 'Payment initiated successfully'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error initiating generic payment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/transaction/<reference>', methods=['GET'])
def get_transaction_status(reference):
    """Get transaction status by reference"""
    try:
        transaction = Transaction.query.filter_by(reference=reference).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        return jsonify({
            'reference': reference,
            'transaction_id': transaction.id,
            'amount': float(transaction.amount),
            'status': transaction.status,
            'provider': transaction.payment_method,
            'created_at': transaction.created_at.isoformat() if transaction.created_at else None,
            'updated_at': transaction.updated_at.isoformat() if transaction.updated_at else None
        })
    except Exception as e:
        logging.error(f"Error getting transaction status: {str(e)}")
        return jsonify({'error': str(e)}), 500
