from app import create_app, db
from app.models import SavingsAccount, Member

app = create_app()
with app.app_context():
    sa = SavingsAccount.query.first()
    if sa:
        m = Member.query.get(sa.member_id)
        print(f'Savings Balance: {sa.balance}')
        print(f'Member ID: {m.id}')
        print(f'Branch ID: {m.branch_id}')
    else:
        print('No savings account found')
