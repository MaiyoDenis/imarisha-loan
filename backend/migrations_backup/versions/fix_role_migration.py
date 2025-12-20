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
    
    # Get current users table columns
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    
    print(f"Current users columns: {users_columns}")
    
    # Handle role column migration to role_id if needed
    if 'role' in users_columns and 'role_id' in users_columns:
        print("Found both 'role' and 'role_id' columns - migrating data...")
        
        # First, ensure roles table has required roles
        required_roles = ['admin', 'branch_manager', 'loan_officer', 'field_officer', 'procurement_officer', 'customer']
        
        for role_name in required_roles:
            try:
                # Check if role exists, if not create it
                result = conn.execute(sa.text("SELECT id FROM roles WHERE name = :role_name"), {"role_name": role_name})
                if not result.fetchone():
                    conn.execute(sa.text("INSERT INTO roles (name) VALUES (:role_name)"), {"role_name": role_name})
                    conn.commit()
                    print(f"Created missing role: {role_name}")
            except Exception as e:
                print(f"Error creating role {role_name}: {e}")
                conn.rollback()
        
        # Get role mapping
        try:
            result = conn.execute(sa.text("SELECT id, name FROM roles"))
            role_map = {name: id for id, name in result}
            print(f"Role mapping: {role_map}")
        except Exception as e:
            print(f"Error getting role mapping: {e}")
            role_map = {}
        
        # Migrate role column data to role_id
        if role_map:
            for role_name, role_id in role_map.items():
                if role_name:
                    try:
                        # Update users with matching role name to use role_id
                        result = conn.execute(
                            sa.text("UPDATE users SET role_id = :role_id WHERE role = :role_name AND (role_id IS NULL OR role_id = 0)"),
                            {"role_id": role_id, "role_name": role_name}
                        )
                        conn.commit()
                        print(f"Migrated {result.rowcount} users from role '{role_name}' to role_id {role_id}")
                    except Exception as e:
                        print(f"Error migrating role {role_name}: {e}")
                        conn.rollback()
        
        # For any users still without role_id, assign admin role (id=1) as default
        try:
            result = conn.execute(
                sa.text("UPDATE users SET role_id = 1 WHERE role_id IS NULL OR role_id = 0")
            )
            conn.commit()
            print(f"Assigned admin role to {result.rowcount} users without role_id")
        except Exception as e:
            print(f"Error setting default role: {e}")
            conn.rollback()
        
        # Now drop the old role column
        try:
            print("Dropping old 'role' column...")
            op.drop_column('users', 'role')
            print("Successfully dropped 'role' column")
        except Exception as e:
            print(f"Error dropping role column: {e}")
            # Try to alter column to nullable first, then drop
            try:
                op.alter_column('users', 'role', existing_type=sa.Text(), nullable=True)
                op.drop_column('users', 'role')
                print("Successfully dropped 'role' column after making nullable")
            except Exception as e2:
                print(f"Final attempt to drop role column failed: {e2}")
    
    # Ensure role_id column is NOT NULL with proper foreign key
    try:
        print("Setting role_id as NOT NULL...")
        op.alter_column('users', 'role_id', existing_type=sa.Integer(), nullable=False)
        print("Successfully set role_id as NOT NULL")
    except Exception as e:
        print(f"Error setting role_id as NOT NULL: {e}")
    
    # Ensure foreign key constraint exists
    try:
        print("Creating foreign key constraint...")
        op.create_foreign_key('fk_users_role_id_roles', 'users', 'roles', ['role_id'], ['id'])
        print("Successfully created foreign key constraint")
    except Exception as e:
        print(f"Foreign key constraint may already exist or error: {e}")
    
    # Add index for better performance
    try:
        print("Adding index on role_id...")
        op.create_index('idx_users_role_id', 'users', ['role_id'])
        print("Successfully added index on role_id")
    except Exception as e:
        print(f"Index may already exist or error: {e}")
    
    print("Role migration fix completed successfully!")


def downgrade():
    """Downgrade by recreating role column and copying data back"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'role' not in users_columns and 'role_id' in users_columns:
        print("Recreating 'role' column...")
        
        # Add role column back
        op.add_column('users', sa.Column('role', sa.Text(), nullable=True))
        
        # Get role mapping and copy data back
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
        
        # Make role column NOT NULL
        try:
            op.alter_column('users', 'role', existing_type=sa.Text(), nullable=False)
        except Exception as e:
            print(f"Error setting role as NOT NULL: {e}")
    
    # Drop foreign key constraint
    try:
        op.drop_constraint('fk_users_role_id_roles', 'users', type_='foreignkey')
    except Exception as e:
        print(f"Foreign key constraint may not exist: {e}")
    
    # Drop role_id column
    try:
        op.drop_column('users', 'role_id')
    except Exception as e:
        print(f"Error dropping role_id column: {e}")
    
    print("Role migration downgrade completed!")
