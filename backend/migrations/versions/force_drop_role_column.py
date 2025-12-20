"""Forcefully drop role column if it still exists (consolidated - handled by final_cleanup)

Revision ID: force_drop_role_column
Revises: drop_role_column
Create Date: 2025-12-20 20:31:00.000000

"""
from alembic import op


revision = 'force_drop_role_column'
down_revision = 'drop_role_column'
branch_labels = None
depends_on = None


def upgrade():
    print("force_drop_role_column: cleanup handled by final_cleanup_role_column migration")


def downgrade():
    pass
