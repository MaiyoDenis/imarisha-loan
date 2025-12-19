import os
from app import create_app, db
from app.models import User, Branch, Role

# Create an application context
app = create_app()
app.app_context().push()

def seed_data():
    """Populates the database with initial data."""
    print("Seeding database...")

    # Create roles if they don't exist
    roles = ['admin', 'branch_manager', 'loan_officer', 'procurement_officer', 'customer']
    for role_name in roles:
        if not Role.query.filter_by(name=role_name).first():
            role = Role(name=role_name)
            db.session.add(role)

    db.session.commit()

    # Create a default admin user if one doesn't exist
    if not User.query.filter_by(username='admin').first():
        admin_role = Role.query.filter_by(name='admin').first()
        admin = User(
            username='admin',
            phone='1234567890',
            password='adminpassword',  # Should be hashed in a real application
            role_id=admin_role.id,
            first_name='Admin',
            last_name='User'
        )
        db.session.add(admin)

    # Create a sample branch if one doesn't exist
    if not Branch.query.filter_by(name='Main Branch').first():
        branch = Branch(
            name='Main Branch',
            location='Head Office'
        )
        db.session.add(branch)

    # Commit the changes
    db.session.commit()
    print("Database seeded successfully.")

if __name__ == '__main__':
    seed_data()
