from app import create_app, db
from app.models import SavingsAccount

app = create_app()
with app.app_context():
    count = SavingsAccount.query.count()
    total = db.session.query(db.func.sum(SavingsAccount.balance)).scalar()
    print(f'Count: {count}')
    print(f'Total: {total}')
