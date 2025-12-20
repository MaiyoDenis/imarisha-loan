"""Drop role column that still exists after migration

Revision ID: drop_role_column
Revises: fix_role_migration
Create Date: 2025-12-20 20:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'drop_role_column'
down_revision = 'fix_role_migration'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'role' in users_columns:
        print("Dropping 'role' column...")
        try:
            op.drop_column('users', 'role')
            print("Successfully dropped 'role' column")
        except Exception as e:
            print(f"Error dropping role column: {e}")
            conn.rollback()
            raise


def downgrade():
    op.add_column('users', sa.Column('role', sa.Text(), nullable=False, server_default='admin'))
    print("Recreated 'role' column")
