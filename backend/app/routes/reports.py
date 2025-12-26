from flask import Blueprint, Response, request, jsonify
from app.services.report_service import ReportService
from datetime import datetime, timedelta
from app.utils.decorators import admin_required, staff_required
from flask_jwt_extended import jwt_required
import pandas as pd
from io import StringIO

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@bp.route('/portfolio/export', methods=['GET'])
@jwt_required(optional=True)
def export_portfolio():
    try:
        from flask import session
        from app.models import User
        
        branch_id = None
        
        user_id = request.args.get('user_id')
        if not user_id and 'user_id' in session:
            user_id = session['user_id']
        
        if user_id:
            user = User.query.get(user_id)
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
@jwt_required(optional=True)
def export_transactions():
    try:
        from flask import session
        from app.models import User
        
        branch_id = None
        user_id = request.args.get('user_id')
        if not user_id and 'user_id' in session:
            user_id = session['user_id']
        
        if user_id:
            user = User.query.get(user_id)
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
@jwt_required(optional=True)
def export_arrears():
    try:
        from flask import session
        from app.models import User
        
        branch_id = None
        user_id = request.args.get('user_id')
        if not user_id and 'user_id' in session:
            user_id = session['user_id']
        
        if user_id:
            user = User.query.get(user_id)
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

@bp.route('/all/download', methods=['GET', 'OPTIONS'])
def download_all_reports():
    try:
        from flask import session
        from app.models import User
        
        if request.method == 'OPTIONS':
            return '', 204
        
        branch_id = None
        user_id = request.args.get('user_id')
        if not user_id and 'user_id' in session:
            user_id = session['user_id']
        
        if user_id:
            user = User.query.get(user_id)
            if user and user.role.name != 'admin':
                branch_id = user.branch_id
        
        combined_output = StringIO()
        
        report_sections = []
        
        try:
            csv_content = ReportService.generate_loan_portfolio_report(branch_id=branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nLOAN PORTFOLIO REPORT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            csv_content = ReportService.generate_transaction_report(start_date, end_date, branch_id=branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nTRANSACTION HISTORY REPORT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = ReportService.generate_arrears_report(branch_id=branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nCOLLECTIONS & ARREARS REPORT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_compliance_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nCOMPLIANCE REPORT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_operations_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nDAILY OPERATIONS SUMMARY\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_financial_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nFINANCIAL STATEMENT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_members_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nMEMBER ANALYTICS REPORT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_risk_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nRISK MANAGEMENT REPORT\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_performance_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nBRANCH PERFORMANCE SCORECARD\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        try:
            csv_content = generate_savings_csv(branch_id)
            if csv_content:
                report_sections.append(f"\n{'='*100}\nMEMBER SAVINGS SUMMARY\n{'='*100}\n\n{csv_content}")
        except Exception as e:
            pass
        
        combined_content = "\n".join(report_sections)
        
        return Response(
            combined_content,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=all_reports_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<report_type>/download', methods=['GET', 'OPTIONS'])
def download_report(report_type):
    try:
        from flask import session
        from app.models import User, Loan, Member, Branch
        from app import db
        
        if request.method == 'OPTIONS':
            return '', 204
        
        branch_id = None
        user_id = request.args.get('user_id')
        if not user_id and 'user_id' in session:
            user_id = session['user_id']
        
        if user_id:
            user = User.query.get(user_id)
            if user and user.role.name != 'admin':
                branch_id = user.branch_id
        
        csv_content = None
        filename = None
        
        if report_type == 'loans':
            csv_content = ReportService.generate_loan_portfolio_report(branch_id=branch_id)
            filename = 'loan_portfolio.csv'
        elif report_type == 'transactions':
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            csv_content = ReportService.generate_transaction_report(start_date, end_date, branch_id=branch_id)
            filename = f"transactions_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.csv"
        elif report_type == 'collections':
            csv_content = ReportService.generate_arrears_report(branch_id=branch_id)
            filename = 'collections_arrears.csv'
        elif report_type == 'compliance':
            csv_content = generate_compliance_csv(branch_id)
            filename = 'compliance_report.csv'
        elif report_type == 'operations':
            csv_content = generate_operations_csv(branch_id)
            filename = 'operations_summary.csv'
        elif report_type == 'financial':
            csv_content = generate_financial_csv(branch_id)
            filename = 'financial_statement.csv'
        elif report_type == 'members':
            csv_content = generate_members_csv(branch_id)
            filename = 'member_analytics.csv'
        elif report_type == 'risk':
            csv_content = generate_risk_csv(branch_id)
            filename = 'risk_management.csv'
        elif report_type == 'performance':
            csv_content = generate_performance_csv(branch_id)
            filename = 'branch_performance.csv'
        elif report_type == 'savings':
            csv_content = generate_savings_csv(branch_id)
            filename = 'member_savings.csv'
        else:
            return jsonify({'error': f'Unknown report type: {report_type}'}), 400
        
        if not csv_content:
            return jsonify({'error': f'Failed to generate report: {report_type}'}), 500
        
        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_compliance_csv(branch_id=None):
    try:
        from app.models import Member, Loan
        members = Member.query.all()
        if branch_id:
            members = [m for m in members if m.branch_id == branch_id]
        
        loans = Loan.query.all()
        
        data = [{
            'Total Members': len(members),
            'Total Loans': len(loans),
            'Report Date': datetime.utcnow().date()
        }]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None

def generate_operations_csv(branch_id=None):
    try:
        from app.models import Loan
        loans = Loan.query.all()
        if branch_id:
            loans = [l for l in loans if l.member and l.member.branch_id == branch_id]
        
        data = [{
            'Date': datetime.utcnow().date(),
            'Loans Count': len(loans),
            'Report Generated': datetime.utcnow()
        }]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None

def generate_financial_csv(branch_id=None):
    try:
        from app.models import Loan, Transaction
        loans = Loan.query.all()
        if branch_id:
            loans = [l for l in loans if l.member and l.member.branch_id == branch_id]
        
        total_outstanding = sum(float(l.outstanding_balance) for l in loans) if loans else 0
        
        data = [{
            'Total Loans': len(loans),
            'Total Outstanding': total_outstanding,
            'Report Date': datetime.utcnow().date()
        }]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None

def generate_members_csv(branch_id=None):
    try:
        from app.models import Member
        members = Member.query.all()
        if branch_id:
            members = [m for m in members if m.branch_id == branch_id]
        
        data = []
        for member in members:
            data.append({
                'Member ID': member.id,
                'Status': member.status,
                'Email': member.user.email if member.user else 'N/A',
                'Report Date': datetime.utcnow().date()
            })
        
        if not data:
            data = [{'Message': 'No members found'}]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None

def generate_risk_csv(branch_id=None):
    try:
        from app.models import Loan
        loans = Loan.query.all()
        if branch_id:
            loans = [l for l in loans if l.member and l.member.branch_id == branch_id]
        
        data = [{
            'Total Loans': len(loans),
            'Risky Loans': sum(1 for l in loans if l.outstanding_balance > 100000),
            'Report Date': datetime.utcnow().date()
        }]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None

def generate_performance_csv(branch_id=None):
    try:
        from app.models import Branch, Loan
        
        branches = Branch.query.all()
        if branch_id:
            branches = [b for b in branches if b.id == branch_id]
        
        data = []
        for branch in branches:
            loans = [l for l in branch.loans] if hasattr(branch, 'loans') else []
            data.append({
                'Branch': branch.name,
                'Loans Count': len(loans),
                'Members': 0
            })
        
        if not data:
            data = [{'Message': 'No branches found'}]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None

def generate_savings_csv(branch_id=None):
    try:
        from app.models import Member
        members = Member.query.all()
        if branch_id:
            members = [m for m in members if m.branch_id == branch_id]
        
        data = []
        for member in members:
            data.append({
                'Member ID': member.id,
                'Savings Balance': 0,
                'Report Date': datetime.utcnow().date()
            })
        
        if not data:
            data = [{'Message': 'No members found'}]
        
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
    except Exception as e:
        return None
