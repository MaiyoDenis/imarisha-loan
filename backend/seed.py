import os
import random
from faker import Faker
from app import create_app, db, bcrypt
from app.models import User, Branch, Role, Group, Member, LoanType
from decimal import Decimal

fake = Faker()

# Create an application context
app = create_app()
app.app_context().push()

def seed_data():
    """Populates the database with initial data."""
    print("Seeding database...")

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
    branches_data = ['Nairobi HQ', 'Mombasa Branch', 'Kisumu Branch', 'Nakuru Branch', 'Eldoret Branch']
    created_users = []

    # Ensure Admin exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        hashed_password = bcrypt.generate_password_hash('adminpassword').decode('utf-8')
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
        created_users.append({'role': 'Admin', 'username': 'admin', 'password': 'adminpassword', 'branch': 'All'})

    for branch_name in branches_data:
        branch = Branch.query.filter_by(name=branch_name).first()
        if not branch:
            branch = Branch(name=branch_name, location=fake.address())
            db.session.add(branch)
            db.session.commit()
            print(f"Created branch: {branch_name}")
        
        print(f"Processing {branch.name}...")

        # Helper to create user if not exists
        def create_staff_user(role_key, prefix, role_title):
            username = f"{prefix}_{branch.name.split()[0].lower()}"
            user = User.query.filter_by(username=username).first()
            if not user:
                password = "password123"
                hashed = bcrypt.generate_password_hash(password).decode('utf-8')
                # Generate a unique phone number
                phone = f"07{random.randint(10000000, 99999999)}"
                while User.query.filter_by(phone=phone).first():
                    phone = f"07{random.randint(10000000, 99999999)}"

                user = User(
                    username=username,
                    phone=phone,
                    password=hashed,
                    role_id=role_objects[role_key].id,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    branch_id=branch.id,
                    is_active=True
                )
                db.session.add(user)
                db.session.commit()
                created_users.append({'role': role_title, 'username': username, 'password': password, 'branch': branch.name})
                print(f"Created {role_title}: {username}")
            return user

        # Create Branch Manager
        bm = create_staff_user('branch_manager', 'bm', 'Branch Manager')
        
        # Update branch manager_id if not set
        if not branch.manager_id:
            branch.manager_id = bm.id
            db.session.commit()

        # Create Procurement Officer
        po = create_staff_user('procurement_officer', 'po', 'Procurement Officer')

        # Create Loan Officer (Needed for Groups)
        lo = create_staff_user('loan_officer', 'lo', 'Loan Officer')

        # Create Field Officers (multiple per branch)
        field_officers = []
        for i in range(2):
            username = f"fo_{branch.name.split()[0].lower()}_{i}"
            user = User.query.filter_by(username=username).first()
            if not user:
                password = "password123"
                hashed = bcrypt.generate_password_hash(password).decode('utf-8')
                phone = f"07{random.randint(10000000, 99999999)}"
                while User.query.filter_by(phone=phone).first():
                    phone = f"07{random.randint(10000000, 99999999)}"

                user = User(
                    username=username,
                    phone=phone,
                    password=hashed,
                    role_id=role_objects['field_officer'].id,
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    branch_id=branch.id,
                    is_active=True
                )
                db.session.add(user)
                db.session.commit()
                field_officers.append(user)
                created_users.append({'role': 'Field Officer', 'username': username, 'password': password, 'branch': branch.name})
                print(f"Created Field Officer: {username}")
            else:
                field_officers.append(user)

        # Create Groups
        for i in range(3): # 3 groups per branch
            group_name = f"{branch.name.split()[0]} Group {i+1}"
            group = Group.query.filter_by(name=group_name).first()
            if not group:
                group = Group(
                    name=group_name,
                    branch_id=branch.id,
                    loan_officer_id=lo.id,
                    location=fake.address(),
                    max_members=10,
                    is_active=True
                )
                db.session.add(group)
                db.session.commit()
                print(f"Created group: {group_name}")

            # Add Members to Group
            current_members = Member.query.filter_by(group_id=group.id).count()
            members_to_add = 5 - current_members
            
            for j in range(members_to_add):
                member_username = f"mem_{branch.name.split()[0].lower()}_{i}_{j}"
                user = User.query.filter_by(username=member_username).first()
                if not user:
                    password = "password123"
                    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
                    phone = f"07{random.randint(10000000, 99999999)}"
                    while User.query.filter_by(phone=phone).first():
                        phone = f"07{random.randint(10000000, 99999999)}"

                    user = User(
                        username=member_username,
                        phone=phone,
                        password=hashed,
                        role_id=role_objects['customer'].id,
                        first_name=fake.first_name(),
                        last_name=fake.last_name(),
                        branch_id=branch.id,
                        is_active=True
                    )
                    db.session.add(user)
                    db.session.commit()
                
                member = Member.query.filter_by(user_id=user.id).first()
                if not member:
                    member = Member(
                        user_id=user.id,
                        group_id=group.id,
                        branch_id=branch.id,
                        member_code=f"MEM-{branch.id}-{group.id}-{user.id}",
                        status='active',
                        registration_fee_paid=True,
                        risk_score=random.randint(60, 90)
                    )
                    db.session.add(member)
                    db.session.commit()
                    print(f"Created member: {member_username}")

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
