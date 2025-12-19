from flask import Blueprint, jsonify
from app.models import Loan, SavingsAccount, Member
from app import db
from sqlalchemy import func
from datetime import datetime, timedelta
from app.services.analytics_service import AnalyticsService

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    # Total Active Loans
    active_loans_sum = db.session.query(func.sum(Loan.outstanding_balance))\
        .filter(Loan.status == 'active').scalar() or 0
        
    # Total Savings
    savings_sum = db.session.query(func.sum(SavingsAccount.balance)).scalar() or 0
    
    # Active Members
    active_members_count = Member.query.filter_by(status='active').count()
    
    # Arrears Count (Active loans overdue by 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    arrears_count = Loan.query.filter(
        Loan.status == 'active',
        Loan.due_date < seven_days_ago
    ).count()
    
    return jsonify({
        'totalActiveLoans': str(active_loans_sum),
        'totalSavings': str(savings_sum),
        'activeMembers': active_members_count,
        'arrearsCount': arrears_count
    })

@bp.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        portfolio_metrics = AnalyticsService.get_portfolio_metrics()
        repayment_forecast = AnalyticsService.get_repayment_forecast()
        customer_segments = AnalyticsService.get_customer_segments()
        
        return jsonify({
            'portfolio': portfolio_metrics,
            'forecast': repayment_forecast,
            'segments': customer_segments
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
