from app import create_app, db
from app.models import User, Role

app = create_app()

with app.app_context():
    users = User.query.all()
    print(f"{'Username':<20} {'Role':<20} {'Branch ID':<10}")
    print("-" * 50)
    for user in users:
        role_name = user.role.name if user.role else "No Role"
        print(f"{user.username:<20} {role_name:<20} {user.branch_id}")
