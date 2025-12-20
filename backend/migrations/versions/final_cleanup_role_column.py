"""Final cleanup - drop role column using raw SQL

Revision ID: final_cleanup_role_column
Revises: force_drop_role_column
Create Date: 2025-12-20 20:46:00.000000

"""
from alembic import op


revision = 'final_cleanup_role_column'
down_revision = 'force_drop_role_column'
branch_labels = None
depends_on = None


def upgrade():
    try:
        op.execute('ALTER TABLE users DROP COLUMN role')
        print("Dropped role column using raw SQL")
    except Exception as e:
        if 'does not exist' in str(e):
            print("Column already dropped")
        else:
            raise


def downgrade():
    pass
