from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    first_name = db.Column(db.Text, nullable=False)
    last_name = db.Column(db.Text, nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    communication_preferences = db.Column(db.JSON, default={'sms': True, 'email': True, 'whatsapp': False})
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    branch = db.relationship('Branch', backref='users')
    role = db.relationship('Role', backref='users')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'phone': self.phone,
            'role': self.role.name if self.role else None,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'branchId': self.branch_id,
            'isActive': self.is_active,
            'communicationPreferences': self.communication_preferences,
            'createdAt': self.created_at.isoformat()
        }

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    permissions = db.relationship('RolePermission', back_populates='role', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'permissions': [p.permission.name for p in self.permissions]
        }

class Permission(db.Model):
    __tablename__ = 'permissions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class RolePermission(db.Model):
    __tablename__ = 'role_permissions'
    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    permission_id = db.Column(db.Integer, db.ForeignKey('permissions.id'), nullable=False)

    role = db.relationship('Role', back_populates='permissions')
    permission = db.relationship('Permission')

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
    location = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
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
            'location': self.location,
            'description': self.description,
            'maxMembers': self.max_members,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class Member(db.Model):
    __tablename__ = 'members'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    member_code = db.Column(db.Text, unique=True, nullable=False)
    registration_fee = db.Column(db.Numeric(10, 2), default=800, nullable=False)
    registration_fee_paid = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.Text, default='pending', nullable=False) # pending, active, blocked
    risk_score = db.Column(db.Integer, default=0)
    risk_category = db.Column(db.Text, default='Unknown')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='member_profile')
    group = db.relationship('Group', backref='members')
    branch = db.relationship('Branch', backref='members')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'firstName': self.user.first_name if self.user else None,
            'lastName': self.user.last_name if self.user else None,
            'groupId': self.group_id,
            'branchId': self.branch_id,
            'memberCode': self.member_code,
            'registrationFee': str(self.registration_fee),
            'registrationFeePaid': self.registration_fee_paid,
            'status': self.status,
            'riskScore': self.risk_score,
            'riskCategory': self.risk_category,
            'createdAt': self.created_at.isoformat()
        }

class SavingsAccount(db.Model):
    __tablename__ = 'savings_accounts'
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    account_number = db.Column(db.Text, unique=True, nullable=False)
    balance = db.Column(db.Numeric(12, 2), default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    member = db.relationship('Member', backref=db.backref('savings_account', uselist=False))
 
    def to_dict(self):
        return {
            'id': self.id,
            'memberId': self.member_id,
            'accountNumber': self.account_number,
            'balance': str(self.balance),
            'createdAt': self.created_at.isoformat(),
            'member': self.member.to_dict() if self.member else None
        }

class DrawdownAccount(db.Model):
    __tablename__ = 'drawdown_accounts'
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    account_number = db.Column(db.Text, unique=True, nullable=False)
    balance = db.Column(db.Numeric(12, 2), default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    member = db.relationship('Member', backref=db.backref('drawdown_account', uselist=False))
 
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

class BranchProduct(db.Model):
    __tablename__ = 'branch_products'
    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('loan_products.id'), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0, nullable=False)
    low_stock_threshold = db.Column(db.Integer, default=10, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    branch = db.relationship('Branch', backref='inventory')
    product = db.relationship('LoanProduct', backref='branch_inventory')

    def to_dict(self):
        return {
            'id': self.id,
            'branchId': self.branch_id,
            'productId': self.product_id,
            'stockQuantity': self.stock_quantity,
            'lowStockThreshold': self.low_stock_threshold,
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
    grace_period_days = db.Column(db.Integer, default=0, nullable=False)
    penalty_rate = db.Column(db.Numeric(5, 2), default=0, nullable=False)
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
            'gracePeriodDays': self.grace_period_days,
            'penaltyRate': str(self.penalty_rate),
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
    rejected_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    rejection_reason = db.Column(db.Text)
    rejected_date = db.Column(db.DateTime)
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
            'rejectedBy': self.rejected_by,
            'rejectionReason': self.rejection_reason,
            'rejectedDate': self.rejected_date.isoformat() if self.rejected_date else None,
            'createdAt': self.created_at.isoformat(),
            'loanType': self.loan_type.to_dict() if self.loan_type else None,
            'member': {
                'memberCode': self.member.member_code,
                'name': f"{self.member.user.first_name} {self.member.user.last_name}" if self.member and self.member.user else "Unknown"
            } if self.member else None
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
    status = db.Column(db.Text, default='confirmed', nullable=False) # pending, confirmed, failed
    confirmed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    confirmed_at = db.Column(db.DateTime)
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
            'status': self.status,
            'confirmedBy': self.confirmed_by,
            'confirmedAt': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'createdAt': self.created_at.isoformat(),
            'member': self.member.to_dict() if self.member else None
        }

class Visit(db.Model):
    __tablename__ = 'visits'
    id = db.Column(db.Integer, primary_key=True)
    officer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    notes = db.Column(db.Text)
    photo_url = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    officer = db.relationship('User', backref='visits')
    member = db.relationship('Member', backref='visits')

    def to_dict(self):
        return {
            'id': self.id,
            'officerId': self.officer_id,
            'memberId': self.member_id,
            'visitDate': self.visit_date.isoformat(),
            'locationLat': self.location_lat,
            'locationLng': self.location_lng,
            'notes': self.notes,
            'photoUrl': self.photo_url,
            'createdAt': self.created_at.isoformat()
        }

class GroupVisit(db.Model):
    __tablename__ = 'group_visits'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    field_officer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    visit_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    group = db.relationship('Group', backref='group_visits')
    field_officer = db.relationship('User', backref='group_visits')

    def to_dict(self):
        return {
            'id': self.id,
            'groupId': self.group_id,
            'fieldOfficerId': self.field_officer_id,
            'fieldOfficerName': f"{self.field_officer.first_name} {self.field_officer.last_name}",
            'visitDate': self.visit_date.isoformat(),
            'notes': self.notes,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

class Achievement(db.Model):
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    description = db.Column(db.Text)
    icon_url = db.Column(db.Text)
    points = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'iconUrl': self.icon_url,
            'points': self.points,
            'createdAt': self.created_at.isoformat()
        }

class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=False)
    awarded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='achievements')
    achievement = db.relationship('Achievement')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'achievementId': self.achievement_id,
            'achievement': self.achievement.to_dict() if self.achievement else None,
            'awardedAt': self.awarded_at.isoformat()
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

class Badge(db.Model):
    __tablename__ = 'badges'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)
    description = db.Column(db.Text)
    icon_url = db.Column(db.Text)
    category = db.Column(db.Text, default='milestone', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'iconUrl': self.icon_url,
            'category': self.category,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class UserBadge(db.Model):
    __tablename__ = 'user_badges'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badges.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='badges')
    badge = db.relationship('Badge')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'badgeId': self.badge_id,
            'badge': self.badge.to_dict() if self.badge else None,
            'earnedAt': self.earned_at.isoformat()
        }

class UserPoints(db.Model):
    __tablename__ = 'user_points'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    total_points = db.Column(db.Integer, default=0, nullable=False)
    lifetime_points = db.Column(db.Integer, default=0, nullable=False)
    points_tier = db.Column(db.Text, default='bronze', nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='points_record')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'totalPoints': self.total_points,
            'lifetimePoints': self.lifetime_points,
            'pointsTier': self.points_tier,
            'lastUpdated': self.last_updated.isoformat()
        }

class Challenge(db.Model):
    __tablename__ = 'challenges'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    challenge_type = db.Column(db.Text, nullable=False)
    target_value = db.Column(db.Numeric(12, 2), nullable=False)
    current_value = db.Column(db.Numeric(12, 2), default=0, nullable=False)
    reward_points = db.Column(db.Integer, default=0, nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Text, default='active', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'challengeType': self.challenge_type,
            'targetValue': str(self.target_value),
            'currentValue': str(self.current_value),
            'rewardPoints': self.reward_points,
            'startDate': self.start_date.isoformat(),
            'endDate': self.end_date.isoformat(),
            'status': self.status,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class UserChallenge(db.Model):
    __tablename__ = 'user_challenges'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    progress = db.Column(db.Numeric(12, 2), default=0, nullable=False)
    status = db.Column(db.Text, default='active', nullable=False)
    completed_at = db.Column(db.DateTime)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='challenge_participations')
    challenge = db.relationship('Challenge', backref='user_participations')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'challengeId': self.challenge_id,
            'challenge': self.challenge.to_dict() if self.challenge else None,
            'progress': str(self.progress),
            'status': self.status,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
            'joinedAt': self.joined_at.isoformat()
        }

class Reward(db.Model):
    __tablename__ = 'rewards'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    reward_type = db.Column(db.Text, nullable=False)
    points_required = db.Column(db.Integer, default=0, nullable=False)
    discount_percentage = db.Column(db.Numeric(5, 2), default=0, nullable=False)
    max_redemptions = db.Column(db.Integer)
    redeemed_count = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'rewardType': self.reward_type,
            'pointsRequired': self.points_required,
            'discountPercentage': str(self.discount_percentage),
            'maxRedemptions': self.max_redemptions,
            'redeemedCount': self.redeemed_count,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class UserReward(db.Model):
    __tablename__ = 'user_rewards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reward_id = db.Column(db.Integer, db.ForeignKey('rewards.id'), nullable=False)
    redeemed_at = db.Column(db.DateTime)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.Text, default='earned', nullable=False)

    user = db.relationship('User', backref='earned_rewards')
    reward = db.relationship('Reward')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'rewardId': self.reward_id,
            'reward': self.reward.to_dict() if self.reward else None,
            'redeemedAt': self.redeemed_at.isoformat() if self.redeemed_at else None,
            'earnedAt': self.earned_at.isoformat(),
            'status': self.status
        }

class Leaderboard(db.Model):
    __tablename__ = 'leaderboards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rank = db.Column(db.Integer, nullable=False)
    leaderboard_type = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, default=0, nullable=False)
    period = db.Column(db.Text, default='monthly', nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='leaderboard_entries')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'userName': f"{self.user.first_name} {self.user.last_name}" if self.user else 'Unknown',
            'userBranch': self.user.branch.name if self.user and self.user.branch else 'Unknown',
            'rank': self.rank,
            'leaderboardType': self.leaderboard_type,
            'points': self.points,
            'period': self.period,
            'lastUpdated': self.last_updated.isoformat()
        }

class FieldOfficerVisit(db.Model):
    __tablename__ = 'field_officer_visits'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    latitude = db.Column(db.Numeric(10, 8), nullable=False)
    longitude = db.Column(db.Numeric(11, 8), nullable=False)
    visit_purpose = db.Column(db.Text, nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    duration_minutes = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    photos_count = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='field_visits')
    member = db.relationship('Member', backref='visit_records')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'memberId': self.member_id,
            'latitude': str(self.latitude),
            'longitude': str(self.longitude),
            'visitPurpose': self.visit_purpose,
            'visitDate': self.visit_date.isoformat(),
            'durationMinutes': self.duration_minutes,
            'notes': self.notes,
            'photosCount': self.photos_count,
            'completed': self.completed,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

class MobileLoanApplication(db.Model):
    __tablename__ = 'mobile_loan_applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'), nullable=False)
    loan_type_id = db.Column(db.Integer, db.ForeignKey('loan_types.id'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    application_status = db.Column(db.Text, default='draft', nullable=False)
    current_step = db.Column(db.Integer, default=1, nullable=False)
    form_data = db.Column(db.JSON, default={})
    visited_at = db.Column(db.DateTime)
    submitted_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='mobile_applications')
    member = db.relationship('Member', backref='mobile_applications')
    loan_type = db.relationship('LoanType', backref='mobile_applications')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'memberId': self.member_id,
            'loanTypeId': self.loan_type_id,
            'amount': str(self.amount),
            'applicationStatus': self.application_status,
            'currentStep': self.current_step,
            'formData': self.form_data,
            'visitedAt': self.visited_at.isoformat() if self.visited_at else None,
            'submittedAt': self.submitted_at.isoformat() if self.submitted_at else None,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

class PhotoDocument(db.Model):
    __tablename__ = 'photo_documents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'))
    related_entity_type = db.Column(db.Text, nullable=False)
    related_entity_id = db.Column(db.Integer, nullable=False)
    photo_url = db.Column(db.Text, nullable=False)
    file_size = db.Column(db.Integer)
    description = db.Column(db.Text)
    tags = db.Column(db.JSON, default=[])
    gps_latitude = db.Column(db.Numeric(10, 8))
    gps_longitude = db.Column(db.Numeric(11, 8))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='photos_uploaded')
    member = db.relationship('Member', backref='member_photos')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'memberId': self.member_id,
            'relatedEntityType': self.related_entity_type,
            'relatedEntityId': self.related_entity_id,
            'photoUrl': self.photo_url,
            'fileSize': self.file_size,
            'description': self.description,
            'tags': self.tags,
            'gpsLatitude': str(self.gps_latitude) if self.gps_latitude else None,
            'gpsLongitude': str(self.gps_longitude) if self.gps_longitude else None,
            'uploadedAt': self.uploaded_at.isoformat(),
            'createdAt': self.created_at.isoformat()
        }

class SyncQueue(db.Model):
    __tablename__ = 'sync_queues'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    entity_type = db.Column(db.Text, nullable=False)
    entity_id = db.Column(db.Integer)
    operation = db.Column(db.Text, nullable=False)
    payload = db.Column(db.JSON, default={})
    status = db.Column(db.Text, default='pending', nullable=False)
    error_message = db.Column(db.Text)
    retry_count = db.Column(db.Integer, default=0)
    synced_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='sync_queue_items')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'entityType': self.entity_type,
            'entityId': self.entity_id,
            'operation': self.operation,
            'payload': self.payload,
            'status': self.status,
            'errorMessage': self.error_message,
            'retryCount': self.retry_count,
            'syncedAt': self.synced_at.isoformat() if self.synced_at else None,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }

class FieldOfficerPerformance(db.Model):
    __tablename__ = 'field_officer_performance'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    period = db.Column(db.Text, default='current_month', nullable=False)
    visits_completed = db.Column(db.Integer, default=0)
    applications_created = db.Column(db.Integer, default=0)
    applications_submitted = db.Column(db.Integer, default=0)
    approval_rate = db.Column(db.Numeric(5, 2), default=0)
    photos_captured = db.Column(db.Integer, default=0)
    avg_visit_duration = db.Column(db.Numeric(8, 2), default=0)
    member_feedback_score = db.Column(db.Numeric(3, 2), default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='performance_record')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'period': self.period,
            'visitsCompleted': self.visits_completed,
            'applicationsCreated': self.applications_created,
            'applicationsSubmitted': self.applications_submitted,
            'approvalRate': str(self.approval_rate),
            'photosCaptured': self.photos_captured,
            'avgVisitDuration': str(self.avg_visit_duration),
            'memberFeedbackScore': str(self.member_feedback_score),
            'lastUpdated': self.last_updated.isoformat(),
            'createdAt': self.created_at.isoformat()
        }

class BiometricAuth(db.Model):
    __tablename__ = 'biometric_auths'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    auth_type = db.Column(db.Text, nullable=False)
    biometric_template = db.Column(db.Text)
    device_id = db.Column(db.Text, nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_used = db.Column(db.DateTime)
    enabled = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='biometric_auth')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'authType': self.auth_type,
            'deviceId': self.device_id,
            'enrolledAt': self.enrolled_at.isoformat(),
            'lastUsed': self.last_used.isoformat() if self.last_used else None,
            'enabled': self.enabled,
            'createdAt': self.created_at.isoformat()
        }

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    location = db.Column(db.Text)
    company_name = db.Column(db.Text)
    contact_person = db.Column(db.Text)
    bank_name = db.Column(db.Text)
    bank_account = db.Column(db.Text)
    mpesa_number = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    rating = db.Column(db.Numeric(3, 2), default=0, nullable=False)
    total_supplies = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'location': self.location,
            'companyName': self.company_name,
            'contactPerson': self.contact_person,
            'bankName': self.bank_name,
            'bankAccount': self.bank_account,
            'mpesaNumber': self.mpesa_number,
            'isActive': self.is_active,
            'rating': str(self.rating),
            'totalSupplies': self.total_supplies,
            'createdAt': self.created_at.isoformat()
        }

class SupplierProduct(db.Model):
    __tablename__ = 'supplier_products'
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('loan_products.id'), nullable=False)
    cost_price = db.Column(db.Numeric(10, 2), nullable=False)
    minimum_order = db.Column(db.Integer, default=1, nullable=False)
    delivery_days = db.Column(db.Integer, default=7, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    supplier = db.relationship('Supplier', backref='products')
    product = db.relationship('LoanProduct', backref='suppliers')

    def to_dict(self):
        return {
            'id': self.id,
            'supplierId': self.supplier_id,
            'productId': self.product_id,
            'costPrice': str(self.cost_price),
            'minimumOrder': self.minimum_order,
            'deliveryDays': self.delivery_days,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('loan_products.id'), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    movement_type = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    reference_number = db.Column(db.Text)
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    product = db.relationship('LoanProduct', backref='movements')
    branch = db.relationship('Branch', backref='stock_movements')
    supplier = db.relationship('Supplier', backref='stock_movements')
    processed_by_user = db.relationship('User', backref='stock_movements')

    def to_dict(self):
        return {
            'id': self.id,
            'productId': self.product_id,
            'branchId': self.branch_id,
            'supplierId': self.supplier_id,
            'movementType': self.movement_type,
            'quantity': self.quantity,
            'referenceNumber': self.reference_number,
            'processedBy': self.processed_by,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat()
        }

class SystemSubscription(db.Model):
    __tablename__ = 'system_subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.Text, unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    creator = db.relationship('User', backref='created_subscriptions')

    def to_dict(self):
        return {
            'id': self.id,
            'token': self.token,
            'expiresAt': self.expires_at.isoformat(),
            'createdAt': self.created_at.isoformat(),
            'createdBy': self.created_by
        }

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    read_at = db.Column(db.DateTime)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'senderId': self.sender_id,
            'senderName': f"{self.sender.first_name} {self.sender.last_name}",
            'recipientId': self.recipient_id,
            'recipientName': f"{self.recipient.first_name} {self.recipient.last_name}",
            'content': self.content,
            'isRead': self.is_read,
            'createdAt': self.created_at.isoformat(),
            'readAt': self.read_at.isoformat() if self.read_at else None
        }
