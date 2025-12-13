from flask import Blueprint, request, jsonify, session
from app.models import User
from app import db, bcrypt

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'firstName': user.first_name,
                'lastName': user.last_name
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    phone = data.get('phone')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    role = data.get('role', 'customer')
    branch_id = data.get('branchId')
    
    if not all([username, password, phone, first_name, last_name]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if User.query.filter_by(phone=phone).first():
        return jsonify({'error': 'Phone number already exists'}), 400
        
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user = User(
        username=username,
        password=hashed_password,
        phone=phone,
        first_name=first_name,
        last_name=last_name,
        role=role,
        branch_id=branch_id,
        is_active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    }), 201

@bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})

@bp.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'firstName': user.first_name,
            'lastName': user.last_name
        }
    })
