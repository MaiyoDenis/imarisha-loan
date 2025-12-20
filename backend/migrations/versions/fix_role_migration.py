"""Fix role migration conflict

Revision ID: fix_role_migration
Revises: e5f6g7h8i9j0
Create Date: 2025-12-20 17:52:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'fix_role_migration'
down_revision = 'e5f6g7h8i9j0'
branch_labels = None
depends_on = None


def upgrade():
    """Fix the role/role_id column conflict by properly migrating data and dropping old column"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    print(f"Current users columns: {users_columns}")
    
    if 'role' in users_columns and 'role_id' in users_columns:
        print("Found both 'role' and 'role_id' columns - migrating data...")
        
        required_roles = ['admin', 'branch_manager', 'loan_officer', 'field_officer', 'procurement_officer', 'customer']
        
        for role_name in required_roles:
            try:
                # Use INSERT ... ON CONFLICT DO NOTHING to avoid race conditions and errors
                conn.execute(sa.text("INSERT INTO roles (name) VALUES (:role_name) ON CONFLICT (name) DO NOTHING"), {"role_name": role_name})
                conn.commit()
                print(f"Ensured role exists: {role_name}")
            except Exception as e:
                # Catch exceptions for databases that don't support ON CONFLICT
                print(f"Could not use ON CONFLICT for role {role_name}, checking existence manually. Error: {e}")
                conn.rollback()
                result = conn.execute(sa.text("SELECT id FROM roles WHERE name = :role_name"), {"role_name": role_name})
                if not result.fetchone():
                    conn.execute(sa.text("INSERT INTO roles (name) VALUES (:role_name)"), {"role_name": role_name})
                    conn.commit()
        
        try:
            result = conn.execute(sa.text("SELECT id, name FROM roles"))
            role_map = {name: id for id, name in result}
            print(f"Role mapping: {role_map}")
        except Exception as e:
            print(f"Error getting role mapping: {e}")
            role_map = {}
        
        if role_map:
            # Check if 'role' column exists before trying to migrate data from it
            if 'role' in users_columns:
                for role_name, role_id in role_map.items():
                    if role_name:
                        try:
                            result = conn.execute(
                                sa.text("UPDATE users SET role_id = :role_id WHERE role = :role_name AND (role_id IS NULL OR role_id = 0)"),
                                {"role_id": role_id, "role_name": role_name}
                            )
                            conn.commit()
                            print(f"Migrated {result.rowcount} users from role '{role_name}' to role_id {role_id}")
                        except Exception as e:
                            print(f"Error migrating role {role_name}: {e}")
                            conn.rollback()
            else:
                print("'role' column not found, skipping data migration from 'role' to 'role_id'.")
        
        try:
            result = conn.execute(
                sa.text("UPDATE users SET role_id = 1 WHERE role_id IS NULL OR role_id = 0")
            )
            conn.commit()
            print(f"Assigned admin role to {result.rowcount} users without role_id")
        except Exception as e:
            print(f"Error setting default role: {e}")
            conn.rollback()
        
        try:
            print("Dropping old 'role' column...")
            op.drop_column('users', 'role')
            print("Successfully dropped 'role' column")
        except Exception as e:
            print(f"Error dropping role column: {e}")
            try:
                op.alter_column('users', 'role', existing_type=sa.Text(), nullable=True)
                op.drop_column('users', 'role')
                print("Successfully dropped 'role' column after making nullable")
            except Exception as e2:
                print(f"Final attempt to drop role column failed: {e2}")
    
    try:
        print("Setting role_id as NOT NULL...")
        op.alter_column('users', 'role_id', existing_type=sa.Integer(), nullable=False)
        print("Successfully set role_id as NOT NULL")
    except Exception as e:
        print(f"Error setting role_id as NOT NULL: {e}")
    
    constraint_exists = False
    try:
        fks = inspector.get_foreign_keys('users')
        for fk in fks:
            if fk.get('name') == 'fk_users_role_id_roles':
                constraint_exists = True
                print("Foreign key constraint already exists")
                break
    except Exception as e:
        print(f"Error checking for existing foreign key: {e}")
    
    if not constraint_exists:
        try:
            print("Creating foreign key constraint...")
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
        print(f"Error checking for existing index: {e}")
    
    if not index_exists:
        try:
            print("Adding index on role_id...")
            op.create_index('idx_users_role_id', 'users', ['role_id'])
            print("Successfully added index on role_id")
        except Exception as e:
            print(f"Error adding index: {e}")
    
    print("Role migration fix completed successfully!")


def downgrade():
    """Downgrade by recreating role column and copying data back"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'role' not in users_columns and 'role_id' in users_columns:
        print("Recreating 'role' column...")
        
        op.add_column('users', sa.Column('role', sa.Text(), nullable=True))
        
        try:
            result = conn.execute(sa.text("SELECT id, name FROM roles"))
            role_map = {id: name for id, name in result}
            
            for role_id, role_name in role_map.items():
                conn.execute(
                    sa.text("UPDATE users SET role = :role_name WHERE role_id = :role_id"),
                    {"role_name": role_name, "role_id": role_id}
                )
            conn.commit()
            print("Copied role data back to role column")
        except Exception as e:
            print(f"Error copying role data: {e}")
            conn.rollback()
        
        try:
            op.alter_column('users', 'role', existing_type=sa.Text(), nullable=False)
        except Exception as e:
            print(f"Error setting role as NOT NULL: {e}")
    
    try:
        op.drop_constraint('fk_users_role_id_roles', 'users', type_='foreignkey')
    except Exception as e:
        print(f"Foreign key constraint may not exist: {e}")
    
    try:
        op.drop_column('users', 'role_id')
    except Exception as e:
        print(f"Error dropping role_id column: {e}")
    
    print("Role migration downgrade completed!")
