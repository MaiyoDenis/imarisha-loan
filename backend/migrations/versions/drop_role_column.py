"""Drop role column that still exists after migration (consolidated - handled by final_cleanup)

Revision ID: drop_role_column
Revises: fix_role_migration
Create Date: 2025-12-20 20:20:00.000000

"""
from alembic import op


revision = 'drop_role_column'
down_revision = 'fix_role_migration'
branch_labels = None
depends_on = None


def upgrade():
    print("drop_role_column: cleanup handled by final_cleanup_role_column migration")


def downgrade():
    pass
