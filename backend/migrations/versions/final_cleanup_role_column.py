"""Final cleanup - consolidate role column cleanup and ensure role_id is properly configured

Revision ID: final_cleanup_role_column
Revises: fix_role_migration
Create Date: 2025-12-20 21:00:00.000000

"""
from alembic import op
from sqlalchemy import text, inspect
import sqlalchemy as sa


revision = 'final_cleanup_role_column'
down_revision = 'fix_role_migration'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = inspect(conn)
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    print(f"Current users columns: {users_columns}")
    
    if 'role' in users_columns:
        print("Dropping 'role' column...")
        try:
            conn.execute(text('ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE'))
            conn.commit()
            print("Successfully dropped 'role' column")
        except Exception as e:
            print(f"Error on first drop attempt: {e}")
            try:
                conn.rollback()
            except:
                pass
    else:
        print("'role' column does not exist, skipping drop")
    
    try:
        op.alter_column('users', 'role_id', existing_type=sa.Integer(), nullable=False)
        print("Ensured role_id is NOT NULL")
    except Exception as e:
        print(f"role_id already NOT NULL or error: {e}")
    
    constraint_exists = False
    try:
        fks = inspector.get_foreign_keys('users')
        for fk in fks:
            if fk.get('name') == 'fk_users_role_id_roles':
                constraint_exists = True
                print("Foreign key constraint already exists")
                break
    except Exception as e:
        print(f"Error checking for foreign key: {e}")
    
    if not constraint_exists:
        try:
            op.create_foreign_key('fk_users_role_id_roles', 'users', 'roles', ['role_id'], ['id'])
            print("Successfully created foreign key constraint")
        except Exception as e:
            print(f"Error creating foreign key: {e}")
    
    index_exists = False
    try:
        indexes = inspector.get_indexes('users')
        for idx in indexes:
            if idx.get('name') == 'idx_users_role_id':
                index_exists = True
                print("Index already exists")
                break
    except Exception as e:
        print(f"Error checking for index: {e}")
    
    if not index_exists:
        try:
            op.create_index('idx_users_role_id', 'users', ['role_id'])
            print("Successfully added index on role_id")
        except Exception as e:
            print(f"Error adding index: {e}")
    
    print("Final cleanup completed successfully!")


def downgrade():
    try:
        op.add_column('users', sa.Column('role', sa.Text(), nullable=True))
        print("Recreated 'role' column")
    except Exception:
        pass
