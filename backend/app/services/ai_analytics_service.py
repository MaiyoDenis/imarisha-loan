
from app import db, cache
from app.models import (
    Member, Loan, Transaction, User, Branch, Group, LoanProductItem
)
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_, case
import logging
try:
    import pandas as pd
    import numpy as np
    from sklearn.preprocessing import StandardScaler
    from sklearn.cluster import KMeans
    from prophet import Prophet
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    pd = None
    np = None
import json
from decimal import Decimal

logger = logging.getLogger(__name__)
CACHE_TIMEOUT = 300


class AIAnalyticsService:
    
    @staticmethod
    def _get_month_expression(column):
        """Helper to get database-agnostic month expression"""
        try:
            if db.engine.name == 'postgresql':
                return func.date_trunc('month', column)
        except Exception:
            pass
        return func.strftime('%Y-%m-01', column)

    @staticmethod
    def forecast_arrears_rate(months_ahead=12, branch_id=None):
        """
        Forecast arrears rate using Prophet time series forecasting.
        Returns prediction with confidence intervals.
        """
        try:
            cache_key = f"forecast_arrears:{branch_id}:{months_ahead}"
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
            
            if not ML_AVAILABLE:
                return {
                    'status': 'unavailable',
                    'message': 'ML stack not installed on server',
                    'predictions': [],
                    'current_rate': 0.0,
                    'average_rate': 0.0,
                    'confidence_level': 0
                }
            
            query = db.session.query(
                AIAnalyticsService._get_month_expression(Loan.disbursement_date).label('month'),
                func.count(Loan.id).label('total_loans'),
                func.sum(case(
                    (Loan.status.in_(['arrears', 'defaulted']), 1),
                    else_=0
                )).label('arrears_count')
            ).filter(Loan.disbursement_date.isnot(None))
            
            if branch_id:
                query = query.join(Member).join(Group).filter(
                    Group.branch_id == branch_id
                )
            
            historical_data = query.group_by('month').order_by('month').all()
            
            if len(historical_data) < 3:
                # Return mock data for demo purposes
                mock_predictions = []
                current_date = datetime.utcnow()
                for i in range(months_ahead):
                    pred_date = current_date + timedelta(days=30 * (i + 1))
                    mock_predictions.append({
                        'date': pred_date.strftime('%Y-%m-%d'),
                        'forecasted_rate': 5.0 + (i * 0.5),  # Gradual increase
                        'lower_bound': max(0, 5.0 + (i * 0.5) - 2),
                        'upper_bound': 5.0 + (i * 0.5) + 2,
                        'trend': 'increasing' if i > 0 else 'stable'
                    })
                
                return {
                    'status': 'insufficient_data',
                    'message': 'Need at least 3 months of data - showing demo data',
                    'predictions': mock_predictions,
                    'current_rate': 5.0,
                    'average_rate': 5.0,
                    'confidence_level': 50
                }
            
            df = pd.DataFrame([
                {
                    'ds': pd.Timestamp(row[0]),
                    'y': float(row[2] or 0) / float(row[1] or 1) * 100
                }
                for row in historical_data
            ])
            
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                interval_width=0.95
            )
            model.fit(df)
            
            future = model.make_future_dataframe(periods=months_ahead, freq='MS')
            forecast = model.predict(future)
            
            last_date = df['ds'].max()
            future_forecast = forecast[forecast['ds'] > last_date].copy()
            
            result = {
                'status': 'success',
                'forecast_type': 'arrears_rate',
                'predictions': [
                    {
                        'date': row['ds'].strftime('%Y-%m-%d'),
                        'forecasted_rate': float(row['yhat']),
                        'lower_bound': float(row['yhat_lower']),
                        'upper_bound': float(row['yhat_upper']),
                        'trend': 'increasing' if row['yhat'] > df['y'].iloc[-1] else 'decreasing'
                    }
                    for _, row in future_forecast.iterrows()
                ],
                'current_rate': float(df['y'].iloc[-1]),
                'average_rate': float(df['y'].mean()),
                'confidence_level': 95
            }
            
            cache.set(cache_key, json.dumps(result, default=str))
            return result
            
        except Exception as e:
            logger.error(f"Arrears forecasting error: {str(e)}")
            return {
                'status': 'error',
                'message': f'Service temporarily unavailable: {str(e)}',
                'predictions': [],
                'current_rate': 0.0,
                'average_rate': 0.0,
                'confidence_level': 0
            }
    

    @staticmethod
    def analyze_member_behavior(branch_id=None):
        """
        Analyze member behavior and segment them using K-Means clustering.
        Returns behavioral segments and insights.
        """
        try:
            cache_key = f"member_behavior:{branch_id}"
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
            
            members = Member.query.outerjoin(Group).all()
            if branch_id:
                members = [m for m in members if m.group and m.group.branch_id == branch_id]
            
            if len(members) < 3:
                # Return demo segments
                return {
                    'status': 'insufficient_data',
                    'message': 'Need at least 3 members - showing demo segments',
                    'total_members': len(members),
                    'segments': {
                        'High-Value Customers': {'count': 1, 'percentage': 33.3, 'member_ids': []},
                        'Growth Potential': {'count': 1, 'percentage': 33.3, 'member_ids': []},
                        'Standard Members': {'count': 1, 'percentage': 33.3, 'member_ids': []},
                        'At-Risk': {'count': 0, 'percentage': 0, 'member_ids': []},
                        'Inactive': {'count': 0, 'percentage': 0, 'member_ids': []}
                    }
                }
            
            if not ML_AVAILABLE:
                # Return basic segments without ML
                total_members = len(members)
                return {
                    'status': 'basic_analysis',
                    'message': 'ML stack not available - showing basic analysis',
                    'total_members': total_members,
                    'segments': {
                        'High-Value Customers': {'count': int(total_members * 0.2), 'percentage': 20.0, 'member_ids': []},
                        'Growth Potential': {'count': int(total_members * 0.3), 'percentage': 30.0, 'member_ids': []},
                        'Standard Members': {'count': int(total_members * 0.4), 'percentage': 40.0, 'member_ids': []},
                        'At-Risk': {'count': int(total_members * 0.05), 'percentage': 5.0, 'member_ids': []},
                        'Inactive': {'count': int(total_members * 0.05), 'percentage': 5.0, 'member_ids': []}
                    }
                }
            
            member_features = []
            member_ids = []
            
            for member in members:
                loans = Loan.query.filter_by(member_id=member.id).all()
                transactions = Transaction.query.filter_by(member_id=member.id).all()
                
                total_borrowed = sum(float(l.principle_amount) for l in loans)
                completed_loans = len([l for l in loans if l.status == 'completed'])
                defaulted_loans = len([l for l in loans if l.status == 'defaulted'])
                loan_repayment_rate = (completed_loans / len(loans)) if loans else 0
                
                avg_transaction_amount = (
                    np.mean([float(t.amount) for t in transactions]) 
                    if transactions else 0
                )
                
                savings_balance = float(member.savings_account.balance) if member.savings_account else 0
                days_active = (datetime.utcnow() - member.created_at).days
                
                member_features.append([
                    total_borrowed,
                    completed_loans,
                    defaulted_loans,
                    loan_repayment_rate,
                    avg_transaction_amount,
                    savings_balance,
                    days_active,
                    len(transactions)
                ])
                member_ids.append(member.id)
            
            df_features = pd.DataFrame(member_features, columns=[
                'total_borrowed', 'completed_loans', 'defaulted_loans',
                'repayment_rate', 'avg_transaction', 'savings_balance',
                'days_active', 'transaction_count'
            ])
            
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(df_features)
            
            kmeans = KMeans(n_clusters=min(5, len(members)), random_state=42, n_init=10)
            segments = kmeans.fit_predict(scaled_features)
            
            segment_names = [
                'High-Value Customers',
                'Growth Potential',
                'Standard Members',
                'At-Risk',
                'Inactive'
            ]
            
            segments_data = {
                'status': 'success',
                'total_members': len(members),
                'segments': {}
            }
            
            for i in range(min(5, len(members))):
                segment_members = [
                    member_ids[j] for j, seg in enumerate(segments) if seg == i
                ]
                segments_data['segments'][segment_names[i]] = {
                    'count': len(segment_members),
                    'percentage': (len(segment_members) / len(members)) * 100,
                    'member_ids': segment_members[:10]
                }
            
            cache.set(cache_key, json.dumps(segments_data, default=str))
            return segments_data
            
        except Exception as e:
            logger.error(f"Member behavior analysis error: {str(e)}")
            return {
                'status': 'error',
                'message': f'Service temporarily unavailable: {str(e)}',
                'total_members': 0,
                'segments': {}
            }
    
    @staticmethod
    def predict_customer_lifetime_value(member_id):
        """
        Predict CLV (Customer Lifetime Value) for a member based on historical behavior.
        """
        try:
            cache_key = f"clv_prediction:{member_id}"
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
            
            member = Member.query.get(member_id)
            if not member:
                return {'status': 'error', 'message': 'Member not found'}
            
            loans = Loan.query.filter_by(member_id=member_id).all()
            transactions = Transaction.query.filter_by(member_id=member_id).all()
            
            if not loans and not transactions:
                return {'status': 'insufficient_data', 'message': 'No transaction history'}
            
            total_interest_paid = sum(
                float(l.interest_amount) for l in loans if l.status == 'completed'
            )
            total_fees_paid = sum(
                float(l.charge_fee) for l in loans if l.status == 'completed'
            )
            
            completed_loans = len([l for l in loans if l.status == 'completed'])
            avg_loan_value = (
                np.mean([float(l.principle_amount) for l in loans]) 
                if loans else 0
            )
            
            repayment_reliability = (completed_loans / len(loans)) if loans else 0
            
            average_transaction_value = (
                np.mean([float(t.amount) for t in transactions]) 
                if transactions else 0
            )
            
            expected_future_loans = completed_loans * 1.5 if repayment_reliability > 0.7 else completed_loans * 0.8
            
            projected_revenue = (expected_future_loans * avg_loan_value * 0.10) + (expected_future_loans * avg_loan_value * 0.04)
            
            clv = total_interest_paid + total_fees_paid + projected_revenue
            
            result = {
                'status': 'success',
                'member_id': member_id,
                'clv_estimate': float(clv),
                'historical_revenue': float(total_interest_paid + total_fees_paid),
                'projected_revenue': float(projected_revenue),
                'lifetime_value_category': (
                    'high' if clv > 50000 else
                    'medium' if clv > 10000 else
                    'low'
                ),
                'confidence_score': min(100, (completed_loans / max(completed_loans + 2, 5)) * 100),
                'insights': {
                    'completed_loans': completed_loans,
                    'repayment_reliability': float(repayment_reliability),
                    'average_loan_size': float(avg_loan_value),
                    'recommended_action': (
                        'Increase credit limit' if repayment_reliability > 0.8 else
                        'Maintain current limits' if repayment_reliability > 0.5 else
                        'Review lending terms'
                    )
                }
            }
            
            cache.set(cache_key, json.dumps(result, default=str))
            return result
            
        except Exception as e:
            logger.error(f"CLV prediction error: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    

    @staticmethod
    def forecast_seasonal_demand(product_id=None, months_ahead=12, branch_id=None):
        """
        Forecast seasonal demand patterns for products using Prophet.
        """
        try:
            cache_key = f"seasonal_demand:{product_id}:{branch_id}:{months_ahead}"
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
            
            if not ML_AVAILABLE:
                return {
                    'status': 'unavailable',
                    'message': 'ML stack not installed on server',
                    'predictions': [],
                    'current_demand': 0,
                    'average_demand': 0,
                    'confidence_level': 0
                }
            
            # Simple query without complex joins first
            query = db.session.query(
                AIAnalyticsService._get_month_expression(Loan.disbursement_date).label('month'),
                func.count(Loan.id).label('loan_count')
            ).filter(Loan.disbursement_date.isnot(None))
            
            if branch_id:
                query = query.join(Member).join(Group).filter(
                    Group.branch_id == branch_id
                )
            
            # Try product filtering if LoanProductItem is available
            if product_id:
                try:
                    query = query.join(LoanProductItem).filter(
                        LoanProductItem.product_id == product_id
                    )
                except Exception as e:
                    logger.warning(f"Could not filter by product: {e}")
                    # Continue without product filter
            
            historical_data = query.group_by('month').order_by('month').all()
            
            if len(historical_data) < 3:
                # Return mock seasonal demand data
                mock_predictions = []
                current_date = datetime.utcnow()
                base_demand = 100
                
                for i in range(months_ahead):
                    pred_date = current_date + timedelta(days=30 * (i + 1))
                    month = pred_date.month
                    
                    # Simple seasonal pattern (higher in Q4)
                    seasonal_factor = 1.2 if month in [10, 11, 12] else 0.9 if month in [6, 7, 8] else 1.0
                    
                    mock_predictions.append({
                        'date': pred_date.strftime('%Y-%m-%d'),
                        'forecasted_demand': int(base_demand * seasonal_factor + i * 2),
                        'lower_bound': int(base_demand * seasonal_factor * 0.7 + i * 2),
                        'upper_bound': int(base_demand * seasonal_factor * 1.3 + i * 2),
                        'seasonality_factor': seasonal_factor
                    })
                
                return {
                    'status': 'insufficient_data',
                    'message': 'Need at least 3 months of data - showing demo data',
                    'forecast_type': 'seasonal_demand',
                    'product_id': product_id,
                    'predictions': mock_predictions,
                    'current_demand': base_demand,
                    'average_demand': base_demand,
                    'peak_months': ['October', 'November', 'December'],
                    'confidence_level': 60
                }
            
            df = pd.DataFrame([
                {
                    'ds': pd.Timestamp(row[0]),
                    'y': float(row[1])
                }
                for row in historical_data
            ])
            
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                interval_width=0.90
            )
            model.fit(df)
            
            future = model.make_future_dataframe(periods=months_ahead, freq='MS')
            forecast = model.predict(future)
            
            last_date = df['ds'].max()
            future_forecast = forecast[forecast['ds'] > last_date].copy()
            
            result = {
                'status': 'success',
                'forecast_type': 'seasonal_demand',
                'product_id': product_id,
                'predictions': [
                    {
                        'date': row['ds'].strftime('%Y-%m-%d'),
                        'forecasted_demand': int(max(0, row['yhat'])),
                        'lower_bound': int(max(0, row['yhat_lower'])),
                        'upper_bound': int(row['yhat_upper']),
                        'seasonality_factor': float(row['yearly'] if 'yearly' in row else 1.0)
                    }
                    for _, row in future_forecast.iterrows()
                ],
                'current_demand': int(df['y'].iloc[-1]),
                'average_demand': float(df['y'].mean()),
                'peak_months': [],
                'confidence_level': 90
            }
            
            cache.set(cache_key, json.dumps(result, default=str))
            return result
            
        except Exception as e:
            logger.error(f"Seasonal demand forecasting error: {str(e)}")
            return {
                'status': 'error',
                'message': f'Service temporarily unavailable: {str(e)}',
                'predictions': [],
                'current_demand': 0,
                'average_demand': 0,
                'confidence_level': 0
            }
    
    @staticmethod
    def get_member_lifecycle_stage(member_id):
        """
        Determine member lifecycle stage based on activity and loan history.
        Stages: onboarding, active, mature, vip, at_risk, inactive
        """
        try:
            member = Member.query.get(member_id)
            if not member:
                return {'status': 'error', 'message': 'Member not found'}
            
            loans = Loan.query.filter_by(member_id=member_id).all()
            transactions = Transaction.query.filter_by(member_id=member_id).all()
            
            days_since_join = (datetime.utcnow() - member.created_at).days
            
            if days_since_join < 90:
                return {'stage': 'onboarding', 'days_active': days_since_join}
            
            completed_loans = len([l for l in loans if l.status == 'completed'])
            active_loans = len([l for l in loans if l.status == 'active'])
            defaulted_loans = len([l for l in loans if l.status == 'defaulted'])
            
            recent_transactions = [
                t for t in transactions
                if (datetime.utcnow() - t.created_at).days < 30
            ]
            
            if defaulted_loans > 0 and defaulted_loans > completed_loans * 0.3:
                return {
                    'stage': 'at_risk',
                    'completed_loans': completed_loans,
                    'defaulted_loans': defaulted_loans,
                    'reason': 'High default rate'
                }
            
            if len(recent_transactions) == 0 and days_since_join > 180:
                return {
                    'stage': 'inactive',
                    'days_since_last_activity': (datetime.utcnow() - transactions[-1].created_at).days if transactions else days_since_join
                }
            
            if completed_loans >= 5 and member.risk_score <= 30:
                return {
                    'stage': 'vip',
                    'completed_loans': completed_loans,
                    'risk_score': member.risk_score
                }
            
            if completed_loans >= 2:
                return {
                    'stage': 'mature',
                    'completed_loans': completed_loans,
                    'active_loans': active_loans
                }
            
            if completed_loans >= 1 or len(recent_transactions) > 0:
                return {
                    'stage': 'active',
                    'completed_loans': completed_loans,
                    'recent_activity': len(recent_transactions)
                }
            
            return {'stage': 'onboarding'}
            
        except Exception as e:
            logger.error(f"Lifecycle stage determination error: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    @staticmethod
    def identify_at_risk_members(branch_id=None, threshold=0.6):
        """
        Identify members at risk of defaulting based on multiple factors.
        Returns ranked list of at-risk members with intervention recommendations.
        """
        try:
            cache_key = f"at_risk_members:{branch_id}:{threshold}"
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
            
            members = Member.query.outerjoin(Group).all()
            if branch_id:
                members = [m for m in members if m.group and m.group.branch_id == branch_id]
            
            at_risk = []
            
            for member in members:
                loans = Loan.query.filter_by(member_id=member.id).all()
                active_loans = [l for l in loans if l.status == 'active']
                
                if not active_loans:
                    continue
                
                risk_score = 0
                risk_factors = []
                
                arrears_loans = [l for l in active_loans if l.due_date and l.due_date < datetime.utcnow()]
                if arrears_loans:
                    risk_score += 0.3 * len(arrears_loans) / len(active_loans)
                    risk_factors.append(f'{len(arrears_loans)} loans in arrears')
                
                if member.risk_score > 50:
                    risk_score += 0.2
                    risk_factors.append(f'High internal risk score: {member.risk_score}')
                
                outstanding = sum(float(l.outstanding_balance) for l in active_loans)
                savings = float(member.savings_account.balance) if member.savings_account else 0
                coverage_ratio = savings / outstanding if outstanding > 0 else 1
                
                if coverage_ratio < 0.2:
                    risk_score += 0.2
                    risk_factors.append(f'Low savings coverage: {coverage_ratio:.2%}')
                
                defaulted_count = len([l for l in loans if l.status == 'defaulted'])
                if defaulted_count > 0:
                    risk_score += 0.2
                    risk_factors.append(f'Previous defaults: {defaulted_count}')
                
                transactions = Transaction.query.filter_by(member_id=member.id).all()
                recent_transactions = [
                    t for t in transactions
                    if (datetime.utcnow() - t.created_at).days < 60
                ]
                if len(recent_transactions) < 2 and len(loans) > 0:
                    risk_score += 0.1
                    risk_factors.append('Low transaction activity')
                
                if risk_score >= threshold:
                    at_risk.append({
                        'member_id': member.id,
                        'member_name': f"{member.user.first_name} {member.user.last_name}",
                        'risk_score': min(1.0, risk_score),
                        'risk_factors': risk_factors,
                        'recommended_action': (
                            'Immediate follow-up required' if risk_score > 0.8 else
                            'Schedule member meeting' if risk_score > 0.7 else
                            'Monitor closely'
                        ),
                        'outstanding_balance': float(sum(float(l.outstanding_balance) for l in active_loans))
                    })
            
            at_risk.sort(key=lambda x: x['risk_score'], reverse=True)
            
            result = {
                'status': 'success',
                'total_members_scanned': len(members),
                'at_risk_count': len(at_risk),
                'members': at_risk[:50]
            }
            
            cache.set(cache_key, json.dumps(result, default=str))
            return result
            
        except Exception as e:
            logger.error(f"At-risk member identification error: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    @staticmethod
    def get_cohort_analysis(branch_id=None):
        """
        Analyze member cohorts by join date to understand retention and activity patterns.
        """
        try:
            cache_key = f"cohort_analysis:{branch_id}"
            cached = cache.get(cache_key)
            if cached:
                return json.loads(cached)
            
            members = Member.query.outerjoin(Group).all()
            if branch_id:
                members = [m for m in members if m.group and m.group.branch_id == branch_id]
            
            cohorts = {}
            
            for member in members:
                cohort_month = member.created_at.strftime('%Y-%m')
                
                if cohort_month not in cohorts:
                    cohorts[cohort_month] = {
                        'joined': 0,
                        'active': 0,
                        'completed_loan': 0,
                        'defaulted': 0,
                        'inactive': 0
                    }
                
                cohorts[cohort_month]['joined'] += 1
                
                if member.status == 'active':
                    cohorts[cohort_month]['active'] += 1
                
                loans = Loan.query.filter_by(member_id=member.id).all()
                cohorts[cohort_month]['completed_loan'] += len([l for l in loans if l.status == 'completed'])
                cohorts[cohort_month]['defaulted'] += len([l for l in loans if l.status == 'defaulted'])
                
                transactions = Transaction.query.filter_by(member_id=member.id).all()
                recent = [t for t in transactions if (datetime.utcnow() - t.created_at).days < 60]
                if len(recent) == 0:
                    cohorts[cohort_month]['inactive'] += 1
            
            cohort_data = []
            for month in sorted(cohorts.keys()):
                cohort = cohorts[month]
                cohort_data.append({
                    'cohort_month': month,
                    'total_joined': cohort['joined'],
                    'active_rate': (cohort['active'] / cohort['joined']) * 100 if cohort['joined'] > 0 else 0,
                    'completion_rate': (cohort['completed_loan'] / cohort['joined']) * 100 if cohort['joined'] > 0 else 0,
                    'default_rate': (cohort['defaulted'] / cohort['joined']) * 100 if cohort['joined'] > 0 else 0,
                    'inactive_rate': (cohort['inactive'] / cohort['joined']) * 100 if cohort['joined'] > 0 else 0
                })
            
            result = {
                'status': 'success',
                'total_cohorts': len(cohort_data),
                'cohorts': cohort_data,
                'insights': {
                    'best_performing_cohort': max(cohort_data, key=lambda x: x['active_rate'])['cohort_month'] if cohort_data else None,
                    'average_active_rate': (sum(c['active_rate'] for c in cohort_data) / len(cohort_data)) if cohort_data else 0,
                    'average_default_rate': (sum(c['default_rate'] for c in cohort_data) / len(cohort_data)) if cohort_data else 0
                }
            }
            
            cache.set(cache_key, json.dumps(result, default=str))
            return result
            
        except Exception as e:
            logger.error(f"Cohort analysis error: {str(e)}")
            return {'status': 'error', 'message': str(e)}



def case(*args, **kwargs):
    from sqlalchemy import case as sql_case
    return sql_case(*args, **kwargs)
