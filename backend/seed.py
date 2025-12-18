from app import create_app, db, bcrypt
from app.models import User, Branch, Group, Member, SavingsAccount, DrawdownAccount, ProductCategory, LoanProduct, LoanType, Loan, LoanProductItem
from datetime import datetime, timedelta
import random

app = create_app()

FIRST_NAMES = [
    "Alice", "Benjamin", "Catherine", "David", "Emily", "Frank", "Grace", "Henry",
    "Iris", "James", "Karen", "Leo", "Mia", "Nathan", "Olivia", "Peter",
    "Quinn", "Rachel", "Samuel", "Tanya", "Urs", "Victoria", "William", "Ximena"
]

LAST_NAMES = [
    "Mwangi", "Kipchoge", "Njoroge", "Kariuki", "Okonkwo", "Kamau", "Wambui", "Mutua",
    "Kinyata", "Macharia", "Kuria", "Ouma", "Nyambura", "Kiplagat", "Moreno", "Kimani"
]

def seed():
    with app.app_context():
        db.create_all()
        print("🌱 Seeding database with comprehensive test data...")
        
        # Check if admin exists
        if User.query.filter_by(username="admin").first():
            print("✅ Database already seeded. Skipping.")
            return

        # ============================================================================
        # 1. CREATE BRANCHES
        # ============================================================================
        print("\n📍 Creating branches...")
        
        nairobi = Branch(name="Nairobi Main", location="Nairobi CBD", is_active=True)
        mombasa = Branch(name="Mombasa Branch", location="Mombasa Town", is_active=True)
        kisumu = Branch(name="Kisumu Branch", location="Kisumu Waterfront", is_active=True)
        nakuru = Branch(name="Nakuru Branch", location="Nakuru Town", is_active=True)
        
        db.session.add_all([nairobi, mombasa, kisumu, nakuru])
        db.session.commit()
        print(f"✓ Created {4} branches")

        # ============================================================================
        # 2. CREATE ALL USERS (Admin, Loan Officers, Field Officers, Procurement Officers)
        # ============================================================================
        print("\n👥 Creating users with all roles...")
        
        admin_password = bcrypt.generate_password_hash("admin123").decode('utf-8')
        admin = User(
            username="admin",
            phone="0712000000",
            password=admin_password,
            role="admin",
            first_name="System",
            last_name="Administrator",
            branch_id=nairobi.id,
            is_active=True
        )
        db.session.add(admin)
        nairobi.manager_id = admin.id
        db.session.commit()
        print("✓ Admin created")

        # Create Loan Officers (2 per branch)
        loan_officers = []
        default_password = bcrypt.generate_password_hash("officer123").decode('utf-8')
        
        officer_names = [
            ("James", "Mutua"), ("Mary", "Kipchoge"), ("Joseph", "Okonkwo"), 
            ("Priscilla", "Nyambura"), ("Daniel", "Kariuki"), ("Faith", "Wambui"),
            ("Samuel", "Kiplagat"), ("Angela", "Moreno")
        ]
        
        branch_list = [nairobi, mombasa, kisumu, nakuru]
        officer_idx = 0
        
        for branch in branch_list:
            for i in range(2):
                first, last = officer_names[officer_idx]
                username = f"{first.lower()}.{last.lower()}"
                officer = User(
                    username=username,
                    phone=f"07{random.randint(10000000, 99999999)}",
                    password=default_password,
                    role="loan_officer",
                    first_name=first,
                    last_name=last,
                    branch_id=branch.id,
                    is_active=True
                )
                db.session.add(officer)
                loan_officers.append(officer)
                officer_idx += 1
        
        db.session.commit()
        print(f"✓ Created {len(loan_officers)} loan officers")

        # Create Field Officers (3-4 per branch)
        field_officers = []
        field_names = [
            ("John", "Kipchoge"), ("Margaret", "Wanjiru"), ("Peter", "Mwangi"),
            ("Rose", "Karanja"), ("David", "Kiplagat"), ("Jane", "Ouma"),
            ("Michael", "Nyambura"), ("Sophie", "Kimani"), ("Robert", "Mutua"),
            ("Elizabeth", "Njoroge"), ("Christopher", "Kinyata"), ("Patricia", "Macharia")
        ]
        
        field_idx = 0
        for branch in branch_list:
            for i in range(3):
                first, last = field_names[field_idx]
                username = f"field.{first.lower()}.{last.lower()}"
                officer = User(
                    username=username,
                    phone=f"07{random.randint(10000000, 99999999)}",
                    password=default_password,
                    role="field_officer",
                    first_name=first,
                    last_name=last,
                    branch_id=branch.id,
                    is_active=True
                )
                db.session.add(officer)
                field_officers.append(officer)
                field_idx += 1
        
        db.session.commit()
        print(f"✓ Created {len(field_officers)} field officers")

        # Create Procurement Officers (1 per branch)
        procurement_officers = []
        procurement_names = [
            ("Thomas", "Kipchoge"), ("Hannah", "Wanjiru"), ("George", "Mwangi"),
            ("Lucy", "Karanja")
        ]
        
        for idx, branch in enumerate(branch_list):
            first, last = procurement_names[idx]
            username = f"procurement.{first.lower()}.{last.lower()}"
            officer = User(
                username=username,
                phone=f"07{random.randint(10000000, 99999999)}",
                password=default_password,
                role="procurement_officer",
                first_name=first,
                last_name=last,
                branch_id=branch.id,
                is_active=True
            )
            db.session.add(officer)
            procurement_officers.append(officer)
        
        db.session.commit()
        print(f"✓ Created {len(procurement_officers)} procurement officers")

        # ============================================================================
        # 3. CREATE PRODUCT CATEGORIES
        # ============================================================================
        print("\n📦 Creating product categories...")
        
        energy_cat = ProductCategory(name="Energy", description="Solar products and batteries")
        electronics_cat = ProductCategory(name="Electronics", description="Phones and electronic devices")
        agriculture_cat = ProductCategory(name="Agriculture", description="Farming equipment and supplies")
        retail_cat = ProductCategory(name="Retail", description="General retail products")
        
        db.session.add_all([energy_cat, electronics_cat, agriculture_cat, retail_cat])
        db.session.commit()
        print("✓ Created product categories")

        # ============================================================================
        # 4. CREATE LOAN PRODUCTS
        # ============================================================================
        print("\n🛍️  Creating loan products...")
        
        products = [
            LoanProduct(name="Solar Battery 200Ah", category_id=energy_cat.id, buying_price=1200, selling_price=1500, stock_quantity=45, low_stock_threshold=10, critical_stock_threshold=5, is_active=True),
            LoanProduct(name="Samsung Galaxy A14", category_id=electronics_cat.id, buying_price=16000, selling_price=18500, stock_quantity=12, low_stock_threshold=5, critical_stock_threshold=2, is_active=True),
            LoanProduct(name="Solar Panel 150W", category_id=energy_cat.id, buying_price=6500, selling_price=8000, stock_quantity=8, low_stock_threshold=10, critical_stock_threshold=5, is_active=True),
            LoanProduct(name="Water Pump", category_id=agriculture_cat.id, buying_price=22000, selling_price=25000, stock_quantity=20, low_stock_threshold=5, critical_stock_threshold=2, is_active=True),
            LoanProduct(name="Maize Seeds (50kg)", category_id=agriculture_cat.id, buying_price=3000, selling_price=3500, stock_quantity=100, low_stock_threshold=20, critical_stock_threshold=10, is_active=True),
            LoanProduct(name="iPhone 12", category_id=electronics_cat.id, buying_price=55000, selling_price=65000, stock_quantity=5, low_stock_threshold=2, critical_stock_threshold=1, is_active=True),
            LoanProduct(name="Solar Inverter 3KVA", category_id=energy_cat.id, buying_price=45000, selling_price=52000, stock_quantity=6, low_stock_threshold=3, critical_stock_threshold=1, is_active=True),
            LoanProduct(name="Sewing Machine", category_id=retail_cat.id, buying_price=8000, selling_price=10000, stock_quantity=15, low_stock_threshold=5, critical_stock_threshold=2, is_active=True),
        ]
        db.session.add_all(products)
        db.session.commit()
        print(f"✓ Created {len(products)} loan products")

        # ============================================================================
        # 5. CREATE LOAN TYPES
        # ============================================================================
        print("\n💰 Creating loan types...")
        
        loan_types = [
            LoanType(name="Quick Loan", interest_rate=2.00, interest_type="flat", charge_fee_percentage=4.00, min_amount=2000, max_amount=20000, duration_months=2, is_active=True),
            LoanType(name="Business Loan", interest_rate=3.50, interest_type="flat", charge_fee_percentage=4.00, min_amount=20000, max_amount=100000, duration_months=3, is_active=True),
            LoanType(name="Asset Finance", interest_rate=5.00, interest_type="reducing", charge_fee_percentage=4.00, min_amount=50000, max_amount=500000, duration_months=6, is_active=True),
            LoanType(name="Group Loan", interest_rate=1.50, interest_type="flat", charge_fee_percentage=3.00, min_amount=10000, max_amount=50000, duration_months=3, is_active=True),
        ]
        db.session.add_all(loan_types)
        db.session.commit()
        print(f"✓ Created {len(loan_types)} loan types")

        # ============================================================================
        # 6. CREATE 4 GROUPS WITH 8 MEMBERS EACH
        # ============================================================================
        print("\n👥 Creating 4 groups with 8 members each...")
        
        groups = [
            Group(name="Nairobi Business Group A", branch_id=nairobi.id, loan_officer_id=loan_officers[0].id, max_members=8, is_active=True),
            Group(name="Nairobi Business Group B", branch_id=nairobi.id, loan_officer_id=loan_officers[1].id, max_members=8, is_active=True),
            Group(name="Mombasa Business Group", branch_id=mombasa.id, loan_officer_id=loan_officers[2].id, max_members=8, is_active=True),
            Group(name="Kisumu Business Group", branch_id=kisumu.id, loan_officer_id=loan_officers[4].id, max_members=8, is_active=True),
        ]
        db.session.add_all(groups)
        db.session.commit()
        print(f"✓ Created {len(groups)} groups")

        # Create members (8 per group = 32 members total)
        print("   Creating members for each group...")
        member_count = 0
        members = []
        
        for group_idx, group in enumerate(groups):
            for member_idx in range(8):
                first_name = random.choice(FIRST_NAMES)
                last_name = random.choice(LAST_NAMES)
                username = f"member.{group_idx}.{member_idx}"
                phone = f"07{random.randint(10000000, 99999999)}"
                
                password_hash = bcrypt.generate_password_hash("customer123").decode('utf-8')
                
                user = User(
                    username=username,
                    phone=phone,
                    password=password_hash,
                    role="customer",
                    first_name=first_name,
                    last_name=last_name,
                    branch_id=group.branch_id,
                    is_active=True
                )
                db.session.add(user)
                db.session.flush()
                
                member = Member(
                    user_id=user.id,
                    group_id=group.id,
                    member_code=f"MB{group_idx:02d}{member_idx:02d}",
                    registration_fee=800,
                    registration_fee_paid=True,
                    status="active"
                )
                db.session.add(member)
                members.append(member)
                member_count += 1
        
        db.session.commit()
        print(f"   ✓ Created {member_count} members (8 per group)")

        # ============================================================================
        # 7. CREATE SAVINGS AND DRAWDOWN ACCOUNTS FOR ALL MEMBERS
        # ============================================================================
        print("💳 Creating savings and drawdown accounts...")
        
        for member in members:
            savings = SavingsAccount(
                member_id=member.id,
                account_number=f"SAV-{member.member_code}",
                balance=random.randint(5000, 50000)
            )
            drawdown = DrawdownAccount(
                member_id=member.id,
                account_number=f"DRW-{member.member_code}",
                balance=random.randint(1000, 10000)
            )
            db.session.add_all([savings, drawdown])
        
        db.session.commit()
        print(f"✓ Created savings and drawdown accounts for {len(members)} members")

        # ============================================================================
        # 8. CREATE LOANS FOR MEMBERS
        # ============================================================================
        print("\n💳 Creating loans for members...")
        
        loan_count = 0
        for idx, member in enumerate(members):
            num_loans = random.randint(1, 3)
            
            for loan_idx in range(num_loans):
                loan_type = random.choice(loan_types)
                product = random.choice(products)
                loan_officer = random.choice(loan_officers)
                
                principle_amount = random.randint(int(loan_type.min_amount), int(loan_type.max_amount))
                interest_amount = float(principle_amount) * float(loan_type.interest_rate) / 100
                charge_fee = float(principle_amount) * float(loan_type.charge_fee_percentage) / 100
                total_amount = float(principle_amount) + interest_amount + charge_fee
                
                approval_date = datetime.now() - timedelta(days=random.randint(1, 60))
                disbursement_date = datetime.now() - timedelta(days=random.randint(1, 45))
                due_date = datetime.now() + timedelta(days=random.randint(30, 180))
                
                loan = Loan(
                    loan_number=f"LN{loan_count + 1:06d}",
                    member_id=member.id,
                    loan_type_id=loan_type.id,
                    principle_amount=principle_amount,
                    interest_amount=interest_amount,
                    charge_fee=charge_fee,
                    total_amount=total_amount,
                    outstanding_balance=total_amount,
                    status=random.choice(['active', 'active', 'active', 'pending', 'completed']),
                    approval_date=approval_date,
                    disbursement_date=disbursement_date,
                    due_date=due_date,
                    approved_by=loan_officer.id,
                    disbursed_by=loan_officer.id,
                    application_date=approval_date - timedelta(days=random.randint(1, 10))
                )
                db.session.add(loan)
                db.session.flush()
                
                quantity = random.randint(1, 5)
                unit_price = product.selling_price
                total_price = float(unit_price) * quantity
                
                loan_product_item = LoanProductItem(
                    loan_id=loan.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price
                )
                db.session.add(loan_product_item)
                loan_count += 1
        
        db.session.commit()
        print(f"✓ Created {loan_count} loans")

        # ============================================================================
        # 9. PRINT SUMMARY
        # ============================================================================
        print("\n" + "="*70)
        print("✅ DATABASE SEEDED SUCCESSFULLY!")
        print("="*70)
        
        print("\n📋 TEST LOGIN CREDENTIALS:")
        print("-" * 70)
        print(f"{'Role':<20} {'Username':<30} {'Password':<20}")
        print("-" * 70)
        print(f"{'Admin':<20} {'admin':<30} {'admin123':<20}")
        print(f"{'Loan Officer':<20} {'james.mutua':<30} {'officer123':<20}")
        print(f"{'Field Officer':<20} {'field.john.kipchoge':<30} {'officer123':<20}")
        print(f"{'Procurement Officer':<20} {'procurement.thomas.kipchoge':<30} {'officer123':<20}")
        print(f"{'Member/Customer':<20} {'member.0.0':<30} {'customer123':<20}")
        print("-" * 70)
        
        print("\n📊 DATA SUMMARY:")
        print("-" * 70)
        print(f"  Branches:              {4}")
        print(f"  Users:                 {1 + len(loan_officers) + len(field_officers) + len(procurement_officers)}")
        print(f"  Loan Officers:         {len(loan_officers)}")
        print(f"  Field Officers:        {len(field_officers)}")
        print(f"  Procurement Officers:  {len(procurement_officers)}")
        print(f"  Groups:                {len(groups)}")
        print(f"  Members:               {len(members)}")
        print(f"  Product Categories:    4")
        print(f"  Loan Products:         {len(products)}")
        print(f"  Loan Types:            {len(loan_types)}")
        print(f"  Loans:                 {loan_count}")
        print("-" * 70)
        print("\n🚀 Application is ready to use!")
        print("   Backend API: http://localhost:5000")
        print("   Frontend UI: http://localhost:5173")

if __name__ == "__main__":
    seed()
