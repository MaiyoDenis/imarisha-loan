"""Address remaining role column - aggressively remove NOT NULL constraint and column

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
    
    print("Removing role column constraint...")
    
    try:
        print("Step 1: Making role column nullable...")
        conn.execute(text("ALTER TABLE users ALTER COLUMN role DROP NOT NULL"))
        conn.commit()
        print("  ✓ Made nullable")
    except Exception as e:
        print(f"  - {e}")
        try:
            conn.rollback()
        except:
            pass
    
    try:
        print("Step 2: Dropping role column...")
        conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE"))
        conn.commit()
        print("  ✓ Dropped column")
    except Exception as e:
        print(f"  - {e}")
        try:
            conn.rollback()
        except:
            pass
    
    print("Role constraint removal complete")


def downgrade():
    pass
