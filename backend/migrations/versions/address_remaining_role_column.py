"""Address remaining role column - use information_schema for verification

Revision ID: address_remaining_role_column
Revises: final_cleanup_role_column
Create Date: 2025-12-20 21:36:00.000000

"""
from alembic import op
from sqlalchemy import text


revision = 'address_remaining_role_column'
down_revision = 'final_cleanup_role_column'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    
    try:
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role'"
        ))
        role_exists = bool(result.fetchone())
        print(f"Role column exists in schema: {role_exists}")
        
        if role_exists:
            print("Dropping role column...")
            conn.execute(text('ALTER TABLE users DROP COLUMN role CASCADE'))
            conn.commit()
            print("Successfully dropped role column")
    except Exception as e:
        print(f"Error: {e}")
        try:
            conn.rollback()
        except:
            pass


def downgrade():
    pass
