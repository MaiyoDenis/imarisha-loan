from flask import Blueprint, request, jsonify, session
from app.models import User, SystemSubscription
from app import db
from app.utils.decorators import role_required, login_required
from datetime import datetime, timedelta
import uuid

bp = Blueprint('subscription', __name__, url_prefix='/api/subscription')

@bp.route('/renew', methods=['POST'])
@role_required(['it_support'])
def renew_subscription():
    data = request.get_json()
    duration_days = data.get('duration_days')
    
    if not duration_days:
        return jsonify({'error': 'duration_days is required'}), 400
        
    try:
        duration_days = int(duration_days)
    except ValueError:
        return jsonify({'error': 'duration_days must be an integer'}), 400
        
    # Get the latest subscription to determine start date
    latest_sub = SystemSubscription.query.order_by(SystemSubscription.expires_at.desc()).first()
    
    start_date = datetime.utcnow()
    if latest_sub and latest_sub.expires_at > start_date:
        start_date = latest_sub.expires_at
        
    expires_at = start_date + timedelta(days=duration_days)
    
    token = str(uuid.uuid4())
    
    subscription = SystemSubscription(
        token=token,
        expires_at=expires_at,
        created_by=session['user_id']
    )
    
    db.session.add(subscription)
    db.session.commit()
    
    return jsonify({
        'message': 'Subscription renewed successfully',
        'subscription': subscription.to_dict()
    }), 201

@bp.route('/status', methods=['GET'])
def check_status():
    # Allow this to be accessed without login? 
    # Or maybe login required but we need to know if system is locked.
    # If locked, only IT support can login.
    # So this endpoint helps frontend decide whether to show "Locked" screen.
    
    latest_sub = SystemSubscription.query.order_by(SystemSubscription.expires_at.desc()).first()
    
    if not latest_sub:
        return jsonify({
            'status': 'expired',
            'expiresAt': None,
            'message': 'No active subscription found'
        })
        
    is_expired = latest_sub.expires_at < datetime.utcnow()
    
    return jsonify({
        'status': 'expired' if is_expired else 'active',
        'expiresAt': latest_sub.expires_at.isoformat(),
        'message': 'System is locked' if is_expired else 'System is active'
    })
