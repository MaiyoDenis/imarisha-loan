from app.models import (
    FieldOfficerVisit, MobileLoanApplication, PhotoDocument, SyncQueue,
    FieldOfficerPerformance, BiometricAuth, User, Member, LoanType, Loan, Role
)
from app import db
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

class FieldOperationsService:
    CACHE_TIMEOUT = 600

    @staticmethod
    def create_visit(user_id, member_id, purpose, latitude, longitude, notes=None):
        try:
            visit = FieldOfficerVisit(
                user_id=user_id,
                member_id=member_id,
                visit_purpose=purpose,
                latitude=latitude,
                longitude=longitude,
                notes=notes
            )
            db.session.add(visit)
            db.session.commit()
            
            FieldOperationsService._queue_sync('visit', visit.id, 'create', visit.to_dict())
            FieldOperationsService._invalidate_cache(f"visits:{user_id}")
            return visit.to_dict()
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating visit: {str(e)}")
            return None

    @staticmethod
    def get_officer_visits(user_id, days=30, limit=50, offset=0):
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            visits = FieldOfficerVisit.query.filter_by(user_id=user_id).filter(
                FieldOfficerVisit.visit_date >= start_date
            ).order_by(desc(FieldOfficerVisit.visit_date)).limit(limit).offset(offset).all()
            
            result = []
            for visit in visits:
                d = visit.to_dict()
                # Adapt for Schedule.jsx expectations
                d['status'] = 'completed' if visit.completed else 'pending'
                d['type'] = visit.visit_purpose or 'visit'
                d['date'] = visit.visit_date.isoformat()
                d['time'] = visit.visit_date.strftime('%I:%M %p')
                
                if visit.member:
                    d['memberName'] = f"{visit.member.user.first_name} {visit.member.user.last_name}"
                    if visit.member.group:
                        d['groupName'] = visit.member.group.name
                        d['location'] = visit.member.group.location or 'N/A'
                    else:
                        d['groupName'] = d['memberName']
                        d['location'] = 'N/A'
                    d['contactPerson'] = d['memberName']
                    d['phone'] = visit.member.user.phone
                else:
                    d['groupName'] = 'Unknown'
                    d['location'] = 'N/A'
                    d['contactPerson'] = 'N/A'
                    d['phone'] = 'N/A'
                
                result.append(d)
            
            # Also include GroupVisit
            from app.models import GroupVisit
            group_visits = GroupVisit.query.filter_by(field_officer_id=user_id).filter(
                GroupVisit.visit_date >= start_date.date()
            ).order_by(desc(GroupVisit.visit_date)).all()
            
            for gv in group_visits:
                d = gv.to_dict()
                # Adapt for Schedule.jsx expectations
                d['status'] = 'pending' # GroupVisit doesn't have a completed field in current model
                d['type'] = 'group-visit'
                d['groupName'] = gv.group.name if gv.group else 'Unknown'
                d['date'] = gv.visit_date.isoformat()
                d['time'] = '10:00 AM' # GroupVisit doesn't have time in current model
                d['location'] = gv.group.location if gv.group else 'N/A'
                d['contactPerson'] = 'Group Leader'
                d['phone'] = 'N/A'
                result.append(d)

            return sorted(result, key=lambda x: x['date'], reverse=True)
        except Exception as e:
            logger.error(f"Error getting visits: {str(e)}")
            return []

    @staticmethod
    def get_visit_details(visit_id):
        try:
            visit = FieldOfficerVisit.query.get(visit_id)
            if not visit:
                return None
            
            visit_dict = visit.to_dict()
            photos = PhotoDocument.query.filter_by(
                related_entity_type='visit',
                related_entity_id=visit_id
            ).all()
            visit_dict['photos'] = [p.to_dict() for p in photos]
            
            return visit_dict
        except Exception as e:
            logger.error(f"Error getting visit details: {str(e)}")
            return None

    @staticmethod
    def complete_visit(visit_id, notes, duration_minutes, feedback_score=None):
        try:
            visit = FieldOfficerVisit.query.get(visit_id)
            if not visit:
                return False
            
            visit.completed = True
            visit.notes = notes
            visit.duration_minutes = duration_minutes
            visit.updated_at = datetime.utcnow()
            
            db.session.commit()
            FieldOperationsService._queue_sync('visit', visit_id, 'update', visit.to_dict())
            FieldOperationsService._invalidate_cache(f"visits:{visit.user_id}")
            
            FieldOperationsService._update_performance(visit.user_id)
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error completing visit: {str(e)}")
            return False

    @staticmethod
    def create_mobile_application(user_id, member_id, loan_type_id, amount=None, items=None):
        try:
            # If items provided, calculate amount
            if items:
                from app.models import LoanProduct
                amount = 0
                for item in items:
                    product = LoanProduct.query.get(item.get('productId'))
                    if product:
                        amount += float(product.selling_price) * int(item.get('quantity', 1))
            
            app = MobileLoanApplication(
                user_id=user_id,
                member_id=member_id,
                loan_type_id=loan_type_id,
                amount=amount,
                application_status='draft',
                current_step=1
            )
            if items:
                app.form_data = {'items': items}
                
            db.session.add(app)
            db.session.commit()
            
            FieldOperationsService._queue_sync('application', app.id, 'create', app.to_dict())
            FieldOperationsService._invalidate_cache(f"applications:{user_id}")
            return app.to_dict()
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating application: {str(e)}")
            return None

    @staticmethod
    def update_application_step(app_id, step_number, form_data):
        try:
            app = MobileLoanApplication.query.get(app_id)
            if not app:
                return False
            
            app.current_step = step_number
            if not app.form_data:
                app.form_data = {}
            app.form_data.update(form_data)
            app.updated_at = datetime.utcnow()
            
            db.session.commit()
            FieldOperationsService._queue_sync('application', app_id, 'update', app.to_dict())
            FieldOperationsService._invalidate_cache(f"applications:{app.user_id}")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating application step: {str(e)}")
            return False

    @staticmethod
    def submit_application(app_id):
        try:
            app = MobileLoanApplication.query.get(app_id)
            if not app or app.current_step < 5:
                return False
            
            app.application_status = 'submitted'
            app.submitted_at = datetime.utcnow()
            app.updated_at = datetime.utcnow()
            
            db.session.commit()
            FieldOperationsService._queue_sync('application', app_id, 'update', app.to_dict())
            FieldOperationsService._invalidate_cache(f"applications:{app.user_id}")
            FieldOperationsService._update_performance(app.user_id)
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error submitting application: {str(e)}")
            return False

    @staticmethod
    def get_officer_applications(user_id, status='all', limit=50, offset=0):
        try:
            query = MobileLoanApplication.query.filter_by(user_id=user_id)
            if status != 'all':
                query = query.filter_by(application_status=status)
            
            apps = query.order_by(desc(MobileLoanApplication.created_at)).limit(limit).offset(offset).all()
            return [app.to_dict() for app in apps]
        except Exception as e:
            logger.error(f"Error getting applications: {str(e)}")
            return []

    @staticmethod
    def upload_photo(user_id, entity_type, entity_id, photo_url, file_size, description=None, gps_lat=None, gps_lng=None, tags=None):
        try:
            photo = PhotoDocument(
                user_id=user_id,
                related_entity_type=entity_type,
                related_entity_id=entity_id,
                photo_url=photo_url,
                file_size=file_size,
                description=description,
                gps_latitude=gps_lat,
                gps_longitude=gps_lng,
                tags=tags or []
            )
            db.session.add(photo)
            db.session.commit()
            
            if entity_type == 'application':
                app = MobileLoanApplication.query.get(entity_id)
                if app:
                    app.member_id = app.member_id
                    db.session.commit()
            
            FieldOperationsService._queue_sync('photo', photo.id, 'create', photo.to_dict())
            return photo.to_dict()
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error uploading photo: {str(e)}")
            return None

    @staticmethod
    def get_entity_photos(entity_type, entity_id):
        try:
            photos = PhotoDocument.query.filter_by(
                related_entity_type=entity_type,
                related_entity_id=entity_id
            ).order_by(desc(PhotoDocument.uploaded_at)).all()
            return [p.to_dict() for p in photos]
        except Exception as e:
            logger.error(f"Error getting photos: {str(e)}")
            return []

    @staticmethod
    def get_sync_queue(user_id, status='pending'):
        try:
            queue = SyncQueue.query.filter_by(user_id=user_id, status=status).order_by(
                SyncQueue.created_at
            ).all()
            return [item.to_dict() for item in queue]
        except Exception as e:
            logger.error(f"Error getting sync queue: {str(e)}")
            return []

    @staticmethod
    def sync_queued_item(sync_id, response_data=None):
        try:
            item = SyncQueue.query.get(sync_id)
            if not item:
                return False
            
            item.status = 'synced'
            item.synced_at = datetime.utcnow()
            db.session.commit()
            
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error syncing item: {str(e)}")
            return False

    @staticmethod
    def handle_sync_conflict(sync_id, resolution='server'):
        try:
            item = SyncQueue.query.get(sync_id)
            if not item:
                return False
            
            if resolution == 'server':
                item.status = 'synced'
                item.synced_at = datetime.utcnow()
            elif resolution == 'local':
                item.status = 'pending'
                item.retry_count = 0
            
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error resolving conflict: {str(e)}")
            return False

    @staticmethod
    def get_sync_status(user_id):
        try:
            pending_count = SyncQueue.query.filter_by(user_id=user_id, status='pending').count()
            failed_count = SyncQueue.query.filter_by(user_id=user_id, status='failed').count()
            last_sync = SyncQueue.query.filter_by(user_id=user_id, status='synced').order_by(
                desc(SyncQueue.synced_at)
            ).first()
            
            return {
                'pendingItems': pending_count,
                'failedItems': failed_count,
                'lastSync': last_sync.synced_at.isoformat() if last_sync else None,
                'queueSize': pending_count + failed_count
            }
        except Exception as e:
            logger.error(f"Error getting sync status: {str(e)}")
            return {}

    @staticmethod
    def get_officer_performance(user_id, period='month'):
        try:
            cache_key = f"performance:{user_id}:{period}"
            cached = None
            
            if cached:
                return json.loads(cached)
            
            perf = FieldOfficerPerformance.query.filter_by(user_id=user_id).first()
            if not perf:
                perf = FieldOfficerPerformance(user_id=user_id)
                db.session.add(perf)
                db.session.commit()
            
            result = perf.to_dict()
            if False:
                redis_client.setex(cache_key, FieldOperationsService.CACHE_TIMEOUT, json.dumps(result))
            
            return result
        except Exception as e:
            logger.error(f"Error getting performance: {str(e)}")
            return {}

    @staticmethod
    def get_team_performance(branch_id, period='month'):
        try:
            from app.models import User, Branch
            
            officers = User.query.join(User.branch).join(Role).filter(
                User.branch_id == branch_id,
                Role.name == 'field_officer'
            ).all()
            
            team_data = []
            for officer in officers:
                perf = FieldOfficerPerformance.query.filter_by(user_id=officer.id).first()
                if perf:
                    team_data.append({
                        'userId': officer.id,
                        'userName': f"{officer.first_name} {officer.last_name}",
                        'performance': perf.to_dict()
                    })
            
            return team_data
        except Exception as e:
            logger.error(f"Error getting team performance: {str(e)}")
            return []

    @staticmethod
    def enroll_biometric(user_id, auth_type, device_id):
        try:
            existing = BiometricAuth.query.filter_by(user_id=user_id, auth_type=auth_type).first()
            if existing:
                existing.enabled = True
                existing.device_id = device_id
                db.session.commit()
                return existing.to_dict()
            
            bio_auth = BiometricAuth(
                user_id=user_id,
                auth_type=auth_type,
                device_id=device_id
            )
            db.session.add(bio_auth)
            db.session.commit()
            
            return bio_auth.to_dict()
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error enrolling biometric: {str(e)}")
            return None

    @staticmethod
    def get_user_biometrics(user_id):
        try:
            biometrics = BiometricAuth.query.filter_by(user_id=user_id, enabled=True).all()
            return [b.to_dict() for b in biometrics]
        except Exception as e:
            logger.error(f"Error getting biometrics: {str(e)}")
            return []

    @staticmethod
    def _queue_sync(entity_type, entity_id, operation, payload):
        try:
            from flask import g
            user_id = g.get('user_id')
            if not user_id:
                return
            
            sync_item = SyncQueue(
                user_id=user_id,
                entity_type=entity_type,
                entity_id=entity_id,
                operation=operation,
                payload=payload,
                status='pending'
            )
            db.session.add(sync_item)
            db.session.commit()
        except Exception as e:
            logger.error(f"Error queueing sync: {str(e)}")

    @staticmethod
    def _invalidate_cache(key_pattern):
        try:
            if False:
                redis_client.delete(key_pattern)
        except Exception as e:
            logger.error(f"Error invalidating cache: {str(e)}")

    @staticmethod
    def _update_performance(user_id):
        try:
            perf = FieldOfficerPerformance.query.filter_by(user_id=user_id).first()
            if not perf:
                perf = FieldOfficerPerformance(user_id=user_id)
                db.session.add(perf)
            
            perf.visits_completed = FieldOfficerVisit.query.filter_by(
                user_id=user_id,
                completed=True
            ).count()
            
            perf.applications_created = MobileLoanApplication.query.filter_by(
                user_id=user_id
            ).count()
            
            perf.applications_submitted = MobileLoanApplication.query.filter_by(
                user_id=user_id,
                application_status='submitted'
            ).count()
            
            perf.photos_captured = PhotoDocument.query.filter_by(user_id=user_id).count()
            perf.last_updated = datetime.utcnow()
            
            db.session.commit()
            FieldOperationsService._invalidate_cache(f"performance:{user_id}:month")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating performance: {str(e)}")
            return False
