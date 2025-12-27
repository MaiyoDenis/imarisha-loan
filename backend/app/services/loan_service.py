from decimal import Decimal
from datetime import datetime, timedelta, timezone
import logging
from typing import Dict, Any, Optional, List
from app.models import LoanType, Loan, SavingsAccount, Member, Transaction
from app import db

class LoanService:
    def calculate_interest(self, principle: Decimal, loan_type: LoanType) -> Decimal:
        rate = Decimal(str(loan_type.interest_rate))
        duration = Decimal(str(loan_type.duration_months))
        interest_type = loan_type.interest_type
        
        interest = Decimal(0)
        
        if interest_type == 'flat':
            # Simple Interest: P * R * T
            interest = principle * (rate / 100) * duration
            
        elif interest_type == 'reducing_balance':
            # Amortization formula for EMI
            # EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
            # Total Amount = EMI * N
            # Total Interest = Total Amount - P
            
            r = rate / 100
            n = duration
            
            if r > 0:
                # Using float for power calculation then converting back to Decimal
                # as Decimal power can be tricky with precision
                p_float = float(principle)
                r_float = float(r)
                n_float = float(n)
                
                numerator = p_float * r_float * ((1 + r_float) ** n_float)
                denominator = ((1 + r_float) ** n_float) - 1
                
                emi = numerator / denominator
                total_amount = Decimal(str(emi)) * n
                interest = total_amount - principle
            else:
                interest = Decimal(0)
                
        elif interest_type == 'compound':
            # Compound Interest: A = P(1 + R)^T
            # Assuming monthly compounding since rate is usually monthly
            
            p_float = float(principle)
            r_float = float(rate / 100)
            t_float = float(duration)
            
            amount = p_float * ((1 + r_float) ** t_float)
            interest = Decimal(str(amount)) - principle
            
        return interest.quantize(Decimal('0.01'))

    def calculate_total_amount(self, principle: Decimal, loan_type: LoanType) -> dict:
        interest = self.calculate_interest(principle, loan_type)
        charge_fee = principle * (Decimal(str(loan_type.charge_fee_percentage)) / 100)
        total_amount = principle + interest + charge_fee
        
        return {
            'principle': principle,
            'interest': interest,
            'charge_fee': charge_fee.quantize(Decimal('0.01')),
            'total_amount': total_amount.quantize(Decimal('0.01'))
        }

    def calculate_penalty(self, loan: Loan) -> Decimal:
        """Calculate penalty for overdue loan"""
        if not loan.due_date:
            return Decimal(0)
            
        now = datetime.utcnow()
        if now <= loan.due_date:
            return Decimal(0)
            
        # Check grace period
        grace_period = loan.loan_type.grace_period_days
        due_date_with_grace = loan.due_date + timedelta(days=grace_period)
        
        if now <= due_date_with_grace:
            return Decimal(0)
            
        # Calculate penalty
        # Penalty = Outstanding Balance * Penalty Rate / 100
        penalty_rate = Decimal(str(loan.loan_type.penalty_rate))
        penalty = loan.outstanding_balance * (penalty_rate / 100)
        
        return penalty.quantize(Decimal('0.01'))

    def get_member_loan_limit(self, member: Member) -> Dict[str, Any]:
        """Calculate loan limit based on savings balance (4x rule)"""
        try:
            # If member is not active, loan limit is 0
            if member.status != 'active':
                return {
                    'savings_balance': Decimal(0),
                    'loan_limit': Decimal(0),
                    'available_to_borrow': Decimal(0),
                    'rule': 'Member not active'
                }

            savings = SavingsAccount.query.filter_by(member_id=member.id).first()
            
            if not savings:
                return {
                    'savings_balance': Decimal(0),
                    'loan_limit': Decimal(0),
                    'available_to_borrow': Decimal(0),
                    'rule': '4x savings balance'
                }
            
            savings_balance = Decimal(str(savings.balance))
            loan_limit = savings_balance * Decimal('4')  # 4x rule
            
            # Calculate how much is already borrowed
            active_loans = Loan.query.filter_by(
                member_id=member.id,
                status='disbursed'
            ).all()
            
            total_borrowed = sum(
                Decimal(str(loan.outstanding_balance)) for loan in active_loans
            )
            
            available = loan_limit - total_borrowed
            
            return {
                'savings_balance': float(savings_balance),
                'loan_limit': float(loan_limit),
                'total_borrowed': float(total_borrowed),
                'available_to_borrow': float(max(Decimal(0), available)),
                'rule': '4x savings balance'
            }
            
        except Exception as e:
            logging.error(f"Error calculating loan limit: {str(e)}")
            return {'error': str(e)}

    def match_loan_product(self, member: Member, requested_amount: Decimal) -> Optional[LoanType]:
        """Intelligently match member to suitable loan product"""
        try:
            loan_limit = self.get_member_loan_limit(member)
            
            if 'error' in loan_limit:
                return None
            
            available_to_borrow = Decimal(str(loan_limit.get('available_to_borrow', 0)))
            
            # Find loan products that fit the criteria
            suitable_products = LoanType.query.filter(
                LoanType.minimum_amount <= requested_amount,
                LoanType.maximum_amount >= requested_amount,
                requested_amount <= available_to_borrow
            ).all()
            
            if not suitable_products:
                return None
            
            # Prefer product with lowest interest rate
            best_product = min(suitable_products, key=lambda x: x.interest_rate)
            
            return best_product
            
        except Exception as e:
            logging.error(f"Error matching loan product: {str(e)}")
            return None

    def process_loan_disbursement(self, loan: Loan) -> Dict[str, Any]:
        """Process loan disbursement with dual account system"""
        try:
            member = loan.member
            principle = Decimal(str(loan.approved_amount))
            
            # Create/get loan account
            loan_account = SavingsAccount.query.filter_by(
                member_id=member.id,
                account_type='loan'
            ).first()
            
            if not loan_account:
                loan_account = SavingsAccount(
                    member_id=member.id,
                    account_type='loan',
                    account_number=f"LOAN-{member.member_code}",
                    balance=0
                )
                db.session.add(loan_account)
            
            # Create disbursement transaction to loan account
            disbursement_transaction = Transaction(
                member_id=member.id,
                account_type='loan',
                transaction_type='disbursement',
                amount=float(principle),
                balance_before=float(loan_account.balance),
                balance_after=float(loan_account.balance + principle),
                reference=f"Loan Disbursement - {loan.loan_number}",
                status='confirmed',
                confirmed_at=datetime.utcnow()
            )
            
            loan_account.balance += float(principle)
            
            # Update loan status
            loan.status = 'disbursed'
            loan.disbursed_date = datetime.utcnow()
            
            db.session.add(disbursement_transaction)
            db.session.commit()
            
            # Send notification
            from app.services.notification_service import notification_service, NotificationChannel
            notification_service.send_notification(
                recipient_id=member.user_id,
                template_id="loan_disbursed",
                variables={
                    'loan_number': loan.loan_number,
                    'amount': str(principle),
                    'interest_rate': str(loan.loan_type.interest_rate)
                },
                channel=NotificationChannel.SMS
            )
            
            return {
                'status': 'success',
                'loan_id': loan.id,
                'disbursement_amount': float(principle),
                'transaction_id': disbursement_transaction.transaction_id
            }
            
        except Exception as e:
            logging.error(f"Error processing loan disbursement: {str(e)}")
            db.session.rollback()
            return {'status': 'error', 'message': str(e)}

    def check_grace_period(self, loan: Loan) -> Dict[str, Any]:
        """Check if payment is within grace period (60 minutes from disbursement)"""
        try:
            if loan.status != 'disbursed' or not loan.disbursed_date:
                return {
                    'in_grace_period': False,
                    'reason': 'Loan not disbursed'
                }
            
            grace_period_hours = 1  # 60-minute grace period
            grace_end_time = loan.disbursed_date + timedelta(hours=grace_period_hours)
            current_time = datetime.utcnow()
            
            in_grace = current_time <= grace_end_time
            
            return {
                'in_grace_period': in_grace,
                'grace_period_hours': grace_period_hours,
                'disbursed_at': loan.disbursed_date.isoformat(),
                'grace_ends_at': grace_end_time.isoformat(),
                'time_remaining_minutes': max(0, int((grace_end_time - current_time).total_seconds() / 60))
            }
            
        except Exception as e:
            logging.error(f"Error checking grace period: {str(e)}")
            return {'error': str(e)}

    def automatic_savings_deduction(self, member: Member, loan: Loan) -> Dict[str, Any]:
        """Automatically deduct loan repayment from savings account"""
        try:
            savings = SavingsAccount.query.filter_by(
                member_id=member.id,
                account_type='savings'
            ).first()
            
            if not savings:
                return {
                    'status': 'failed',
                    'message': 'No savings account found'
                }
            
            # Calculate monthly payment
            loan_calc = self.calculate_total_amount(
                Decimal(str(loan.approved_amount)),
                loan.loan_type
            )
            total_amount = Decimal(str(loan_calc['total_amount']))
            num_payments = loan.loan_type.duration_months
            monthly_payment = total_amount / Decimal(str(num_payments))
            
            if savings.balance < monthly_payment:
                return {
                    'status': 'insufficient_balance',
                    'required': float(monthly_payment),
                    'available': savings.balance,
                    'shortfall': float(monthly_payment - Decimal(str(savings.balance)))
                }
            
            # Deduct from savings
            balance_before = savings.balance
            savings.balance -= float(monthly_payment)
            
            # Create transaction record
            transaction = Transaction(
                member_id=member.id,
                account_type='savings',
                transaction_type='loan_repayment',
                amount=float(monthly_payment),
                balance_before=balance_before,
                balance_after=savings.balance,
                reference=f"Loan Repayment - {loan.loan_number}",
                status='confirmed',
                confirmed_at=datetime.utcnow()
            )
            
            db.session.add(transaction)
            loan.outstanding_balance -= float(monthly_payment)
            
            db.session.commit()
            
            return {
                'status': 'success',
                'deducted_amount': float(monthly_payment),
                'balance_before': balance_before,
                'balance_after': savings.balance,
                'loan_outstanding': loan.outstanding_balance
            }
            
        except Exception as e:
            logging.error(f"Error with automatic savings deduction: {str(e)}")
            db.session.rollback()
            return {'status': 'error', 'message': str(e)}

    def auto_repay_from_drawdown(self, member_id: int) -> Dict[str, Any]:
        """Automatically repay loans using funds available in the drawdown account"""
        try:
            from app.models import DrawdownAccount
            drawdown = DrawdownAccount.query.filter_by(member_id=member_id).first()
            
            if not drawdown or drawdown.balance <= 0:
                return {'status': 'no_funds', 'balance': 0}
            
            # Find all loans with outstanding balance, starting with oldest/overdue
            loans = Loan.query.filter(
                Loan.member_id == member_id,
                Loan.status.in_(['disbursed', 'pending', 'approved']),
                Loan.outstanding_balance > 0
            ).order_by(Loan.due_date.asc(), Loan.created_at.asc()).all()
            
            if not loans:
                return {'status': 'no_loans', 'balance': float(drawdown.balance)}
            
            total_repaid = Decimal('0')
            initial_balance = Decimal(str(drawdown.balance))
            current_balance = initial_balance
            
            import uuid
            
            for loan in loans:
                if current_balance <= 0:
                    break
                
                repayment_amount = min(current_balance, Decimal(str(loan.outstanding_balance)))
                
                # Update loan
                loan.outstanding_balance = Decimal(str(loan.outstanding_balance)) - repayment_amount
                if loan.outstanding_balance <= 0:
                    loan.outstanding_balance = Decimal('0')
                    loan.status = 'completed'
                
                # Update drawdown balance
                current_balance -= repayment_amount
                
                # Create transaction record
                transaction = Transaction(
                    transaction_id=str(uuid.uuid4()),
                    member_id=member_id,
                    account_type='drawdown',
                    transaction_type='loan_repayment',
                    amount=repayment_amount,
                    balance_before=Decimal(str(drawdown.balance)),
                    balance_after=current_balance,
                    reference=f"Auto-Repayment - {loan.loan_number}",
                    loan_id=loan.id,
                    status='confirmed',
                    confirmed_at=datetime.utcnow()
                )
                db.session.add(transaction)
                
                # Update actual account balance for next iteration/commit
                drawdown.balance = current_balance
                total_repaid += repayment_amount
            
            db.session.commit()
            
            return {
                'status': 'success',
                'total_repaid': float(total_repaid),
                'initial_balance': float(initial_balance),
                'final_balance': float(current_balance),
                'loans_affected': len(loans)
            }
            
        except Exception as e:
            logging.error(f"Error in auto_repay_from_drawdown: {str(e)}")
            db.session.rollback()
            return {'status': 'error', 'message': str(e)}

    def check_due_loans(self):
        """Check for due loans and send reminders"""
        try:
            from app.services.notification_service import notification_service, NotificationChannel
            
            # Find loans due tomorrow
            tomorrow = datetime.utcnow().date() + timedelta(days=1)
            loans_due_tomorrow = Loan.query.filter(
                db.func.date(Loan.due_date) == tomorrow,
                Loan.status == 'disbursed',
                Loan.outstanding_balance > 0
            ).all()
            
            for loan in loans_due_tomorrow:
                notification_service.send_notification(
                    recipient_id=loan.member.user_id,
                    template_id="loan_due_reminder", # Need to create this template
                    variables={
                        "loan_number": loan.loan_number,
                        "amount": str(loan.outstanding_balance),
                        "due_date": loan.due_date.strftime('%Y-%m-%d')
                    },
                    channel=NotificationChannel.SMS
                )
                
            # Find overdue loans (e.g. 1 day overdue)
            yesterday = datetime.utcnow().date() - timedelta(days=1)
            loans_overdue = Loan.query.filter(
                db.func.date(Loan.due_date) == yesterday,
                Loan.status == 'disbursed',
                Loan.outstanding_balance > 0
            ).all()
            
            for loan in loans_overdue:
                notification_service.send_notification(
                    recipient_id=loan.member.user_id,
                    template_id="loan_overdue_reminder", # Need to create this template
                    variables={
                        "loan_number": loan.loan_number,
                        "amount": str(loan.outstanding_balance),
                        "penalty": str(self.calculate_penalty(loan))
                    },
                    channel=NotificationChannel.SMS
                )
                
            return {
                'due_tomorrow': len(loans_due_tomorrow),
                'overdue': len(loans_overdue)
            }
            
        except Exception as e:
            logging.error(f"Error checking due loans: {str(e)}")
            return {'error': str(e)}

# Global Loan service instance
loan_service = LoanService()
