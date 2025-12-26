"""
Admin Product Dashboard Service
Comprehensive analytics for loan product management with profit tracking
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from decimal import Decimal
from sqlalchemy import func, and_, or_
import redis
import json

from app.models import (
    LoanProduct, Loan, Member, Branch, LoanProductItem,
    SavingsAccount, Transaction, User
)
from app import db


class AdminDashboardService:
    def __init__(self, app=None):
        self.app = app
        self.redis_client = None
        self.cache_duration = 600
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize admin dashboard service with Flask app"""
        self.app = app
        try:
            redis_url = app.config.get('REDIS_URL')
            if redis_url:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
            else:
                self.redis_client = redis.Redis(
                    host=app.config.get('REDIS_HOST', 'localhost'),
                    port=app.config.get('REDIS_PORT', 6379),
                    db=app.config.get('REDIS_DB', 6),
                    decode_responses=True
                )
            # Test connection
            if self.redis_client:
                self.redis_client.ping()
        except Exception as e:
            logging.warning(f"Failed to initialize Redis for admin dashboard: {str(e)}")
            self.redis_client = None
    
    def get_admin_dashboard(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Get comprehensive admin dashboard with all metrics"""
        cache_key = f"admin_dashboard:{branch_id or 'all'}"
        
        if self.redis_client:
            try:
                cached = self.redis_client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except:
                pass
        
        try:
            dashboard_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'product_overview': self._get_product_overview(branch_id),
                'lending_analytics': self._get_lending_analytics(branch_id),
                'member_metrics': self._get_member_metrics(branch_id),
                'risk_metrics': self._get_risk_metrics(branch_id),
                'profit_analysis': self._get_profit_analysis(branch_id),
                'repayment_tracking': self._get_repayment_tracking(branch_id),
                'growth_metrics': self._get_growth_metrics(branch_id),
                'branch_comparison': self._get_branch_comparison(),
                'top_products': self._get_top_products(branch_id),
                'alerts': self._get_admin_alerts(branch_id),
                'loan_trends': self._get_loan_trends(branch_id)
            }
            
            if self.redis_client:
                try:
                    self.redis_client.setex(
                        cache_key,
                        self.cache_duration,
                        json.dumps(dashboard_data, default=str)
                    )
                except:
                    pass
            
            return dashboard_data
        except Exception as e:
            logging.error(f"Error generating admin dashboard: {str(e)}")
            return {'error': str(e)}
    
    def _get_product_overview(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Get product inventory and lending overview"""
        try:
            products = LoanProduct.query.filter_by(is_active=True).all()
            
            total_products = len(products)
            total_value = sum(float(p.buying_price) * p.stock_quantity for p in products)
            total_market_value = sum(float(p.buying_price) * p.stock_quantity for p in products)
            
            low_stock_products = [
                {
                    'id': p.id,
                    'name': p.name,
                    'stock': p.stock_quantity,
                    'threshold': p.low_stock_threshold
                }
                for p in products if p.stock_quantity <= p.low_stock_threshold
            ]
            
            return {
                'total_products': total_products,
                'total_inventory_value': float(total_value),
                'total_market_value': float(total_market_value),
                'active_products': total_products,
                'low_stock_alerts': len(low_stock_products),
                'low_stock_products': low_stock_products[:5]
            }
        except Exception as e:
            logging.error(f"Error getting product overview: {str(e)}")
            return {}
    
    def _get_lending_analytics(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Get comprehensive lending analytics"""
        try:
            query = Loan.query
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            total_loans = query.count()
            
            borrowed_loans = query.filter(
                Loan.status.in_(['approved', 'disbursed', 'completed'])
            ).all()
            
            paid_loans = query.filter(Loan.status == 'completed').all()
            
            pending_loans = query.filter(
                Loan.status.in_(['pending', 'approved'])
            ).count()
            
            total_borrowed = sum(float(l.principle_amount) for l in borrowed_loans)
            total_paid = sum(float(l.principle_amount) for l in paid_loans)
            total_interest = sum(float(l.interest_amount) for l in borrowed_loans)
            total_fees = sum(float(l.charge_fee) for l in borrowed_loans)
            
            expected_income = total_interest + total_fees
            
            total_outstanding = sum(float(l.outstanding_balance) for l in borrowed_loans if l.status != 'completed')
            
            return {
                'total_loans_active': len([l for l in borrowed_loans if l.status != 'completed']),
                'total_loans_completed': len(paid_loans),
                'total_loans_pending': pending_loans,
                'total_loans_count': total_loans,
                'total_borrowed_amount': float(total_borrowed),
                'total_paid_amount': float(total_paid),
                'total_outstanding': float(total_outstanding),
                'total_interest_income': float(total_interest),
                'total_processing_fees': float(total_fees),
                'expected_total_income': float(expected_income),
                'borrowed_to_paid_ratio': round((total_paid / total_borrowed * 100), 2) if total_borrowed > 0 else 0
            }
        except Exception as e:
            logging.error(f"Error getting lending analytics: {str(e)}")
            return {}
    
    def _get_profit_analysis(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Analyze profit from lending operations"""
        try:
            query = LoanProductItem.query.join(Loan)
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            loan_items = query.all()
            
            cost_of_goods_sold = Decimal(0)
            revenue_from_selling_price = Decimal(0)
            
            for item in loan_items:
                product = item.product
                if product:
                    cost_of_goods_sold += Decimal(str(product.buying_price)) * item.quantity
                    revenue_from_selling_price += Decimal(str(product.selling_price)) * item.quantity
            
            query = Loan.query
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            completed_loans = query.filter(Loan.status == 'completed').all()
            active_loans = query.filter(
                Loan.status.in_(['approved', 'disbursed'])
            ).all()
            
            total_interest_income = sum(
                Decimal(str(l.interest_amount)) for l in completed_loans
            )
            total_processing_fees = sum(
                Decimal(str(l.charge_fee)) for l in completed_loans
            )
            total_income = total_interest_income + total_processing_fees
            
            gross_profit = revenue_from_selling_price - cost_of_goods_sold + total_income
            profit_margin = (gross_profit / revenue_from_selling_price * 100) if revenue_from_selling_price > 0 else 0
            
            expected_income_from_active = sum(
                Decimal(str(l.interest_amount)) + Decimal(str(l.charge_fee))
                for l in active_loans
            )
            
            return {
                'cost_of_goods_sold': float(cost_of_goods_sold),
                'revenue_selling_price': float(revenue_from_selling_price),
                'gross_profit': float(gross_profit),
                'profit_margin_percentage': float(profit_margin),
                'total_interest_income': float(total_interest_income),
                'total_processing_fees': float(total_processing_fees),
                'total_income_realized': float(total_income),
                'expected_income_pending': float(expected_income_from_active),
                'cost_benefit_ratio': float((revenue_from_selling_price / cost_of_goods_sold)) if cost_of_goods_sold > 0 else 0
            }
        except Exception as e:
            logging.error(f"Error in profit analysis: {str(e)}")
            return {}
    
    def _get_repayment_tracking(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Track repayment performance"""
        try:
            query = Loan.query
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            total_disbursed = query.filter(
                Loan.status.in_(['disbursed', 'completed'])
            ).count()
            
            completed_loans = query.filter(Loan.status == 'completed').count()
            defaulted_loans = query.filter(Loan.status == 'defaulted').count()
            
            overdue_loans = query.filter(
                and_(
                    Loan.status.in_(['approved', 'disbursed']),
                    Loan.due_date < datetime.utcnow()
                )
            ).count()
            
            repayment_rate = (completed_loans / total_disbursed * 100) if total_disbursed > 0 else 0
            default_rate = (defaulted_loans / total_disbursed * 100) if total_disbursed > 0 else 0
            
            outstanding_amount = db.session.query(func.sum(Loan.outstanding_balance)).filter(
                Loan.status.in_(['disbursed', 'approved'])
            ).scalar() or Decimal(0)
            
            return {
                'total_disbursed': total_disbursed,
                'total_completed': completed_loans,
                'total_defaulted': defaulted_loans,
                'overdue_loans': overdue_loans,
                'repayment_rate': round(repayment_rate, 2),
                'default_rate': round(default_rate, 2),
                'outstanding_balance': float(outstanding_amount)
            }
        except Exception as e:
            logging.error(f"Error in repayment tracking: {str(e)}")
            return {}
    
    def _get_growth_metrics(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Get growth metrics over time periods"""
        try:
            now = datetime.utcnow()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            quarter_start = now.replace(month=((now.month - 1) // 3) * 3 + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
            year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            query = Loan.query
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            mtd_loans = query.filter(Loan.created_at >= month_start).count()
            qtd_loans = query.filter(Loan.created_at >= quarter_start).count()
            ytd_loans = query.filter(Loan.created_at >= year_start).count()
            
            mtd_amount = db.session.query(func.sum(Loan.principle_amount)).filter(
                Loan.created_at >= month_start
            ).scalar() or Decimal(0)
            
            qtd_amount = db.session.query(func.sum(Loan.principle_amount)).filter(
                Loan.created_at >= quarter_start
            ).scalar() or Decimal(0)
            
            ytd_amount = db.session.query(func.sum(Loan.principle_amount)).filter(
                Loan.created_at >= year_start
            ).scalar() or Decimal(0)
            
            return {
                'mtd_new_loans': mtd_loans,
                'mtd_amount': float(mtd_amount),
                'qtd_new_loans': qtd_loans,
                'qtd_amount': float(qtd_amount),
                'ytd_new_loans': ytd_loans,
                'ytd_amount': float(ytd_amount)
            }
        except Exception as e:
            logging.error(f"Error in growth metrics: {str(e)}")
            return {}
    
    def _get_branch_comparison(self) -> List[Dict[str, Any]]:
        """Compare metrics across all branches"""
        try:
            branches = Branch.query.filter_by(is_active=True).all()
            comparison = []
            
            for branch in branches:
                loans_count = Loan.query.join(Member).filter(
                    Member.branch_id == branch.id
                ).count()
                
                total_amount = db.session.query(func.sum(Loan.principle_amount)).join(Member).filter(
                    Member.branch_id == branch.id
                ).scalar() or Decimal(0)
                
                completed = Loan.query.join(Member).filter(
                    and_(
                        Member.branch_id == branch.id,
                        Loan.status == 'completed'
                    )
                ).count()
                
                comparison.append({
                    'branch_id': branch.id,
                    'branch_name': branch.name,
                    'location': branch.location,
                    'loans_count': loans_count,
                    'total_amount': float(total_amount),
                    'completed_loans': completed,
                    'active_loans': loans_count - completed
                })
            
            return sorted(comparison, key=lambda x: x['total_amount'], reverse=True)
        except Exception as e:
            logging.error(f"Error in branch comparison: {str(e)}")
            return []
    
    def _get_top_products(self, branch_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get top performing products"""
        try:
            products = LoanProduct.query.filter_by(is_active=True).all()
            product_stats = []
            
            for product in products:
                items = LoanProductItem.query.filter_by(product_id=product.id).all()
                
                query = Loan.query.join(LoanProductItem).filter(
                    LoanProductItem.product_id == product.id,
                    Loan.status.in_(['approved', 'disbursed', 'completed'])
                )
                
                if branch_id:
                    query = query.join(Member).filter(Member.branch_id == branch_id)
                
                count = query.count()
                total_sold = sum(item.quantity for item in items)
                
                if count > 0:
                    revenue = Decimal(str(product.selling_price)) * total_sold
                    cost = Decimal(str(product.buying_price)) * total_sold
                    
                    product_stats.append({
                        'product_id': product.id,
                        'product_name': product.name,
                        'buying_price': float(product.buying_price),
                        'selling_price': float(product.selling_price),
                        'loans_count': count,
                        'units_sold': total_sold,
                        'total_revenue': float(revenue),
                        'total_cost': float(cost),
                        'profit': float(revenue - cost),
                        'margin': float((revenue - cost) / revenue * 100) if revenue > 0 else 0
                    })
            
            return sorted(product_stats, key=lambda x: x['profit'], reverse=True)[:10]
        except Exception as e:
            logging.error(f"Error getting top products: {str(e)}")
            return []
    
    def _get_admin_alerts(self, branch_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Generate alerts for admin attention"""
        alerts = []
        
        try:
            query = Loan.query
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            overdue_count = query.filter(
                and_(
                    Loan.status.in_(['approved', 'disbursed']),
                    Loan.due_date < datetime.utcnow()
                )
            ).count()
            
            if overdue_count > 5:
                alerts.append({
                    'severity': 'high',
                    'title': f'{overdue_count} Overdue Loans',
                    'message': 'Several loans are overdue. Immediate collection action required.',
                    'action': 'view_overdue'
                })
            
            low_stock_products = LoanProduct.query.filter(
                LoanProduct.stock_quantity <= LoanProduct.low_stock_threshold,
                LoanProduct.is_active == True
            ).count()
            
            if low_stock_products > 0:
                alerts.append({
                    'severity': 'medium',
                    'title': f'{low_stock_products} Products Low on Stock',
                    'message': 'Reorder inventory to avoid stockouts.',
                    'action': 'view_inventory'
                })
            
            return alerts
        except Exception as e:
            logging.error(f"Error generating admin alerts: {str(e)}")
            return []

    def _get_member_metrics(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Get member related metrics including savings"""
        try:
            member_query = Member.query
            if branch_id:
                member_query = member_query.filter(Member.branch_id == branch_id)
            
            total_members = member_query.count()
            active_members = member_query.filter(Member.status == 'active').count()
            
            savings_query = db.session.query(func.sum(SavingsAccount.balance))
            if branch_id:
                savings_query = savings_query.join(Member).filter(Member.branch_id == branch_id)
            
            total_savings = savings_query.scalar() or Decimal(0)
            
            return {
                'total_members': total_members,
                'active_members': active_members,
                'lifetime_value': float(total_savings) # Used as "Total Savings" in KPI card
            }
        except Exception as e:
            logging.error(f"Error getting member metrics: {str(e)}")
            return {'total_members': 0, 'active_members': 0, 'lifetime_value': 0}

    def _get_risk_metrics(self, branch_id: Optional[int] = None) -> Dict[str, Any]:
        """Get risk related metrics"""
        try:
            query = Loan.query
            if branch_id:
                query = query.join(Member).filter(Member.branch_id == branch_id)
            
            # Loans overdue > 7 days
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            at_risk_loans = query.filter(
                and_(
                    Loan.status.in_(['approved', 'disbursed']),
                    Loan.due_date < seven_days_ago
                )
            ).count()
            
            return {
                'at_risk_loans': at_risk_loans
            }
        except Exception as e:
            logging.error(f"Error getting risk metrics: {str(e)}")
            return {'at_risk_loans': 0}

    def _get_loan_trends(self, branch_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get monthly loan vs repayment trends"""
        try:
            trends = []
            # Last 6 months
            for i in range(5, -1, -1):
                date = datetime.utcnow() - timedelta(days=i*30)
                month_name = date.strftime('%b')
                start_date = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if i == 0:
                    end_date = datetime.utcnow()
                else:
                    next_month = (start_date + timedelta(days=32)).replace(day=1)
                    end_date = next_month
                
                loan_query = db.session.query(func.sum(Loan.principle_amount))
                if branch_id:
                    loan_query = loan_query.join(Member).filter(Member.branch_id == branch_id)
                
                disbursed = loan_query.filter(
                    Loan.disbursement_date >= start_date,
                    Loan.disbursement_date < end_date
                ).scalar() or Decimal(0)
                
                repayment_query = db.session.query(func.sum(Transaction.amount)).filter(
                    Transaction.transaction_type == 'loan_repayment',
                    Transaction.created_at >= start_date,
                    Transaction.created_at < end_date
                )
                if branch_id:
                    repayment_query = repayment_query.join(Member, Transaction.member_id == Member.id).filter(Member.branch_id == branch_id)
                
                repaid = repayment_query.scalar() or Decimal(0)
                
                trends.append({
                    'month': month_name,
                    'disbursed': float(disbursed),
                    'repaid': float(repaid)
                })
            return trends
        except Exception as e:
            logging.error(f"Error getting loan trends: {str(e)}")
            return []

admin_dashboard_service = AdminDashboardService()
