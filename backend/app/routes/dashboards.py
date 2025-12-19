from flask import Blueprint, jsonify, request
from app.services.dashboard_service import dashboard_service
from app.services import audit_service, AuditEventType, RiskLevel

bp = Blueprint('dashboards', __name__, url_prefix='/api/dashboards')

@bp.route('/executive', methods=['GET'])
def get_executive_dashboard():
    branch_id = request.args.get('branch_id', type=int)
    
    try:
        dashboard_data = dashboard_service.get_executive_dashboard(branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            resource="dashboard",
            action="view_executive",
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/operations', methods=['GET'])
def get_operations_dashboard():
    branch_id = request.args.get('branch_id', type=int)
    
    try:
        dashboard_data = dashboard_service.get_operations_dashboard(branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            resource="dashboard",
            action="view_operations",
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/risk', methods=['GET'])
def get_risk_dashboard():
    branch_id = request.args.get('branch_id', type=int)
    
    try:
        dashboard_data = dashboard_service.get_risk_dashboard(branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            resource="dashboard",
            action="view_risk",
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/member-analytics', methods=['GET'])
def get_member_analytics_dashboard():
    branch_id = request.args.get('branch_id', type=int)
    
    try:
        dashboard_data = dashboard_service.get_member_analytics_dashboard(branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            resource="dashboard",
            action="view_member_analytics",
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/forecast', methods=['GET'])
def get_forecast_dashboard():
    branch_id = request.args.get('branch_id', type=int)
    
    try:
        dashboard_data = dashboard_service.get_forecast_dashboard(branch_id)
        
        audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            resource="dashboard",
            action="view_forecast",
            details={'branch_id': branch_id},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/summary', methods=['GET'])
def get_dashboard_summary():
    """Quick summary of all dashboards"""
    branch_id = request.args.get('branch_id', type=int)
    
    try:
        summary = {
            'executive': dashboard_service.get_executive_dashboard(branch_id),
            'operations': dashboard_service.get_operations_dashboard(branch_id),
            'risk': dashboard_service.get_risk_dashboard(branch_id),
            'member_analytics': dashboard_service.get_member_analytics_dashboard(branch_id),
            'forecast': dashboard_service.get_forecast_dashboard(branch_id)
        }
        
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/kpi/<string:kpi_name>', methods=['GET'])
def get_kpi(kpi_name):
    """Get specific KPI data"""
    branch_id = request.args.get('branch_id', type=int)
    period = request.args.get('period', 'current')  # current, mtd, ytd, custom
    
    try:
        # Map KPI names to service methods
        kpi_methods = {
            'portfolio_health': dashboard_service._get_portfolio_health,
            'revenue': dashboard_service._get_revenue_metrics,
            'growth': dashboard_service._get_growth_metrics,
            'risk': dashboard_service._get_risk_metrics,
            'operations': dashboard_service._get_operational_metrics,
            'member_queue': dashboard_service._get_member_queue,
            'payment_status': dashboard_service._get_payment_status,
            'risk_distribution': dashboard_service._get_risk_distribution,
            'retention': dashboard_service._get_retention_trends
        }
        
        if kpi_name not in kpi_methods:
            return jsonify({'error': 'Unknown KPI'}), 404
        
        kpi_data = kpi_methods[kpi_name](branch_id)
        
        return jsonify({
            'kpi': kpi_name,
            'period': period,
            'data': kpi_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/trends/<string:metric>', methods=['GET'])
def get_metric_trends(metric):
    """Get trend data for a specific metric"""
    branch_id = request.args.get('branch_id', type=int)
    days = request.args.get('days', 30, type=int)
    
    try:
        # Placeholder for trend calculation
        # In production, would retrieve from time-series data
        
        trend_data = {
            'metric': metric,
            'period_days': days,
            'timestamps': [],
            'values': [],
            'trend': 'stable'
        }
        
        return jsonify(trend_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/refresh', methods=['POST'])
def refresh_dashboard_cache():
    """Manually refresh dashboard cache"""
    branch_id = request.args.get('branch_id', type=int)
    dashboard_type = request.get_json().get('dashboard_type', 'all')
    
    try:
        if dashboard_service.redis_client:
            if dashboard_type == 'all':
                dashboard_service.redis_client.delete(f"exec_dashboard:{branch_id or 'all'}")
                dashboard_service.redis_client.delete(f"ops_dashboard:{branch_id or 'all'}")
                dashboard_service.redis_client.delete(f"risk_dashboard:{branch_id or 'all'}")
                dashboard_service.redis_client.delete(f"member_dashboard:{branch_id or 'all'}")
                dashboard_service.redis_client.delete(f"forecast_dashboard:{branch_id or 'all'}")
            else:
                dashboard_service.redis_client.delete(f"{dashboard_type}_dashboard:{branch_id or 'all'}")
        
        return jsonify({
            'success': True,
            'message': 'Dashboard cache refreshed',
            'dashboard_type': dashboard_type
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
