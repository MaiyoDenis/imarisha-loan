import os
import random
from faker import Faker
from app import create_app, db, bcrypt
from app.models import User, Branch, Role, Group, Member, LoanType, ProductCategory
from decimal import Decimal

fake = Faker()

# Create an application context
app = create_app()
app.app_context().push()

def seed_data():
    """Populates the database with initial data."""
    print("Seeding database...")

    # 0. Product Categories
    categories = [
        {'id': 1, 'name': 'Energy', 'description': 'Solar lamps, home systems, etc.'},
        {'id': 2, 'name': 'Electronics', 'description': 'Phones, tablets, etc.'},
        {'id': 3, 'name': 'Agriculture', 'description': 'Irrigation pumps, tools, etc.'}
    ]
    for cat_data in categories:
        existing = ProductCategory.query.get(cat_data['id'])
        if not existing:
            category = ProductCategory(
                id=cat_data['id'],
                name=cat_data['name'],
                description=cat_data['description']
            )
            db.session.add(category)
            print(f"Created category: {cat_data['name']}")
    db.session.commit()

    # 1. Roles
    roles = ['admin', 'branch_manager', 'loan_officer', 'field_officer', 'procurement_officer', 'customer']
    role_objects = {}
    for role_name in roles:
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name)
            db.session.add(role)
            print(f"Created role: {role_name}")
        role_objects[role_name] = role
    db.session.commit()

    # Refresh role objects to ensure we have IDs
    for role_name in roles:
        role_objects[role_name] = Role.query.filter_by(name=role_name).first()

    # 2. Create Loan Types if not exist
    loan_types = [
        {'name': 'Basic Loan', 'interest_rate': 2.5, 'min_amount': 5000, 'max_amount': 50000, 'duration_months': 6, 'charge_fee_percentage': 3},
        {'name': 'Standard Loan', 'interest_rate': 3.0, 'min_amount': 10000, 'max_amount': 100000, 'duration_months': 12, 'charge_fee_percentage': 4},
        {'name': 'Premium Loan', 'interest_rate': 2.0, 'min_amount': 50000, 'max_amount': 500000, 'duration_months': 24, 'charge_fee_percentage': 2},
    ]
    
    for loan_type_data in loan_types:
        existing = LoanType.query.filter_by(name=loan_type_data['name']).first()
        if not existing:
            loan_type = LoanType(
                name=loan_type_data['name'],
                interest_rate=Decimal(str(loan_type_data['interest_rate'])),
                min_amount=Decimal(str(loan_type_data['min_amount'])),
                max_amount=Decimal(str(loan_type_data['max_amount'])),
                duration_months=loan_type_data['duration_months'],
                charge_fee_percentage=Decimal(str(loan_type_data['charge_fee_percentage']))
            )
            db.session.add(loan_type)
            db.session.commit()
            print(f"Created loan type: {loan_type_data['name']}")

    # 3. Branches
    # No branches seeded automatically. User will add them manually.
    created_users = []

    # Ensure Admin exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin_user = User(
            username='admin',
            phone='0700000000',
            password=hashed_password,
            role_id=role_objects['admin'].id,
            first_name='System',
            last_name='Admin',
            is_active=True
        )
        db.session.add(admin_user)
        db.session.commit()
        created_users.append({'role': 'Admin', 'username': 'admin', 'password': 'admin123', 'branch': 'All'})

    # Generate Markdown File
    md_path = os.path.join(os.path.dirname(__file__), 'users.md')
    with open(md_path, 'w') as f:
        f.write("# System Users Credentials\n\n")
        f.write("This file contains the credentials for the seeded users. **Keep this safe!**\n\n")
        f.write("| Role | Branch | Username | Password |\n")
        f.write("|------|--------|----------|----------|\n")
        for user in created_users:
            f.write(f"| {user['role']} | {user['branch']} | {user['username']} | {user['password']} |\n")
    
    print(f"Database seeded successfully. Credentials saved to {md_path}")

if __name__ == '__main__':
    seed_data()
