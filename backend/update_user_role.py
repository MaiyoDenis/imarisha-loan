
from app import create_app, db
from app.models import User, Role

app = create_app()

with app.app_context():
    # Find the admin user
    admin_user = User.query.filter_by(username='admin').first()

    if admin_user:
        # Find the it_support role
        it_support_role = Role.query.filter_by(name='it_support').first()

        if not it_support_role:
            # Create the it_support role if it doesn't exist
            it_support_role = Role(name='it_support')
            db.session.add(it_support_role)
            db.session.commit()
            print("Created 'it_support' role.")

        # Assign the it_support role to the admin user
        admin_user.role = it_support_role
        db.session.commit()

        print("Admin user's role has been updated to 'it_support'.")
    else:
        print("Admin user not found.")
