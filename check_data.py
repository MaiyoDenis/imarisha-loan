from app import create_app, db
from app.models import Loan, SavingsAccount, Member, User, Role, Branch
from sqlalchemy import func

app = create_app()
with app.app_context():
    users = User.query.all()
    print("Users:")
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Role: {u.role.name}, Branch ID: {u.branch_id}")
    
    print("\nMember Branch IDs:")
    members = Member.query.all()
    for m in members:
        print(f"Member ID: {m.id}, Branch ID: {m.branch_id}, User: {m.user.username}")
