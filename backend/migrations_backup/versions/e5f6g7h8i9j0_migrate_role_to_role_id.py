"""Migrate role column to role_id foreign key

Revision ID: e5f6g7h8i9j0
Revises: d4e5f6g7h8i9
Create Date: 2025-12-20 16:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e5f6g7h8i9j0'
down_revision = 'd4e5f6g7h8i9'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'roles' not in inspector.get_table_names():
        op.create_table('roles',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=50), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('name')
        )
    
    if 'permissions' not in inspector.get_table_names():
        op.create_table('permissions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('name')
        )
    
    if 'role_permissions' not in inspector.get_table_names():
        op.create_table('role_permissions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('role_id', sa.Integer(), nullable=False),
            sa.Column('permission_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ),
            sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    users_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'role_id' not in users_columns:
        op.add_column('users', sa.Column('role_id', sa.Integer(), nullable=True))
    
    try:
        result = conn.execute(sa.text("SELECT DISTINCT role FROM users WHERE role IS NOT NULL"))
        existing_roles = set(row[0] for row in result)
    except:
        existing_roles = set()
    
    default_roles = ['admin', 'loan_officer', 'field_officer', 'member', 'customer', 'branch_manager', 'procurement_officer']
    all_roles = list(existing_roles) + [r for r in default_roles if r not in existing_roles]
    
    try:
        existing_role_records = conn.execute(sa.text("SELECT name FROM roles")).fetchall()
        existing_role_names = {name[0] for name in existing_role_records}
    except:
        existing_role_names = set()
    
    for role_name in all_roles:
        if role_name and role_name not in existing_role_names:
            try:
                conn.execute(sa.text(f"INSERT INTO roles (name) VALUES ('{role_name}')"))
                conn.commit()
            except:
                pass
    
    try:
        result = conn.execute(sa.text("SELECT id, name FROM roles"))
        role_id_map = {name: id for id, name in result}
    except:
        role_id_map = {}
    
    for role_name, role_id in role_id_map.items():
        if role_name:
            try:
                conn.execute(sa.text(f"UPDATE users SET role_id = {role_id} WHERE role = '{role_name}'"))
                conn.commit()
            except:
                pass
    
    if 'role' in users_columns:
        try:
            op.alter_column('users', 'role', existing_type=sa.Text(), nullable=True)
        except:
            pass
        
        try:
            op.execute(sa.text("ALTER TABLE users DROP COLUMN role"))
        except:
            pass
    
    try:
        op.alter_column('users', 'role_id', existing_type=sa.Integer(), nullable=False)
    except:
        pass
    
    try:
        op.create_foreign_key('fk_users_role_id_roles', 'users', 'roles', ['role_id'], ['id'])
    except:
        pass


def downgrade():
    try:
        op.drop_constraint('fk_users_role_id_roles', 'users', type_='foreignkey')
    except:
        pass
    
    try:
        op.add_column('users', sa.Column('role', sa.Text(), nullable=False, server_default='admin'))
    except:
        pass
    
    try:
        conn = op.get_bind()
        result = conn.execute(sa.text("SELECT id, name FROM roles"))
        role_map = {role_id: name for role_id, name in result}
        
        for role_id, role_name in role_map.items():
            try:
                conn.execute(sa.text(f"UPDATE users SET role = '{role_name}' WHERE role_id = {role_id}"))
            except:
                pass
        conn.commit()
    except:
        pass
    
    try:
        op.drop_column('users', 'role_id')
    except:
        pass
    
    try:
        op.drop_table('role_permissions')
    except:
        pass
    
    try:
        op.drop_table('permissions')
    except:
        pass
    
    try:
        op.drop_table('roles')
    except:
        pass
