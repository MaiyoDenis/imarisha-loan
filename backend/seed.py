from app import create_app, db, bcrypt
from app.models import User, Branch, Group, Member, SavingsAccount, DrawdownAccount, ProductCategory, LoanProduct, LoanType
from datetime import datetime

app = create_app()

def seed():
    with app.app_context():
        print("🌱 Seeding database...")
        
        # Clear existing data (optional, be careful in production)
        # db.drop_all()
        # db.create_all()

        # Check if admin exists
        if User.query.filter_by(username="admin").first():
            print("Admin already exists, skipping seed.")
            return

        # Create admin user
        hashed_password = bcrypt.generate_password_hash("admin123").decode('utf-8')
        admin = User(
            username="admin",
            phone="0712000000",
            password=hashed_password,
            role="admin",
            first_name="System",
            last_name="Administrator",
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("✓ Admin user created")

        # Create branches
        main_branch = Branch(
            name="Nairobi Main",
            location="Nairobi CBD",
            manager_id=admin.id,
            is_active=True
        )
        mombasa_branch = Branch(
            name="Mombasa Branch",
            location="Mombasa Town",
            manager_id=admin.id,
            is_active=True
        )
        db.session.add_all([main_branch, mombasa_branch])
        db.session.commit()
        print("✓ Branches created")

        # Create loan officer
        officer_password = bcrypt.generate_password_hash("officer123").decode('utf-8')
        loan_officer = User(
            username="james.mutua",
            phone="0723456789",
            password=officer_password,
            role="loan_officer",
            first_name="James",
            last_name="Mutua",
            branch_id=main_branch.id,
            is_active=True
        )
        db.session.add(loan_officer)
        db.session.commit()
        print("✓ Loan officer created")

        # Create product categories
        energy_cat = ProductCategory(name="Energy", description="Solar products and batteries")
        electronics_cat = ProductCategory(name="Electronics", description="Phones and electronic devices")
        agriculture_cat = ProductCategory(name="Agriculture", description="Farming equipment and supplies")
        
        db.session.add_all([energy_cat, electronics_cat, agriculture_cat])
        db.session.commit()
        print("✓ Product categories created")

        # Create loan products
        products = [
            LoanProduct(
                name="Solar Battery 200Ah",
                category_id=energy_cat.id,
                buying_price=1200,
                selling_price=1500,
                stock_quantity=45,
                low_stock_threshold=10,
                critical_stock_threshold=5,
                is_active=True
            ),
            LoanProduct(
                name="Samsung Galaxy A14",
                category_id=electronics_cat.id,
                buying_price=16000,
                selling_price=18500,
                stock_quantity=12,
                low_stock_threshold=5,
                critical_stock_threshold=2,
                is_active=True
            ),
            LoanProduct(
                name="Solar Panel 150W",
                category_id=energy_cat.id,
                buying_price=6500,
                selling_price=8000,
                stock_quantity=8,
                low_stock_threshold=10,
                critical_stock_threshold=5,
                is_active=True
            ),
            LoanProduct(
                name="Water Pump",
                category_id=agriculture_cat.id,
                buying_price=22000,
                selling_price=25000,
                stock_quantity=20,
                low_stock_threshold=5,
                critical_stock_threshold=2,
                is_active=True
            )
        ]
        db.session.add_all(products)
        db.session.commit()
        print("✓ Loan products created")

        # Create loan types
        loan_types = [
            LoanType(
                name="Quick Loan",
                interest_rate=2.00,
                interest_type="flat",
                charge_fee_percentage=4.00,
                min_amount=2000,
                max_amount=20000,
                duration_months=2,
                is_active=True
            ),
            LoanType(
                name="Business Loan",
                interest_rate=3.50,
                interest_type="flat",
                charge_fee_percentage=4.00,
                min_amount=20000,
                max_amount=100000,
                duration_months=3,
                is_active=True
            ),
            LoanType(
                name="Asset Finance",
                interest_rate=5.00,
                interest_type="reducing",
                charge_fee_percentage=4.00,
                min_amount=50000,
                max_amount=500000,
                duration_months=6,
                is_active=True
            )
        ]
        db.session.add_all(loan_types)
        db.session.commit()
        print("✓ Loan types created")

        # Create groups
        group_a = Group(
            name="Imarisha A",
            branch_id=main_branch.id,
            loan_officer_id=loan_officer.id,
            max_members=8,
            is_active=True
        )
        group_b = Group(
            name="Biashara B",
            branch_id=main_branch.id,
            loan_officer_id=loan_officer.id,
            max_members=8,
            is_active=True
        )
        db.session.add_all([group_a, group_b])
        db.session.commit()
        print("✓ Groups created")

        # Create sample members
        customer_password = bcrypt.generate_password_hash("customer123").decode('utf-8')
        customer_user = User(
            username="sarah.wanjiku",
            phone="0722123456",
            password=customer_password,
            role="customer",
            first_name="Sarah",
            last_name="Wanjiku",
            branch_id=main_branch.id,
            is_active=True
        )
        db.session.add(customer_user)
        db.session.commit()

        member1 = Member(
            user_id=customer_user.id,
            group_id=group_a.id,
            member_code="MB001",
            registration_fee=800,
            registration_fee_paid=True,
            status="active"
        )
        db.session.add(member1)
        db.session.commit()

        # Create savings and drawdown accounts
        savings = SavingsAccount(
            member_id=member1.id,
            account_number=f"SAV-{member1.member_code}",
            balance=45000
        )
        drawdown = DrawdownAccount(
            member_id=member1.id,
            account_number=f"DRW-{member1.member_code}",
            balance=5000
        )
        db.session.add_all([savings, drawdown])
        db.session.commit()

        print("✓ Sample member created")
        print("\n✅ Database seeded successfully!")
        print("\n📝 Login credentials:")
        print("   Username: admin")
        print("   Password: admin123")

if __name__ == "__main__":
    seed()
