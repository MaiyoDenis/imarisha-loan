from flask import Blueprint, Response, request, jsonify
from app.services.report_service import ReportService
from datetime import datetime, timedelta
from app.utils.decorators import admin_required, staff_required
from flask_jwt_extended import jwt_required

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/portfolio/export', methods=['GET'])
@jwt_required()
@staff_required
def export_portfolio():
    try:
        from flask import session
        from app.models import User
        
        branch_id = None
        if 'user_id' in session:
            user = User.query.get(session['user_id'])
            if user and user.role.name != 'admin':
                branch_id = user.branch_id
                
        csv_content = ReportService.generate_loan_portfolio_report(branch_id=branch_id)
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=loan_portfolio.csv"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/transactions/export', methods=['GET'])
@jwt_required()
@staff_required
def export_transactions():
    try:
        from flask import session
        from app.models import User
        
        branch_id = None
        if 'user_id' in session:
            user = User.query.get(session['user_id'])
            if user and user.role.name != 'admin':
                branch_id = user.branch_id
                
        start_date_str = request.args.get('startDate')
        end_date_str = request.args.get('endDate')
        
        if start_date_str and end_date_str:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        else:
            # Default to last 30 days
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
        csv_content = ReportService.generate_transaction_report(start_date, end_date, branch_id=branch_id)
        
        filename = f"transactions_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.csv"
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/arrears/export', methods=['GET'])
@jwt_required()
@staff_required
def export_arrears():
    try:
        from flask import session
        from app.models import User
        
        branch_id = None
        if 'user_id' in session:
            user = User.query.get(session['user_id'])
            if user and user.role.name != 'admin':
                branch_id = user.branch_id
                
        csv_content = ReportService.generate_arrears_report(branch_id=branch_id)
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=arrears_report.csv"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
