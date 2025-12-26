from flask import Blueprint, jsonify, session, request
from app.models import Loan, SavingsAccount, Member, User, ActivityLog
from app import db
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from app.services.analytics_service import AnalyticsService
from app.utils.decorators import login_required
from app.services.ai_analytics_service import AIAnalyticsService
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        
        if not user:
            logger.error(f"User not found for ID: {user_id}")
            return jsonify({'error': 'User not found'}), 404
            
        is_admin = user.role.name == 'admin'
        
        # Allow branch filtering via query param for admins
        query_branch_id = request.args.get('branch_id', type=int)
        if is_admin and query_branch_id:
            branch_id = query_branch_id
        else:
            branch_id = None if is_admin else user.branch_id
        
        logger.info(f"Dashboard stats requested by {user.username} (Role: {user.role.name}, Branch Filter: {branch_id})")
        
        # 1. Total Loans (Active, Pending and Completed)
        # Include all relevant statuses to avoid 0s if status names vary
        active_statuses = ['pending', 'under_review', 'approved', 'disbursed', 'released', 'repaid', 'completed']
        loans_q = db.session.query(func.count(Loan.id))
        if branch_id:
            loans_q = loans_q.join(Member, Loan.member_id == Member.id).filter(Member.branch_id == branch_id)
        
        total_loans = loans_q.filter(Loan.status.in_(active_statuses)).scalar() or 0
        logger.info(f"Total Loans found: {total_loans} with statuses {active_statuses}")
        
        # 2. Total Savings
        savings_q = db.session.query(func.sum(SavingsAccount.balance))
        if branch_id:
            savings_q = savings_q.join(Member, SavingsAccount.member_id == Member.id).filter(Member.branch_id == branch_id)
        total_savings = savings_q.scalar() or 0
        logger.info(f"Total Savings found: {total_savings}")
        
        # 3. Active Members
        members_q = db.session.query(func.count(Member.id)).filter(or_(Member.status == 'active', Member.status == 'Active'))
        if branch_id:
            members_q = members_q.filter(Member.branch_id == branch_id)
        active_members = members_q.scalar() or 0
        logger.info(f"Active Members found: {active_members}")
        
        # 4. Overdue Loans
        now = datetime.utcnow()
        overdue_q = db.session.query(func.count(Loan.id)).filter(
            Loan.status.in_(['disbursed', 'released']),
            Loan.due_date < now
        )
        if branch_id:
            overdue_q = overdue_q.join(Member, Loan.member_id == Member.id).filter(Member.branch_id == branch_id)
        overdue_loans = overdue_q.scalar() or 0
        
        # 5. Collection Rate
        # More inclusive status list for collection rate
        repaid_statuses = ['repaid', 'completed']
        processed_statuses = ['repaid', 'completed', 'disbursed', 'released']
        
        repaid_q = db.session.query(func.count(Loan.id)).filter(Loan.status.in_(repaid_statuses))
        if branch_id:
            repaid_q = repaid_q.join(Member, Loan.member_id == Member.id).filter(Member.branch_id == branch_id)
        repaid_count = repaid_q.scalar() or 0
        
        processed_q = db.session.query(func.count(Loan.id)).filter(Loan.status.in_(processed_statuses))
        if branch_id:
            processed_q = processed_q.join(Member, Loan.member_id == Member.id).filter(Member.branch_id == branch_id)
        processed_count = processed_q.scalar() or 0
        
        collection_rate = (repaid_count / processed_count * 100) if processed_count > 0 else 0
        logger.info(f"Collection Rate: {collection_rate} (Repaid: {repaid_count}, Processed: {processed_count})")
        
        # 6. Pending Approvals
        pending_q = db.session.query(func.count(Loan.id)).filter(Loan.status == 'pending')
        if branch_id:
            pending_q = pending_q.join(Member, Loan.member_id == Member.id).filter(Member.branch_id == branch_id)
        pending_approvals = pending_q.scalar() or 0
        
        # 7. Average Loan Amount
        avg_q = db.session.query(func.avg(Loan.principle_amount)).filter(
            Loan.status.in_(['disbursed', 'released', 'repaid', 'approved', 'completed'])
        )
        if branch_id:
            avg_q = avg_q.join(Member, Loan.member_id == Member.id).filter(Member.branch_id == branch_id)
        average_loan = avg_q.scalar() or 0
        logger.info(f"Average Loan: {average_loan}")
        
        # 8. Monthly Growth (New Loans)
        today = datetime.utcnow().date()
        month_start = datetime.combine(today.replace(day=1), datetime.min.time())
        month_ago = datetime.combine((today.replace(day=1) - timedelta(days=1)).replace(day=1), datetime.min.time())
        
        curr_q = db.session.query(func.count(Loan.id)).select_from(Loan).filter(Loan.created_at >= month_start)
        if branch_id:
            curr_q = curr_q.join(Member).filter(Member.branch_id == branch_id)
        curr_count = curr_q.scalar() or 0
        
        prev_q = db.session.query(func.count(Loan.id)).select_from(Loan).filter(and_(Loan.created_at >= month_ago, Loan.created_at < month_start))
        if branch_id:
            prev_q = prev_q.join(Member).filter(Member.branch_id == branch_id)
        prev_count = prev_q.scalar() or 0
        
        growth = ((curr_count - prev_count) / prev_count * 100) if prev_count > 0 else 0
        logger.info(f"Growth: {growth} (Current: {curr_count}, Prev: {prev_count})")
        
        return jsonify({
            'total_loans': int(total_loans),
            'total_savings': float(total_savings),
            'active_members': int(active_members),
            'overdue_loans': int(overdue_loans),
            'collection_rate': float(collection_rate),
            'monthly_growth': float(growth),
            'pending_approvals': int(pending_approvals),
            'average_loan_amount': float(average_loan),
            'debug': {
                'user_id': user_id,
                'branch_id': branch_id,
                'role': user.role.name
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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


@bp.route('/ai-insights', methods=['GET'])
@login_required
def get_ai_insights():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        branch_id = user.branch_id if user.role.name != 'admin' else None

        arrears_forecast = AIAnalyticsService.forecast_arrears_rate(months_ahead=3, branch_id=branch_id)
        at_risk = AIAnalyticsService.identify_at_risk_members(branch_id=branch_id, threshold=0.6)
        behavior = AIAnalyticsService.analyze_member_behavior(branch_id=branch_id)
        
        insights = []
        
        if at_risk.get('status') == 'success':
            at_risk_count = at_risk.get('count', 0)
            if at_risk_count > 0:
                insights.append({
                    'type': 'warning',
                    'icon': 'AlertTriangle',
                    'title': f'{at_risk_count} Members At Risk',
                    'description': f'Identified {at_risk_count} members with high default probability. Recommend proactive engagement.',
                    'action': 'Review',
                    'priority': 'high'
                })
        
        if arrears_forecast.get('status') == 'success':
            current_rate = arrears_forecast.get('current_rate', 0)
            predictions = arrears_forecast.get('predictions', [])
            if predictions:
                next_forecast = predictions[0] if predictions else {}
                trend = next_forecast.get('trend', 'stable')
                rate = next_forecast.get('forecasted_rate', current_rate)
                
                if trend == 'increasing':
                    insights.append({
                        'type': 'warning',
                        'icon': 'TrendingUp',
                        'title': f'Arrears Rate Increasing',
                        'description': f'Forecast shows arrears rising to {rate:.1f}%. Monitor closely.',
                        'action': 'Monitor',
                        'priority': 'medium'
                    })
                else:
                    insights.append({
                        'type': 'success',
                        'icon': 'TrendingDown',
                        'title': 'Arrears Trend Improving',
                        'description': f'Forecast shows positive trend. Current rate: {current_rate:.1f}%',
                        'action': 'Maintain',
                        'priority': 'low'
                    })
        
        if behavior.get('status') in ['success', 'basic_analysis']:
            segments = behavior.get('segments', {})
            high_value = segments.get('High-Value Customers', {})
            at_risk_seg = segments.get('At-Risk', {})
            
            if high_value.get('count', 0) > 0:
                insights.append({
                    'type': 'success',
                    'icon': 'Users',
                    'title': f'{high_value.get("count", 0)} High-Value Customers',
                    'description': f'{high_value.get("percentage", 0):.1f}% of member base. Focus on retention.',
                    'action': 'Engage',
                    'priority': 'medium'
                })
        
        today = datetime.utcnow()
        new_members = Member.query.filter(Member.created_at >= (today - timedelta(days=1))).count()
        if new_members > 0:
            insights.append({
                'type': 'info',
                'icon': 'Users',
                'title': f'{new_members} New Members Today',
                'description': f'Strong acquisition momentum. Onboard efficiently.',
                'action': 'Process',
                'priority': 'low'
            })
        
        seven_days_ago = today - timedelta(days=7)
        overdue_loans = Loan.query.filter(
            and_(Loan.status == 'disbursed', Loan.due_date < seven_days_ago)
        ).count()
        
        if branch_id:
            overdue_loans = Loan.query.join(Member).filter(
                and_(
                    Loan.status == 'disbursed',
                    Loan.due_date < seven_days_ago,
                    Member.branch_id == branch_id
                )
            ).count()
        
        if overdue_loans > 0:
            insights.append({
                'type': 'warning',
                'icon': 'Clock',
                'title': f'{overdue_loans} Overdue Loans',
                'description': f'Immediate collection follow-up needed.',
                'action': 'Collect',
                'priority': 'high'
            })
        
        insights.sort(key=lambda x: {'high': 0, 'medium': 1, 'low': 2}.get(x['priority'], 3))
        
        return jsonify({
            'status': 'success',
            'insights': insights[:5],
            'generated_at': datetime.utcnow().isoformat(),
            'branch_id': branch_id
        })
    except Exception as e:
        logger.error(f"AI insights error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'insights': []
        }), 500


@bp.route('/activities', methods=['GET'])
@login_required
def get_activities():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        
        period = request.args.get('period', 'daily')
        limit = request.args.get('limit', 20, type=int)
        
        now = datetime.utcnow()
        
        if period == 'daily':
            start_date = now - timedelta(days=1)
        elif period == 'weekly':
            start_date = now - timedelta(days=7)
        elif period == 'monthly':
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=1)
        
        activities_query = ActivityLog.query.filter(
            ActivityLog.created_at >= start_date
        ).order_by(ActivityLog.created_at.desc()).limit(limit)
        
        activities = []
        for activity in activities_query:
            admin_user = User.query.get(activity.user_id)
            if admin_user:
                activities.append({
                    'id': activity.id,
                    'userId': activity.user_id,
                    'userName': f"{admin_user.first_name} {admin_user.last_name}",
                    'action': activity.action,
                    'entityType': activity.entity_type,
                    'description': activity.description,
                    'createdAt': activity.created_at.isoformat(),
                    'timeAgo': get_time_ago(activity.created_at),
                    'status': 'online' if is_user_online(activity.user_id) else 'offline'
                })
        
        return jsonify({
            'status': 'success',
            'activities': activities,
            'period': period,
            'count': len(activities)
        })
    except Exception as e:
        logger.error(f"Activities error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'activities': []
        }), 500


@bp.route('/staff-status', methods=['GET'])
@login_required
def get_staff_status():
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        
        is_admin = user.role.name == 'admin'
        
        admin_users = User.query.filter(User.role_id == (db.session.query(db.func.min(db.Column(db.Integer))).from_statement(
            db.text("SELECT id FROM roles WHERE name='admin'")
        ).scalar() or 0)) if is_admin else [user]
        
        staff_statuses = []
        for staff in admin_users:
            latest_activity = ActivityLog.query.filter_by(user_id=staff.id).order_by(
                ActivityLog.created_at.desc()
            ).first()
            
            is_online = is_user_online(staff.id)
            
            staff_statuses.append({
                'userId': staff.id,
                'name': f"{staff.first_name} {staff.last_name}",
                'status': 'online' if is_online else 'offline',
                'lastActive': latest_activity.created_at.isoformat() if latest_activity else None,
                'lastAction': latest_activity.action if latest_activity else None,
                'branch': staff.branch.name if staff.branch else 'Head Office'
            })
        
        return jsonify({
            'status': 'success',
            'staff': staff_statuses
        })
    except Exception as e:
        logger.error(f"Staff status error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'staff': []
        }), 500


def is_user_online(user_id, timeout_minutes=15):
    try:
        latest_activity = ActivityLog.query.filter_by(user_id=user_id).order_by(
            ActivityLog.created_at.desc()
        ).first()
        
        if not latest_activity:
            return False
        
        time_diff = datetime.utcnow() - latest_activity.created_at
        return time_diff.total_seconds() < (timeout_minutes * 60)
    except:
        return False


def get_time_ago(dt):
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 7:
        return dt.strftime('%b %d')
    elif diff.days > 0:
        return f'{diff.days}d ago'
    elif diff.seconds > 3600:
        return f'{diff.seconds // 3600}h ago'
    elif diff.seconds > 60:
        return f'{diff.seconds // 60}m ago'
    else:
        return 'just now'
