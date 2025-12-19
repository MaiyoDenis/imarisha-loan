from flask import Blueprint, request, jsonify
from app.services.risk_service import risk_service
from app.models import Member
from app import db

bp = Blueprint('risk', __name__, url_prefix='/api/risk')

@bp.route('/score/<int:member_id>', methods=['GET'])
def get_risk_score(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    try:
        score_data = risk_service.calculate_risk_score(member_id)
        
        return jsonify({
            'member_id': member_id,
            'score': score_data['score'],
            'category': score_data['category'],
            'factors': score_data['factors'],
            'timestamp': db.func.now()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/fraud-check/<int:member_id>', methods=['GET'])
def check_fraud(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    try:
        fraud_data = risk_service.detect_fraud(member_id)
        
        return jsonify({
            'member_id': member_id,
            'fraud_detection': fraud_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/default-probability/<int:member_id>', methods=['GET'])
def get_default_probability(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    loan_id = request.args.get('loanId', type=int)
    
    try:
        probability_data = risk_service.predict_default_probability(member_id, loan_id)
        
        return jsonify(probability_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/early-warnings/<int:member_id>', methods=['GET'])
def get_early_warnings(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    try:
        warnings_data = risk_service.check_early_warnings(member_id)
        
        return jsonify({
            'member_id': member_id,
            'warnings': warnings_data['warnings'],
            'recommended_actions': warnings_data['recommended_actions'],
            'has_warnings': len(warnings_data['warnings']) > 0
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/interest-rate/<int:member_id>', methods=['GET'])
def get_interest_rate_recommendation(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    base_rate = request.args.get('baseRate', 15.0, type=float)
    
    try:
        risk_score = member.risk_score or 0
        recommended_rate = risk_service.get_interest_rate_recommendation(risk_score, base_rate)
        
        return jsonify({
            'member_id': member_id,
            'risk_score': risk_score,
            'base_rate': base_rate,
            'recommended_rate': recommended_rate,
            'rate_adjustment': recommended_rate - base_rate
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/comprehensive/<int:member_id>', methods=['GET'])
def get_comprehensive_risk_report(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    
    try:
        # Gather all risk information
        risk_score_data = risk_service.calculate_risk_score(member_id)
        fraud_data = risk_service.detect_fraud(member_id)
        default_probability_data = risk_service.predict_default_probability(member_id)
        warnings_data = risk_service.check_early_warnings(member_id)
        
        base_rate = 15.0
        recommended_rate = risk_service.get_interest_rate_recommendation(
            risk_score_data['score'],
            base_rate
        )
        
        return jsonify({
            'member_id': member_id,
            'risk_assessment': {
                'score': risk_score_data['score'],
                'category': risk_score_data['category'],
                'factors': risk_score_data['factors']
            },
            'fraud_check': fraud_data,
            'default_probability': default_probability_data,
            'early_warnings': {
                'warnings': warnings_data['warnings'],
                'recommended_actions': warnings_data['recommended_actions']
            },
            'interest_rate': {
                'recommended_rate': recommended_rate,
                'rate_adjustment': recommended_rate - base_rate
            },
            'timestamp': db.func.now()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
