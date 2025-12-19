from flask import Blueprint, jsonify, session
from app.models import Loan, SavingsAccount, Member, User
from app import db
from sqlalchemy import func
from datetime import datetime, timedelta
from app.services.analytics_service import AnalyticsService
from app.utils.decorators import login_required

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    # Base queries
    loans_query = db.session.query(func.sum(Loan.outstanding_balance)).filter(Loan.status == 'disbursed')
    savings_query = db.session.query(func.sum(SavingsAccount.balance))
    members_query = Member.query.filter_by(status='active')
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    arrears_query = Loan.query.filter(
        Loan.status == 'disbursed',
        Loan.due_date < seven_days_ago
    )
    
    # Filter by branch if user is not admin
    if user.role.name != 'admin' and user.branch_id:
        loans_query = loans_query.join(Member).filter(Member.branch_id == user.branch_id)
        savings_query = savings_query.join(Member).filter(Member.branch_id == user.branch_id)
        members_query = members_query.filter(Member.branch_id == user.branch_id)
        arrears_query = arrears_query.join(Member).filter(Member.branch_id == user.branch_id)

    # Execute queries
    active_loans_sum = loans_query.scalar() or 0
    savings_sum = savings_query.scalar() or 0
    active_members_count = members_query.count()
    arrears_count = arrears_query.count()
    
    return jsonify({
        'totalActiveLoans': str(active_loans_sum),
        'totalSavings': str(savings_sum),
        'activeMembers': active_members_count,
        'arrearsCount': arrears_count
    })

@bp.route('/analytics', methods=['GET'])
@login_required
def get_analytics():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        branch_id = user.branch_id if user.role.name != 'admin' else None

        portfolio_metrics = AnalyticsService.get_portfolio_metrics(branch_id=branch_id)
        repayment_forecast = AnalyticsService.get_repayment_forecast(branch_id=branch_id)
        customer_segments = AnalyticsService.get_customer_segments(branch_id=branch_id)
        
        return jsonify({
            'portfolio': portfolio_metrics,
            'forecast': repayment_forecast,
            'segments': customer_segments
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
