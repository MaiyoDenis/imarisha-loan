import os
from app import create_app, db, bcrypt
from app.models import Role, User, Permission, RolePermission

app = create_app()
app.app_context().push()

def seed_it_support():
    print("Seeding IT Support role and user...")
    
    # 1. Create 'manage_system_subscriptions' permission
    perm_name = 'manage_system_subscriptions'
    permission = Permission.query.filter_by(name=perm_name).first()
    if not permission:
        permission = Permission(name=perm_name)
        db.session.add(permission)
        db.session.commit()
        print(f"Created permission: {perm_name}")
    
    # 2. Create 'it_support' role
    role_name = 'it_support'
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name)
        db.session.add(role)
        db.session.commit()
        print(f"Created role: {role_name}")
    
    # 3. Assign permission to role
    rp = RolePermission.query.filter_by(role_id=role.id, permission_id=permission.id).first()
    if not rp:
        rp = RolePermission(role_id=role.id, permission_id=permission.id)
        db.session.add(rp)
        db.session.commit()
        print(f"Assigned permission {perm_name} to {role_name}")
        
    # 4. Create IT Support User
    target_username = 'KDMAIYO'
    target_password = '@Dennoh7503'

    # Check for old user to delete or update
    old_user = User.query.filter_by(username='it_support').first()
    if old_user:
        print("Removing old 'it_support' user...")
        db.session.delete(old_user)
        db.session.commit()

    user = User.query.filter_by(username=target_username).first()
    hashed_password = bcrypt.generate_password_hash(target_password).decode('utf-8')
    
    if not user:
        user = User(
            username=target_username,
            phone='0711111111', # Dummy phone
            password=hashed_password,
            role_id=role.id,
            first_name='IT',
            last_name='Support',
            is_active=True
        )
        db.session.add(user)
        db.session.commit()
        print(f"Created user: {target_username}")
    else:
        # Update password if user exists
        user.password = hashed_password
        user.role_id = role.id
        db.session.commit()
        print(f"Updated password for user: {target_username}")

if __name__ == '__main__':
    seed_it_support()
