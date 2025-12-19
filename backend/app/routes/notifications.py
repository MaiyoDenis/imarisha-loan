from flask import Blueprint, request, jsonify
from app.services.notification_service import notification_service, NotificationChannel, NotificationPriority
from app.models import User
from app import db
import json

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@bp.route('/send', methods=['POST'])
def send_notification():
    data = request.get_json()
    
    recipient_id = data.get('recipientId')
    template_id = data.get('templateId')
    variables = data.get('variables', {})
    channel = data.get('channel', 'sms')
    priority = data.get('priority', 'normal')
    
    if not all([recipient_id, template_id]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify recipient exists
    user = User.query.get(recipient_id)
    if not user:
        return jsonify({'error': 'Recipient not found'}), 404
    
    try:
        notification_channel = NotificationChannel[channel.upper()]
        notification_priority = NotificationPriority[priority.upper()]
    except KeyError:
        return jsonify({'error': 'Invalid channel or priority'}), 400
    
    try:
        notification_id = notification_service.send_notification(
            recipient_id=recipient_id,
            template_id=template_id,
            variables=variables,
            channel=notification_channel,
            priority=notification_priority
        )
        
        return jsonify({
            'notification_id': notification_id,
            'status': 'queued',
            'message': 'Notification queued for delivery'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/templates', methods=['GET'])
def get_templates():
    templates = []
    
    for template_id, template in notification_service.templates.items():
        templates.append({
            'template_id': template.template_id,
            'name': template.name,
            'channel': template.channel.value,
            'variables': template.variables,
            'category': template.category,
            'language': template.language
        })
    
    return jsonify({
        'templates': templates,
        'total': len(templates)
    })

@bp.route('/whatsapp/send', methods=['POST'])
def send_whatsapp():
    data = request.get_json()
    
    recipient_id = data.get('recipientId')
    template_id = data.get('templateId')
    variables = data.get('variables', {})
    priority = data.get('priority', 'normal')
    
    if not all([recipient_id, template_id]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify recipient exists
    user = User.query.get(recipient_id)
    if not user:
        return jsonify({'error': 'Recipient not found'}), 404
    
    try:
        notification_priority = NotificationPriority[priority.upper()]
    except KeyError:
        return jsonify({'error': 'Invalid priority'}), 400
    
    try:
        notification_id = notification_service.send_notification(
            recipient_id=recipient_id,
            template_id=template_id,
            variables=variables,
            channel=NotificationChannel.WHATSAPP,
            priority=notification_priority
        )
        
        return jsonify({
            'notification_id': notification_id,
            'status': 'queued',
            'channel': 'whatsapp',
            'message': 'WhatsApp message queued for delivery'
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/whatsapp/callback', methods=['POST'])
def whatsapp_delivery_callback():
    """Handle WhatsApp delivery callbacks from Twilio/Meta"""
    data = request.get_json()
    
    try:
        # This can be extended to handle status callbacks from WhatsApp providers
        return jsonify({
            'success': True,
            'message': 'Callback received'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/preferences/<int:user_id>', methods=['GET'])
def get_notification_preferences(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    prefs = user.communication_preferences or {}
    
    return jsonify({
        'user_id': user_id,
        'preferences': {
            'sms_enabled': prefs.get('sms', True),
            'email_enabled': prefs.get('email', True),
            'whatsapp_enabled': prefs.get('whatsapp', True),
            'push_enabled': prefs.get('push', False),
            'in_app_enabled': prefs.get('in_app', True)
        }
    })

@bp.route('/preferences/<int:user_id>', methods=['PUT'])
def update_notification_preferences(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    prefs = user.communication_preferences or {}
    
    if 'sms_enabled' in data:
        prefs['sms'] = data['sms_enabled']
    if 'email_enabled' in data:
        prefs['email'] = data['email_enabled']
    if 'whatsapp_enabled' in data:
        prefs['whatsapp'] = data['whatsapp_enabled']
    if 'push_enabled' in data:
        prefs['push'] = data['push_enabled']
    if 'in_app_enabled' in data:
        prefs['in_app'] = data['in_app_enabled']
    
    user.communication_preferences = prefs
    db.session.commit()
    
    return jsonify({
        'message': 'Preferences updated successfully',
        'preferences': prefs
    })

@bp.route('/callback/sms', methods=['POST'])
def sms_delivery_callback():
    """Handle SMS delivery callbacks from Africa's Talking"""
    data = request.get_json()
    
    try:
        result = notification_service.handle_sms_delivery_callback(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
def get_notification_stats():
    days = request.args.get('days', 30, type=int)
    
    try:
        stats = notification_service.get_notification_stats(days)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/history/<int:user_id>', methods=['GET'])
def get_user_notification_history(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    try:
        # Get notifications from Redis
        key = f"notifications:user:{user_id}"
        notifications = notification_service.redis_client.lrange(key, offset, offset + limit - 1)
        
        notification_list = []
        for notif_json in notifications:
            notification_list.append(json.loads(notif_json))
        
        return jsonify({
            'user_id': user_id,
            'notifications': notification_list,
            'total': len(notification_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<notification_id>/status', methods=['GET'])
def get_notification_status(notification_id):
    try:
        notification = notification_service._get_notification(notification_id)
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        return jsonify({
            'notification_id': notification_id,
            'status': notification.get('status'),
            'channel': notification.get('channel'),
            'sent_at': notification.get('sent_at'),
            'delivered_at': notification.get('delivered_at'),
            'error_message': notification.get('error_message')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
