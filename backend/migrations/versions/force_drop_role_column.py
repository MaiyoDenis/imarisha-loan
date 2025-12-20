"""Forcefully drop role column if it still exists

Revision ID: force_drop_role_column
Revises: drop_role_column
Create Date: 2025-12-20 20:31:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'force_drop_role_column'
down_revision = 'drop_role_column'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'role' in users_columns:
        print("Dropping remaining 'role' column...")
        try:
            op.drop_column('users', 'role')
            print("Dropped role column")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("'role' column already gone, nothing to do")


def downgrade():
    try:
        op.add_column('users', sa.Column('role', sa.Text(), nullable=True))
    except Exception:
        pass
