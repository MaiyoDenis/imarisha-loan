import pandas as pd
from app import db
from app.models import Loan, Transaction, Member
from io import StringIO
from datetime import datetime

class ReportService:
    @staticmethod
    def generate_loan_portfolio_report(branch_id=None):
        """
        Generate a CSV report of the entire loan portfolio
        """
        query = Loan.query
        if branch_id:
            query = query.join(Member).filter(Member.branch_id == branch_id)
            
        loans = query.all()
        data = []
        for loan in loans:
            member_name = "Unknown"
            if loan.member and loan.member.user:
                member_name = f"{loan.member.user.first_name} {loan.member.user.last_name}"
                
            data.append({
                'Loan Number': loan.loan_number,
                'Member': member_name,
                'Principal Amount': float(loan.principle_amount),
                'Interest Amount': float(loan.interest_amount),
                'Total Amount': float(loan.total_amount),
                'Outstanding Balance': float(loan.outstanding_balance),
                'Status': loan.status,
                'Application Date': loan.application_date,
                'Disbursement Date': loan.disbursement_date,
                'Due Date': loan.due_date
            })
        
        if not data:
            return ""
            
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()

    @staticmethod
    def generate_transaction_report(start_date, end_date, branch_id=None):
        """
        Generate a CSV report of transactions within a date range
        """
        query = Transaction.query.filter(
            Transaction.created_at.between(start_date, end_date)
        )
        
        if branch_id:
            query = query.join(Member).filter(Member.branch_id == branch_id)
            
        transactions = query.order_by(Transaction.created_at.desc()).all()
        
        data = []
        for txn in transactions:
            member_name = "Unknown"
            if txn.member and txn.member.user:
                member_name = f"{txn.member.user.first_name} {txn.member.user.last_name}"
                
            data.append({
                'Transaction ID': txn.transaction_id,
                'Member': member_name,
                'Type': txn.transaction_type,
                'Account Type': txn.account_type,
                'Amount': float(txn.amount),
                'Balance Before': float(txn.balance_before),
                'Balance After': float(txn.balance_after),
                'Reference': txn.reference,
                'M-Pesa Code': txn.mpesa_code,
                'Status': txn.status,
                'Date': txn.created_at
            })
            
        if not data:
            return ""
            
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()

    @staticmethod
    def generate_arrears_report(branch_id=None):
        """
        Generate a CSV report of all loans in arrears
        """
        now = datetime.utcnow()
        query = Loan.query.filter(
            Loan.status == 'disbursed',
            Loan.due_date < now
        )
        
        if branch_id:
            query = query.join(Member).filter(Member.branch_id == branch_id)
            
        overdue_loans = query.all()
        
        data = []
        for loan in overdue_loans:
            member_name = "Unknown"
            phone = "Unknown"
            if loan.member and loan.member.user:
                member_name = f"{loan.member.user.first_name} {loan.member.user.last_name}"
                phone = loan.member.user.phone
                
            days_overdue = (now - loan.due_date).days
            
            data.append({
                'Loan Number': loan.loan_number,
                'Member': member_name,
                'Phone': phone,
                'Outstanding Balance': float(loan.outstanding_balance),
                'Due Date': loan.due_date,
                'Days Overdue': days_overdue,
                'Risk Category': loan.member.risk_category if loan.member else 'Unknown'
            })
            
        if not data:
            return ""
            
        df = pd.DataFrame(data)
        output = StringIO()
        df.to_csv(output, index=False)
        return output.getvalue()
