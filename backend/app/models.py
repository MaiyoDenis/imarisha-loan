from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text, nullable=False) # admin, branch_manager, loan_officer, procurement_officer, customer
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text, nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    branch = db.relationship('Branch', backref='users')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'phone': self.phone,
            'role': self.role,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'branchId': self.branch_id,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class Branch(db.Model):
    __tablename__ = 'branches'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    location = db.Column(db.Text, nullable=False)
    manager_id = db.Column(db.Integer) # Could be a FK to users, but schema didn't enforce it strictly
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'managerId': self.manager_id,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    loan_officer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    max_members = db.Column(db.Integer, default=8, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    branch = db.relationship('Branch', backref='groups')
    loan_officer = db.relationship('User', backref='groups')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'branchId': self.branch_id,
            'loanOfficerId': self.loan_officer_id,
            'maxMembers': self.max_members,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class Member(db.Model):
    __tablename__ = 'members'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'))
    member_code = db.Column(db.Text, unique=True, nullable=False)
    registration_fee = db.Column(db.Numeric(10, 2), default=800, nullable=False)
    registration_fee_paid = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.Text, default='pending', nullable=False) # pending, active, blocked
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='member_profile')
    group = db.relationship('Group', backref='members')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'groupId': self.group_id,
            'memberCode': self.member_code,
            'registrationFee': str(self.registration_fee),
            'registrationFeePaid': self.registration_fee_paid,
            'status': self.status,
            'createdAt': self.created_at.isoformat()
        }

class SavingsAccount(db.Model):
    __tablename__ = 'savings_accounts'
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    account_number = db.Column(db.Text, unique=True, nullable=False)
    balance = db.Column(db.Numeric(12, 2), default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    member = db.relationship('Member', backref='savings_account')

    def to_dict(self):
        return {
            'id': self.id,
            'memberId': self.member_id,
            'accountNumber': self.account_number,
            'balance': str(self.balance),
            'createdAt': self.created_at.isoformat()
        }

class DrawdownAccount(db.Model):
    __tablename__ = 'drawdown_accounts'
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    account_number = db.Column(db.Text, unique=True, nullable=False)
    balance = db.Column(db.Numeric(12, 2), default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    member = db.relationship('Member', backref='drawdown_account')

    def to_dict(self):
        return {
            'id': self.id,
            'memberId': self.member_id,
            'accountNumber': self.account_number,
            'balance': str(self.balance),
            'createdAt': self.created_at.isoformat()
        }

class ProductCategory(db.Model):
    __tablename__ = 'product_categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'createdAt': self.created_at.isoformat()
        }

class LoanProduct(db.Model):
    __tablename__ = 'loan_products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('product_categories.id'), nullable=False)
    buying_price = db.Column(db.Numeric(10, 2), nullable=False)
    selling_price = db.Column(db.Numeric(10, 2), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0, nullable=False)
    low_stock_threshold = db.Column(db.Integer, default=10, nullable=False)
    critical_stock_threshold = db.Column(db.Integer, default=5, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    category = db.relationship('ProductCategory', backref='products')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'categoryId': self.category_id,
            'buyingPrice': str(self.buying_price),
            'sellingPrice': str(self.selling_price),
            'stockQuantity': self.stock_quantity,
            'lowStockThreshold': self.low_stock_threshold,
            'criticalStockThreshold': self.critical_stock_threshold,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class LoanType(db.Model):
    __tablename__ = 'loan_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    interest_rate = db.Column(db.Numeric(5, 2), nullable=False)
    interest_type = db.Column(db.Text, default='flat', nullable=False)
    charge_fee_percentage = db.Column(db.Numeric(5, 2), default=4, nullable=False)
    min_amount = db.Column(db.Numeric(10, 2), nullable=False)
    max_amount = db.Column(db.Numeric(10, 2), nullable=False)
    duration_months = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'interestRate': str(self.interest_rate),
            'interestType': self.interest_type,
            'chargeFeePercentage': str(self.charge_fee_percentage),
            'minAmount': str(self.min_amount),
            'maxAmount': str(self.max_amount),
            'durationMonths': self.duration_months,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    loan_number = db.Column(db.Text, unique=True, nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    loan_type_id = db.Column(db.Integer, db.ForeignKey('loan_types.id'), nullable=False)
    principle_amount = db.Column(db.Numeric(12, 2), nullable=False)
    interest_amount = db.Column(db.Numeric(12, 2), nullable=False)
    charge_fee = db.Column(db.Numeric(12, 2), nullable=False)
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)
    outstanding_balance = db.Column(db.Numeric(12, 2), nullable=False)
    status = db.Column(db.Text, default='pending', nullable=False)
    application_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    approval_date = db.Column(db.DateTime)
    disbursement_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    disbursed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    member = db.relationship('Member', backref='loans')
    loan_type = db.relationship('LoanType', backref='loans')

    def to_dict(self):
        return {
            'id': self.id,
            'loanNumber': self.loan_number,
            'memberId': self.member_id,
            'loanTypeId': self.loan_type_id,
            'principleAmount': str(self.principle_amount),
            'interestAmount': str(self.interest_amount),
            'chargeFee': str(self.charge_fee),
            'totalAmount': str(self.total_amount),
            'outstandingBalance': str(self.outstanding_balance),
            'status': self.status,
            'applicationDate': self.application_date.isoformat(),
            'approvalDate': self.approval_date.isoformat() if self.approval_date else None,
            'disbursementDate': self.disbursement_date.isoformat() if self.disbursement_date else None,
            'dueDate': self.due_date.isoformat() if self.due_date else None,
            'approvedBy': self.approved_by,
            'disbursedBy': self.disbursed_by,
            'createdAt': self.created_at.isoformat()
        }

class LoanProductItem(db.Model):
    __tablename__ = 'loan_product_items'
    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('loan_products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    loan = db.relationship('Loan', backref='items')
    product = db.relationship('LoanProduct')

    def to_dict(self):
        return {
            'id': self.id,
            'loanId': self.loan_id,
            'productId': self.product_id,
            'quantity': self.quantity,
            'unitPrice': str(self.unit_price),
            'totalPrice': str(self.total_price),
            'createdAt': self.created_at.isoformat()
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Text, unique=True, nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    account_type = db.Column(db.Text, nullable=False) # savings, drawdown
    transaction_type = db.Column(db.Text, nullable=False) # deposit, withdrawal, loan_disbursement, loan_repayment, transfer, registration_fee
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    balance_before = db.Column(db.Numeric(12, 2), nullable=False)
    balance_after = db.Column(db.Numeric(12, 2), nullable=False)
    reference = db.Column(db.Text)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'))
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    mpesa_code = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    member = db.relationship('Member', backref='transactions')
    loan = db.relationship('Loan', backref='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'transactionId': self.transaction_id,
            'memberId': self.member_id,
            'accountType': self.account_type,
            'transactionType': self.transaction_type,
            'amount': str(self.amount),
            'balanceBefore': str(self.balance_before),
            'balanceAfter': str(self.balance_after),
            'reference': self.reference,
            'loanId': self.loan_id,
            'processedBy': self.processed_by,
            'mpesaCode': self.mpesa_code,
            'createdAt': self.created_at.isoformat()
        }

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.Text, nullable=False)
    entity_type = db.Column(db.Text, nullable=False)
    entity_id = db.Column(db.Integer)
    description = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='activity_logs')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'action': self.action,
            'entityType': self.entity_type,
            'entityId': self.entity_id,
            'description': self.description,
            'ipAddress': self.ip_address,
            'createdAt': self.created_at.isoformat()
        }
