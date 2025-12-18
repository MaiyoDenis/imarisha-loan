from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.services import AIAnalyticsService
from app.services.audit_service import audit_service, AuditEventType, RiskLevel
import logging

logger = logging.getLogger(__name__)
ai_analytics_bp = Blueprint('ai_analytics', __name__, url_prefix='/api/ai-analytics')


@ai_analytics_bp.route('/arrears-forecast', methods=['GET'])
@jwt_required()
def forecast_arrears():
    """
    Forecast arrears rate using Prophet time series model.
    Query params: months_ahead (default: 12), branch_id (optional)
    """
    try:
        user_id = get_jwt_identity()
        months_ahead = request.args.get('months_ahead', 12, type=int)
        branch_id = request.args.get('branch_id', type=int)
        
        result = AIAnalyticsService.forecast_arrears_rate(
            months_ahead=months_ahead,
            branch_id=branch_id
        )
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='arrears_forecast',
            details={'months_ahead': months_ahead, 'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Arrears forecast error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/member-behavior', methods=['GET'])
@jwt_required()
def analyze_member_behavior():
    """
    Analyze member behavior and segment them using clustering.
    Query params: branch_id (optional)
    """
    try:
        user_id = get_jwt_identity()
        branch_id = request.args.get('branch_id', type=int)
        
        result = AIAnalyticsService.analyze_member_behavior(branch_id=branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='member_behavior',
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Member behavior analysis error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/clv-prediction/<int:member_id>', methods=['GET'])
@jwt_required()
def predict_clv(member_id):
    """
    Predict Customer Lifetime Value (CLV) for a specific member.
    """
    try:
        user_id = get_jwt_identity()
        
        result = AIAnalyticsService.predict_customer_lifetime_value(member_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='clv_prediction',
            details={'member_id': member_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"CLV prediction error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/seasonal-demand', methods=['GET'])
@jwt_required()
def forecast_seasonal_demand():
    """
    Forecast seasonal demand patterns for products.
    Query params: product_id (optional), months_ahead (default: 12), branch_id (optional)
    """
    try:
        user_id = get_jwt_identity()
        product_id = request.args.get('product_id', type=int)
        months_ahead = request.args.get('months_ahead', 12, type=int)
        branch_id = request.args.get('branch_id', type=int)
        
        result = AIAnalyticsService.forecast_seasonal_demand(
            product_id=product_id,
            months_ahead=months_ahead,
            branch_id=branch_id
        )
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='seasonal_demand',
            details={'product_id': product_id, 'months_ahead': months_ahead, 'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Seasonal demand forecast error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/lifecycle-stage/<int:member_id>', methods=['GET'])
@jwt_required()
def get_lifecycle_stage(member_id):
    """
    Get member lifecycle stage (onboarding, active, mature, vip, at_risk, inactive).
    """
    try:
        user_id = get_jwt_identity()
        
        result = AIAnalyticsService.get_member_lifecycle_stage(member_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='lifecycle_stage',
            details={'member_id': member_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Lifecycle stage error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/at-risk-members', methods=['GET'])
@jwt_required()
def identify_at_risk_members():
    """
    Identify members at risk of defaulting.
    Query params: branch_id (optional), threshold (default: 0.6)
    """
    try:
        user_id = get_jwt_identity()
        branch_id = request.args.get('branch_id', type=int)
        threshold = request.args.get('threshold', 0.6, type=float)
        
        result = AIAnalyticsService.identify_at_risk_members(
            branch_id=branch_id,
            threshold=threshold
        )
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='at_risk_members',
            details={'threshold': threshold, 'branch_id': branch_id},
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"At-risk members identification error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/cohort-analysis', methods=['GET'])
@jwt_required()
def get_cohort_analysis():
    """
    Get cohort analysis for member retention and activity patterns.
    Query params: branch_id (optional)
    """
    try:
        user_id = get_jwt_identity()
        branch_id = request.args.get('branch_id', type=int)
        
        result = AIAnalyticsService.get_cohort_analysis(branch_id=branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='cohort_analysis',
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Cohort analysis error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@ai_analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_ai_summary():
    """
    Get comprehensive AI analytics summary combining multiple insights.
    """
    try:
        user_id = get_jwt_identity()
        branch_id = request.args.get('branch_id', type=int)
        
        arrears_forecast = AIAnalyticsService.forecast_arrears_rate(branch_id=branch_id)
        behavior_analysis = AIAnalyticsService.analyze_member_behavior(branch_id=branch_id)
        at_risk = AIAnalyticsService.identify_at_risk_members(branch_id=branch_id)
        cohorts = AIAnalyticsService.get_cohort_analysis(branch_id=branch_id)
        
        result = {
            'status': 'success',
            'arrears_forecast': arrears_forecast,
            'member_behavior': behavior_analysis,
            'at_risk_members': at_risk,
            'cohort_analysis': cohorts,
            'generated_at': datetime.utcnow().isoformat()
        }
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            resource='ai_analytics',
            action='summary',
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"AI summary error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
