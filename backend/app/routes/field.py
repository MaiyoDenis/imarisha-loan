from flask import Blueprint, request, jsonify, session
from app.services.field_service import FieldService
from app.utils.decorators import login_required
from datetime import datetime

bp = Blueprint('field', __name__, url_prefix='/api/field')

@bp.route('/visits', methods=['POST'])
@login_required
def log_visit():
    data = request.get_json()
    current_user_id = session.get('user_id')
    
    required = ['memberId', 'locationLat', 'locationLng']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400
        
    visit = FieldService.log_visit(
        officer_id=current_user_id,
        member_id=data['memberId'],
        location_lat=data['locationLat'],
        location_lng=data['locationLng'],
        notes=data.get('notes'),
        photo_url=data.get('photoUrl')
    )
    
    return jsonify(visit.to_dict()), 201

@bp.route('/visits', methods=['GET'])
@login_required
def get_visits():
    current_user_id = session.get('user_id')
    date_str = request.args.get('date')
    
    date = None
    if date_str:
        try:
            date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
        except ValueError:
            pass
            
    visits = FieldService.get_officer_visits(current_user_id, date)
    return jsonify([v.to_dict() for v in visits])
