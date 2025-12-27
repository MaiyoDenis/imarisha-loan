from flask import Blueprint, request, jsonify, session
from app.utils.decorators import login_required
from app.services.field_operations_service import FieldOperationsService
from app.models import FieldOfficerVisit, MobileLoanApplication, PhotoDocument
import os

bp = Blueprint('field_operations', __name__, url_prefix='/api/field-operations')

@bp.route('/visits', methods=['POST'])
@login_required
def create_visit():
    user_id = session.get('user_id')
    data = request.get_json()
    
    result = FieldOperationsService.create_visit(
        user_id=user_id,
        member_id=data.get('memberId'),
        purpose=data.get('purpose'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        notes=data.get('notes')
    )
    
    return jsonify(result or {'error': 'Failed to create visit'}), 200 if result else 400

@bp.route('/visits', methods=['GET'])
@login_required
def get_visits():
    user_id = session.get('user_id')
    days = request.args.get('days', 30, type=int)
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    visits = FieldOperationsService.get_officer_visits(user_id, days, limit, offset)
    return jsonify(visits)

@bp.route('/visits/<int:visit_id>', methods=['GET'])
@login_required
def get_visit_detail(visit_id):
    visit = FieldOperationsService.get_visit_details(visit_id)
    return jsonify(visit or {}), 200 if visit else 404

@bp.route('/visits/<int:visit_id>/complete', methods=['PUT'])
@login_required
def complete_visit(visit_id):
    data = request.get_json()
    success = FieldOperationsService.complete_visit(
        visit_id=visit_id,
        notes=data.get('notes'),
        duration_minutes=data.get('duration'),
        feedback_score=data.get('feedback')
    )
    return jsonify({'success': success}), 200 if success else 400

@bp.route('/applications', methods=['POST'])
@login_required
def create_application():
    user_id = session.get('user_id')
    data = request.get_json()
    
    result = FieldOperationsService.create_mobile_application(
        user_id=user_id,
        member_id=data.get('memberId'),
        loan_type_id=data.get('loanTypeId'),
        amount=data.get('amount'),
        items=data.get('items')
    )
    
    return jsonify(result or {'error': 'Failed to create application'}), 200 if result else 400

@bp.route('/applications', methods=['GET'])
@login_required
def get_applications():
    user_id = session.get('user_id')
    status = request.args.get('status', 'all')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    apps = FieldOperationsService.get_officer_applications(user_id, status, limit, offset)
    return jsonify(apps)

@bp.route('/applications/<int:app_id>', methods=['GET'])
@login_required
def get_application_detail(app_id):
    app = MobileLoanApplication.query.get(app_id)
    return jsonify(app.to_dict() if app else {}), 200 if app else 404

@bp.route('/applications/<int:app_id>/step', methods=['PUT'])
@login_required
def update_application_step(app_id):
    data = request.get_json()
    success = FieldOperationsService.update_application_step(
        app_id=app_id,
        step_number=data.get('step'),
        form_data=data.get('formData', {})
    )
    return jsonify({'success': success}), 200 if success else 400

@bp.route('/applications/<int:app_id>/submit', methods=['POST'])
@login_required
def submit_application(app_id):
    success = FieldOperationsService.submit_application(app_id)
    return jsonify({'success': success}), 200 if success else 400

@bp.route('/photos', methods=['POST'])
@login_required
def upload_photo():
    user_id = session.get('user_id')
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    entity_type = request.form.get('entityType')
    entity_id = request.form.get('entityId', type=int)
    description = request.form.get('description')
    gps_lat = request.form.get('gpsLatitude', type=float)
    gps_lng = request.form.get('gpsLongitude', type=float)
    tags = request.form.getlist('tags[]')
    
    if file and entity_type and entity_id:
        filename = f"{user_id}_{entity_type}_{entity_id}_{file.filename}"
        filepath = os.path.join('uploads/photos', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        file.save(filepath)
        
        result = FieldOperationsService.upload_photo(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            photo_url=f'/uploads/photos/{filename}',
            file_size=file.content_length,
            description=description,
            gps_lat=gps_lat,
            gps_lng=gps_lng,
            tags=tags
        )
        
        return jsonify(result or {'error': 'Failed to save photo'}), 200 if result else 400
    
    return jsonify({'error': 'Invalid request'}), 400

@bp.route('/<entity_type>/<int:entity_id>/photos', methods=['GET'])
def get_photos(entity_type, entity_id):
    photos = FieldOperationsService.get_entity_photos(entity_type, entity_id)
    return jsonify(photos)

@bp.route('/sync/queue', methods=['GET'])
@login_required
def get_sync_queue():
    user_id = session.get('user_id')
    status = request.args.get('status', 'pending')
    queue = FieldOperationsService.get_sync_queue(user_id, status)
    return jsonify(queue)

@bp.route('/sync/process', methods=['POST'])
@login_required
def process_sync():
    user_id = session.get('user_id')
    data = request.get_json()
    items = data.get('items', [])
    
    synced_count = 0
    for item in items:
        if FieldOperationsService.sync_queued_item(item.get('id')):
            synced_count += 1
    
    return jsonify({'synced': synced_count, 'failed': len(items) - synced_count})

@bp.route('/sync/conflicts/resolve', methods=['POST'])
@login_required
def resolve_conflict():
    data = request.get_json()
    success = FieldOperationsService.handle_sync_conflict(
        sync_id=data.get('conflictId'),
        resolution=data.get('resolution', 'server')
    )
    return jsonify({'success': success}), 200 if success else 400

@bp.route('/sync/status', methods=['GET'])
@login_required
def get_sync_status():
    user_id = session.get('user_id')
    status = FieldOperationsService.get_sync_status(user_id)
    return jsonify(status)

@bp.route('/performance', methods=['GET'])
@login_required
def get_performance():
    user_id = session.get('user_id')
    period = request.args.get('period', 'month')
    perf = FieldOperationsService.get_officer_performance(user_id, period)
    return jsonify(perf)

@bp.route('/team-performance', methods=['GET'])
@login_required
def get_team_performance():
    data = request.get_json() or {}
    branch_id = data.get('branchId') or request.args.get('branch_id', type=int)
    period = request.args.get('period', 'month')
    
    if not branch_id:
        return jsonify({'error': 'branch_id required'}), 400
    
    team_perf = FieldOperationsService.get_team_performance(branch_id, period)
    return jsonify(team_perf)

@bp.route('/biometric/enroll', methods=['POST'])
@login_required
def enroll_biometric():
    user_id = session.get('user_id')
    data = request.get_json()
    
    result = FieldOperationsService.enroll_biometric(
        user_id=user_id,
        auth_type=data.get('authType'),
        device_id=data.get('deviceId')
    )
    
    return jsonify(result or {'error': 'Failed to enroll'}), 200 if result else 400

@bp.route('/biometric', methods=['GET'])
@login_required
def get_biometrics():
    user_id = session.get('user_id')
    biometrics = FieldOperationsService.get_user_biometrics(user_id)
    return jsonify(biometrics)
