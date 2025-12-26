from app import create_app, db
from app.models import User, Role

app = create_app()
with app.app_context():
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Role: {u.role.name if u.role else 'N/A'}, Branch ID: {u.branch_id}")
