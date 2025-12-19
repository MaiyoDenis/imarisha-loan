from flask import Blueprint, request, jsonify, send_file, session
from app.utils.decorators import login_required
from app import db
from app.services.reporting_service import ReportingService
from app.services.audit_service import audit_service, AuditEventType, RiskLevel
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
reporting_bp = Blueprint('reporting', __name__, url_prefix='/api/reports')


@reporting_bp.route('/templates', methods=['GET'])
@login_required
def get_report_templates():
    """Get all available report templates"""
    try:
        user_id = session.get('user_id')
        
        result = ReportingService.get_available_templates()
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.READ,
            entity_type='report',
            entity_id=None,
            description='Retrieved available report templates',
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Get templates error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/generate/compliance', methods=['GET'])
@login_required
def generate_compliance_report():
    """Generate compliance report"""
    try:
        user_id = session.get('user_id')
        branch_id = request.args.get('branch_id', type=int)
        
        report_data = ReportingService.generate_compliance_report(branch_id=branch_id)
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.CREATE,
            entity_type='report',
            entity_id=None,
            description='Generated compliance report',
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(report_data), 200
    except Exception as e:
        logger.error(f"Compliance report error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/generate/operations', methods=['GET'])
@login_required
def generate_operations_report():
    """Generate operations report"""
    try:
        user_id = session.get('user_id')
        branch_id = request.args.get('branch_id', type=int)
        days_back = request.args.get('days_back', 1, type=int)
        
        report_data = ReportingService.generate_operations_report(days_back=days_back, branch_id=branch_id)
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.CREATE,
            entity_type='report',
            entity_id=None,
            description=f'Generated operations report for {days_back} day(s)',
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(report_data), 200
    except Exception as e:
        logger.error(f"Operations report error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/generate/financial', methods=['GET'])
@login_required
def generate_financial_report():
    """Generate financial report"""
    try:
        user_id = session.get('user_id')
        branch_id = request.args.get('branch_id', type=int)
        month = request.args.get('month', type=int)
        
        report_data = ReportingService.generate_financial_report(month=month, branch_id=branch_id)
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.CREATE,
            entity_type='report',
            entity_id=None,
            description='Generated financial report',
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(report_data), 200
    except Exception as e:
        logger.error(f"Financial report error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/generate/members', methods=['GET'])
@login_required
def generate_member_report():
    """Generate member analytics report"""
    try:
        user_id = session.get('user_id')
        branch_id = request.args.get('branch_id', type=int)
        
        report_data = ReportingService.generate_member_report(branch_id=branch_id)
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.CREATE,
            entity_type='report',
            entity_id=None,
            description='Generated member report',
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(report_data), 200
    except Exception as e:
        logger.error(f"Member report error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/generate/risk', methods=['GET'])
@login_required
def generate_risk_report():
    """Generate risk management report"""
    try:
        user_id = session.get('user_id')
        branch_id = request.args.get('branch_id', type=int)
        
        report_data = ReportingService.generate_risk_report(branch_id=branch_id)
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.CREATE,
            entity_type='report',
            entity_id=None,
            description='Generated risk report',
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify(report_data), 200
    except Exception as e:
        logger.error(f"Risk report error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/export/<report_type>/pdf', methods=['POST'])
@login_required
def export_report_pdf(report_type):
    """Export report to PDF"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        report_data = data.get('report_data', {})
        
        result = ReportingService.export_to_pdf(report_data)
        
        if result['status'] == 'success':
            audit_service.log_event(
                user_id=user_id,
                event_type=AuditEventType.EXPORT,
                entity_type='report',
                entity_id=None,
                description=f'Exported {report_type} report to PDF',
                risk_level=RiskLevel.LOW
            )
            
            return send_file(
                result['buffer'],
                mimetype='application/pdf',
                as_attachment=True,
                download_name=result['filename']
            )
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"PDF export error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/export/<report_type>/excel', methods=['POST'])
@login_required
def export_report_excel(report_type):
    """Export report to Excel"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        report_data = data.get('report_data', {})
        
        result = ReportingService.export_to_excel(report_data)
        
        if result['status'] == 'success':
            audit_service.log_event(
                user_id=user_id,
                event_type=AuditEventType.EXPORT,
                entity_type='report',
                entity_id=None,
                description=f'Exported {report_type} report to Excel',
                risk_level=RiskLevel.LOW
            )
            
            return send_file(
                result['buffer'],
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=result['filename']
            )
        else:
            return jsonify(result), 400
    except Exception as e:
        logger.error(f"Excel export error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@reporting_bp.route('/email-report', methods=['POST'])
@login_required
def email_report():
    """Send report via email"""
    try:
        user_id = session.get('user_id')
        data = request.get_json()
        
        recipients = data.get('recipients', [])
        subject = data.get('subject', 'Report Generated')
        report_data = data.get('report_data', {})
        
        result = ReportingService.send_report_email(
            recipients=recipients,
            subject=subject,
            report_data=report_data
        )
        
        audit_service.log_event(
            user_id=user_id,
            event_type=AuditEventType.SHARE,
            entity_type='report',
            entity_id=None,
            description=f'Emailed report to {len(recipients)} recipient(s)',
            risk_level=RiskLevel.LOW
        )
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Email report error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
