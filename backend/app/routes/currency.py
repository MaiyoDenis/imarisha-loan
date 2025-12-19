from flask import Blueprint, request, jsonify
from app.services.currency_service import currency_service
from app.models import User
import logging

bp = Blueprint('currency', __name__, url_prefix='/api/currency')

@bp.route('/currencies', methods=['GET'])
def get_currencies():
    """Get list of supported currencies"""
    try:
        currencies = currency_service.get_supported_currencies()
        return jsonify({
            'currencies': currencies,
            'total': len(currencies)
        })
    except Exception as e:
        logging.error(f"Error getting currencies: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/currency/<currency_code>', methods=['GET'])
def get_currency(currency_code):
    """Get specific currency information"""
    try:
        currency = currency_service.get_currency_info(currency_code.upper())
        
        if not currency:
            return jsonify({'error': 'Currency not found'}), 404
        
        return jsonify(currency)
    except Exception as e:
        logging.error(f"Error getting currency: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/rate', methods=['GET'])
def get_exchange_rate():
    """Get exchange rate between two currencies"""
    try:
        from_currency = request.args.get('from', 'KES').upper()
        to_currency = request.args.get('to', 'USD').upper()
        
        rate = currency_service.get_exchange_rate(from_currency, to_currency)
        
        return jsonify({
            'from': from_currency,
            'to': to_currency,
            'rate': rate
        })
    except Exception as e:
        logging.error(f"Error getting exchange rate: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/convert', methods=['POST'])
def convert_currency():
    """Convert amount from one currency to another"""
    try:
        data = request.get_json()
        
        amount = data.get('amount')
        from_currency = data.get('from_currency', 'KES').upper()
        to_currency = data.get('to_currency', 'USD').upper()
        
        if not amount:
            return jsonify({'error': 'Amount is required'}), 400
        
        result = currency_service.convert(float(amount), from_currency, to_currency)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error converting currency: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/convert-to-base', methods=['POST'])
def convert_to_base():
    """Convert amount to base currency (KES)"""
    try:
        data = request.get_json()
        
        amount = data.get('amount')
        from_currency = data.get('currency', 'USD').upper()
        
        if not amount:
            return jsonify({'error': 'Amount is required'}), 400
        
        result = currency_service.convert_to_base(float(amount), from_currency)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error converting to base currency: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/convert-from-base', methods=['POST'])
def convert_from_base():
    """Convert amount from base currency (KES) to another"""
    try:
        data = request.get_json()
        
        amount = data.get('amount')
        to_currency = data.get('currency', 'USD').upper()
        
        if not amount:
            return jsonify({'error': 'Amount is required'}), 400
        
        result = currency_service.convert_from_base(float(amount), to_currency)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error converting from base currency: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/format', methods=['POST'])
def format_amount():
    """Format amount in currency-specific format"""
    try:
        data = request.get_json()
        
        amount = data.get('amount')
        currency = data.get('currency', 'KES').upper()
        
        if not amount:
            return jsonify({'error': 'Amount is required'}), 400
        
        formatted = currency_service.format_amount(float(amount), currency)
        
        return jsonify({
            'original_amount': amount,
            'currency': currency,
            'formatted': formatted
        })
    except Exception as e:
        logging.error(f"Error formatting amount: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/update-rates', methods=['POST'])
def update_rates():
    """Manually update exchange rates (Admin only)"""
    try:
        success = currency_service.update_exchange_rates()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Exchange rates updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to update exchange rates'
            }), 500
    except Exception as e:
        logging.error(f"Error updating rates: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/multicurrency-account', methods=['POST'])
def create_multicurrency_account():
    """Create multicurrency account for logged-in user"""
    try:
        from flask import g
        user_id = g.user.id if hasattr(g, 'user') else request.get_json().get('user_id')
        
        data = request.get_json() or {}
        primary_currency = data.get('primary_currency', 'KES').upper()
        secondary_currencies = data.get('secondary_currencies', ['USD', 'EUR'])
        
        result = currency_service.create_multicurrency_account(
            user_id,
            primary_currency,
            secondary_currencies
        )
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 201
    except Exception as e:
        logging.error(f"Error creating multicurrency account: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/multicurrency-balance/<int:user_id>', methods=['GET'])
def get_multicurrency_balance(user_id):
    """Get user multicurrency balances"""
    try:
        result = currency_service.get_multicurrency_balance(user_id)
        
        if 'error' in result:
            return jsonify(result), 404
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error getting multicurrency balance: {str(e)}")
        return jsonify({'error': str(e)}), 500
