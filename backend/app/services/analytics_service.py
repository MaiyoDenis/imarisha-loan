from app import db
from app.models import Loan, Transaction, Member, SavingsAccount
from sqlalchemy import func, case
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class AnalyticsService:
    @staticmethod
    def get_portfolio_metrics(branch_id=None):
        """
        Get key portfolio metrics including PAR (Portfolio at Risk)
        """
        # Base queries
        total_loans_query = Loan.query
        active_loans_query = Loan.query.filter_by(status='disbursed')
        
        total_outstanding_query = db.session.query(func.sum(Loan.outstanding_balance))\
            .filter(Loan.status == 'disbursed')
            
        total_disbursed_query = db.session.query(func.sum(Loan.principle_amount))\
            .filter(Loan.status.in_(['disbursed', 'completed']))

        # PAR Calculation (Portfolio at Risk)
        now = datetime.utcnow()
        par_30_date = now - timedelta(days=30)
        par_90_date = now - timedelta(days=90)
        
        par_30_query = db.session.query(func.sum(Loan.outstanding_balance))\
            .filter(Loan.status == 'disbursed', Loan.due_date < par_30_date)
            
        par_90_query = db.session.query(func.sum(Loan.outstanding_balance))\
            .filter(Loan.status == 'disbursed', Loan.due_date < par_90_date)

        # Apply branch filter
        if branch_id:
            total_loans_query = total_loans_query.join(Member).filter(Member.branch_id == branch_id)
            active_loans_query = active_loans_query.join(Member).filter(Member.branch_id == branch_id)
            total_outstanding_query = total_outstanding_query.join(Member).filter(Member.branch_id == branch_id)
            total_disbursed_query = total_disbursed_query.join(Member).filter(Member.branch_id == branch_id)
            par_30_query = par_30_query.join(Member).filter(Member.branch_id == branch_id)
            par_90_query = par_90_query.join(Member).filter(Member.branch_id == branch_id)

        # Execute queries
        total_loans = total_loans_query.count()
        active_loans = active_loans_query.count()
        total_outstanding = total_outstanding_query.scalar() or 0
        total_disbursed = total_disbursed_query.scalar() or 0
        par_30_amount = par_30_query.scalar() or 0
        par_90_amount = par_90_query.scalar() or 0
            
        par_30_ratio = (float(par_30_amount) / float(total_outstanding)) * 100 if total_outstanding > 0 else 0
        par_90_ratio = (float(par_90_amount) / float(total_outstanding)) * 100 if total_outstanding > 0 else 0
        
        return {
            'total_loans': total_loans,
            'active_loans': active_loans,
            'total_outstanding': float(total_outstanding),
            'total_disbursed': float(total_disbursed),
            'par_30_amount': float(par_30_amount),
            'par_90_amount': float(par_90_amount),
            'par_30_ratio': round(par_30_ratio, 2),
            'par_90_ratio': round(par_90_ratio, 2)
        }

    @staticmethod
    def get_repayment_forecast(days=30, branch_id=None):
        """
        Predict future repayments using historical data (Simple Linear Regression)
        """
        # Get last 90 days of repayments
        start_date = datetime.utcnow() - timedelta(days=90)
        
        query = db.session.query(
            func.date(Transaction.created_at).label('date'),
            func.sum(Transaction.amount).label('amount')
        ).filter(
            Transaction.transaction_type == 'loan_repayment',
            Transaction.created_at >= start_date
        )
        
        if branch_id:
            query = query.join(Member).filter(Member.branch_id == branch_id)
            
        repayments = query.group_by(func.date(Transaction.created_at)).all()
        
        if not repayments:
            return {'forecast': 0, 'trend': 'insufficient_data'}
            
        df = pd.DataFrame(repayments, columns=['date', 'amount'])
        df['date'] = pd.to_datetime(df['date'])
        df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
        
        # Simple Linear Regression
        X = df['days_since_start'].values.reshape(-1, 1)
        y = df['amount'].astype(float).values
        
        # Calculate slope and intercept manually to avoid scikit-learn dependency if needed
        # But since we have numpy:
        A = np.vstack([X.flatten(), np.ones(len(X))]).T
        m, c = np.linalg.lstsq(A, y, rcond=None)[0]
        
        # Predict next 'days'
        last_day = df['days_since_start'].max()
        future_days = np.arange(last_day + 1, last_day + days + 1)
        predictions = m * future_days + c
        
        total_forecast = np.sum(predictions)
        
        return {
            'forecast_amount': round(max(0, total_forecast), 2),
            'trend': 'up' if m > 0 else 'down',
            'daily_average': round(float(np.mean(y)), 2)
        }

    @staticmethod
    def get_customer_segments(branch_id=None):
        """
        Segment customers based on risk score and activity
        """
        # Base queries
        high_risk_query = Member.query.filter(Member.risk_score < 50)
        medium_risk_query = Member.query.filter(Member.risk_score >= 50, Member.risk_score < 75)
        low_risk_query = Member.query.filter(Member.risk_score >= 75)
        total_members_query = Member.query
        
        # Active vs Inactive (No transaction in last 30 days)
        last_month = datetime.utcnow() - timedelta(days=30)
        active_members_query = db.session.query(Transaction.member_id).distinct()\
            .filter(Transaction.created_at >= last_month)
            
        if branch_id:
            high_risk_query = high_risk_query.filter(Member.branch_id == branch_id)
            medium_risk_query = medium_risk_query.filter(Member.branch_id == branch_id)
            low_risk_query = low_risk_query.filter(Member.branch_id == branch_id)
            total_members_query = total_members_query.filter(Member.branch_id == branch_id)
            active_members_query = active_members_query.join(Member).filter(Member.branch_id == branch_id)

        high_risk = high_risk_query.count()
        medium_risk = medium_risk_query.count()
        low_risk = low_risk_query.count()
        
        active_members = active_members_query.count()
        total_members = total_members_query.count()
        inactive_members = total_members - active_members
        
        return {
            'risk_segments': {
                'high_risk': high_risk,
                'medium_risk': medium_risk,
                'low_risk': low_risk
            },
            'activity_segments': {
                'active': active_members,
                'inactive': inactive_members
            }
        }
