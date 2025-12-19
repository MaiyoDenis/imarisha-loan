"""
Compliance Routes - KYC, AML, GDPR
"""
from flask import Blueprint, request, jsonify
from app.services import kyc_service, aml_service, gdpr_service
from app.models import User
import logging

bp = Blueprint('compliance', __name__, url_prefix='/api/compliance')

@bp.route('/kyc/verify', methods=['POST'])
def verify_kyc():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        id_number = data.get('id_number')
        id_type = data.get('id_type', 'national_id')
        
        if not all([user_id, id_number]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        kyc_service.init_app(current_app)
        result = kyc_service.verify_identity(user_id, id_number, id_type)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"KYC verification error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/aml/monitor', methods=['POST'])
def monitor_aml():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        transaction = {
            'id': data.get('transaction_id'),
            'amount': data.get('amount'),
            'type': data.get('type')
        }
        
        if not all([user_id, transaction.get('id'), transaction.get('amount')]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        aml_service.init_app(current_app)
        result = aml_service.monitor_transaction(user_id, transaction)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"AML monitoring error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/gdpr/export', methods=['POST'])
def request_export():
    try:
        user_id = request.get_json().get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400
        
        gdpr_service.init_app(current_app)
        result = gdpr_service.request_data_export(user_id)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"GDPR export error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/gdpr/deletion', methods=['POST'])
def request_deletion():
    try:
        user_id = request.get_json().get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400
        
        gdpr_service.init_app(current_app)
        result = gdpr_service.request_data_deletion(user_id)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"GDPR deletion error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/gdpr/consent/<int:user_id>', methods=['GET'])
def get_consent(user_id):
    try:
        gdpr_service.init_app(current_app)
        result = gdpr_service.get_consent_status(user_id)
        return jsonify(result)
    except Exception as e:
        logging.error(f"Consent retrieval error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/gdpr/consent/<int:user_id>', methods=['PUT'])
def update_consent(user_id):
    try:
        prefs = request.get_json()
        
        gdpr_service.init_app(current_app)
        result = gdpr_service.update_consent(user_id, prefs)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Consent update error: {str(e)}")
        return jsonify({'error': str(e)}), 500
