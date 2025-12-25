
"""
Notification Service for Multi-Channel Communications
SMS, Email, WhatsApp, Push Notifications, and WebSocket
"""
import json
import logging
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import redis
from flask import current_app, request
from jinja2 import Template
from flask_mail import Message

from app import db
from app.models import Notification as NotificationModel

class NotificationChannel(Enum):
    """Available notification channels"""
    SMS = "sms"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    WEBSOCKET = "websocket"
    IN_APP = "in_app"

class NotificationPriority(Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class NotificationStatus(Enum):
    """Notification delivery status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"

@dataclass
class NotificationTemplate:
    """Notification template structure"""
    template_id: str
    name: str
    channel: NotificationChannel
    subject: Optional[str]
    body_template: str
    variables: List[str]
    language: str = "en"
    category: str = "general"

@dataclass
class Notification:
    """Notification data structure"""
    recipient_id: int
    channel: NotificationChannel
    template_id: str
    subject: Optional[str]
    message: str
    data: Dict[str, Any]
    priority: NotificationPriority
    status: NotificationStatus
    scheduled_at: Optional[str]
    sent_at: Optional[str]
    delivered_at: Optional[str]
    read_at: Optional[str]
    retry_count: int = 0
    max_retries: int = 3
    error_message: Optional[str] = None

class NotificationService:
    def __init__(self, app=None):
        self.redis_client = None
        self.mail = None
        self.app = None
        self.templates = {}
        self.channel_config = {}
        
        if app:
            self.init_app(app)
    

    def init_app(self, app):
        """Initialize notification service with Flask app"""
        self.app = app
        
        # Initialize Redis client with graceful failure handling
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 3),  # Different DB for notifications
                decode_responses=True
            )
            # Test connection
            self.redis_client.ping()
            logging.info("Notification Service: Redis connection established")
        except Exception as e:
            logging.warning(f"Notification Service: Redis not available - {str(e)}")
            self.redis_client = None
        
        self.mail = app.extensions.get('mail')
        
        # Initialize templates
        self._initialize_templates()
        
        # Initialize channel configurations
        self._initialize_channel_config()
        
        logging.info("Notification Service initialized successfully")
    
    def _initialize_templates(self):
        """Initialize notification templates"""
        templates = [
            NotificationTemplate(
                template_id="loan_approval",
                name="Loan Approval Notification",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Congratulations! Your loan application {{loan_number}} has been approved. Amount: KES {{amount}}. Due date: {{due_date}}",
                variables=["loan_number", "amount", "due_date"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="payment_confirmation",
                name="Payment Confirmation",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Payment confirmed! KES {{amount}} received from {{phone_number}}. New balance: KES {{balance}}",
                variables=["amount", "phone_number", "balance"],
                language="en",
                category="payment"
            ),
            NotificationTemplate(
                template_id="mfa_verification",
                name="MFA Verification Code",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Your verification code is: {{code}}. Valid for 5 minutes. Do not share this code with anyone.",
                variables=["code"],
                language="en",
                category="security"
            ),
            NotificationTemplate(
                template_id="loan_due_reminder",
                name="Loan Due Reminder",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Reminder: Your loan {{loan_number}} of KES {{amount}} is due on {{due_date}}. Please pay to avoid penalties.",
                variables=["loan_number", "amount", "due_date"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="loan_overdue_reminder",
                name="Loan Overdue Reminder",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Urgent: Your loan {{loan_number}} is overdue. Outstanding: KES {{amount}}. Penalty: KES {{penalty}}. Pay immediately.",
                variables=["loan_number", "amount", "penalty"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="loan_disbursed",
                name="Loan Disbursement Confirmation",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Your loan {{loan_number}} of KES {{amount}} has been disbursed. Interest rate: {{interest_rate}}%. Repayment begins next month.",
                variables=["loan_number", "amount", "interest_rate"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="savings_deposit",
                name="Savings Deposit Confirmation",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Deposit successful! KES {{amount}} added to your savings account. New balance: KES {{balance}}. Thank you!",
                variables=["amount", "balance"],
                language="en",
                category="savings"
            ),
            NotificationTemplate(
                template_id="savings_withdrawal",
                name="Savings Withdrawal Confirmation",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Withdrawal confirmed! KES {{amount}} withdrawn from your savings. Remaining balance: KES {{balance}}.",
                variables=["amount", "balance"],
                language="en",
                category="savings"
            ),
            NotificationTemplate(
                template_id="welcome",
                name="Welcome Message",
                channel=NotificationChannel.SMS,
                subject=None,
                body_template="Welcome to Imarisha Loans, {{name}}! Start saving and borrowing today. Visit our app for more.",
                variables=["name"],
                language="en",
                category="welcome"
            ),
            NotificationTemplate(
                template_id="loan_approval_whatsapp",
                name="Loan Approval Notification (WhatsApp)",
                channel=NotificationChannel.WHATSAPP,
                subject=None,
                body_template="🎉 *Congratulations!* Your loan application *{{loan_number}}* has been approved!\n\n💰 *Amount:* KES {{amount}}\n📅 *Due Date:* {{due_date}}\n🏦 *Status:* Approved\n\nClick the link below to view details or accept the loan.\n{{app_link}}",
                variables=["loan_number", "amount", "due_date", "app_link"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="payment_confirmation_whatsapp",
                name="Payment Confirmation (WhatsApp)",
                channel=NotificationChannel.WHATSAPP,
                subject=None,
                body_template="✅ *Payment Confirmed!*\n\n💵 *Amount:* KES {{amount}}\n📱 *From:* {{phone_number}}\n💳 *New Balance:* KES {{balance}}\n⏰ *Date:* {{date}}\n\nThank you for your payment!",
                variables=["amount", "phone_number", "balance", "date"],
                language="en",
                category="payment"
            ),
            NotificationTemplate(
                template_id="loan_due_reminder_whatsapp",
                name="Loan Due Reminder (WhatsApp)",
                channel=NotificationChannel.WHATSAPP,
                subject=None,
                body_template="⏰ *Payment Reminder*\n\nYour loan *{{loan_number}}* is due soon!\n\n💰 *Amount Due:* KES {{amount}}\n📅 *Due Date:* {{due_date}}\n\nPay on time to avoid penalties.\n{{payment_link}}",
                variables=["loan_number", "amount", "due_date", "payment_link"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="loan_overdue_reminder_whatsapp",
                name="Loan Overdue Alert (WhatsApp)",
                channel=NotificationChannel.WHATSAPP,
                subject=None,
                body_template="🚨 *URGENT: Payment Overdue*\n\nYour loan *{{loan_number}}* is overdue!\n\n💰 *Outstanding:* KES {{amount}}\n⚠️ *Penalty:* KES {{penalty}}\n\n*Please pay immediately to avoid further penalties.*\n{{payment_link}}",
                variables=["loan_number", "amount", "penalty", "payment_link"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="customer_support_whatsapp",
                name="Customer Support Message (WhatsApp)",
                channel=NotificationChannel.WHATSAPP,
                subject=None,
                body_template="👋 *Hello {{name}}!*\n\nWe're here to help. {{message}}\n\nReply to this message or click the button below.\n{{support_link}}",
                variables=["name", "message", "support_link"],
                language="en",
                category="support"
            ),
            NotificationTemplate(
                template_id="promotional_offer_whatsapp",
                name="Promotional Offer (WhatsApp)",
                channel=NotificationChannel.WHATSAPP,
                subject=None,
                body_template="🎁 *Special Offer for You!*\n\n{{offer_title}}\n\n📋 Details:\n{{offer_description}}\n\n⏰ *Valid Until:* {{expiry_date}}\n\n👉 {{offer_link}}",
                variables=["offer_title", "offer_description", "expiry_date", "offer_link"],
                language="en",
                category="marketing"
            ),
            NotificationTemplate(
                template_id="loan_created",
                name="New Loan Application",
                channel=NotificationChannel.IN_APP,
                subject="New Loan Application Received",
                body_template="A new loan application {{loan_number}} for {{amount}} has been created by {{field_officer}}.",
                variables=["loan_number", "amount", "field_officer"],
                language="en",
                category="loan"
            ),
            NotificationTemplate(
                template_id="meeting_reminder",
                name="Meeting Reminder",
                channel=NotificationChannel.IN_APP,
                subject="Upcoming Meeting Reminder",
                body_template="Reminder: You have a meeting with {{group_name}} at {{time}} in {{location}}.",
                variables=["group_name", "time", "location"],
                language="en",
                category="schedule"
            ),
            NotificationTemplate(
                template_id="new_message",
                name="New Message Notification",
                channel=NotificationChannel.IN_APP,
                subject="You have a new message",
                body_template="You have received a new message from {{sender_name}}.",
                variables=["sender_name"],
                language="en",
                category="message"
            )
        ]
        
        for template in templates:
            self.templates[template.template_id] = template
        
        logging.info(f"Initialized {len(templates)} notification templates")
    
    def _initialize_channel_config(self):
        """Initialize channel configurations"""
        self.channel_config = {
            "sms": {
                "provider": self.app.config.get('SMS_PROVIDER', 'africastalking'),
                "api_key": self.app.config.get('SMS_API_KEY', ''),
                "username": self.app.config.get('SMS_USERNAME', ''),
                "sender_id": self.app.config.get('SMS_SENDER_ID', 'Imarisha'),
                "enabled": self.app.config.get('SMS_ENABLED', True),
                "rate_limit": 100  # SMS per hour
            },
            "email": {
                "provider": self.app.config.get('EMAIL_PROVIDER', 'smtp'),
                "smtp_host": self.app.config.get('SMTP_HOST', 'smtp.gmail.com'),
                "smtp_port": self.app.config.get('SMTP_PORT', 587),
                "username": self.app.config.get('EMAIL_USERNAME', ''),
                "password": self.app.config.get('EMAIL_PASSWORD', ''),
                "sender": self.app.config.get('EMAIL_SENDER', 'noreply@imarisha.com'),
                "enabled": self.app.config.get('EMAIL_ENABLED', True)
            },
            "whatsapp": {
                "provider": self.app.config.get('WHATSAPP_PROVIDER', 'twilio'),
                "api_key": self.app.config.get('WHATSAPP_API_KEY', ''),
                "account_sid": self.app.config.get('WHATSAPP_ACCOUNT_SID', ''),
                "auth_token": self.app.config.get('WHATSAPP_AUTH_TOKEN', ''),
                "from_number": self.app.config.get('WHATSAPP_FROM_NUMBER', ''),
                "business_phone_id": self.app.config.get('WHATSAPP_BUSINESS_PHONE_ID', ''),
                "access_token": self.app.config.get('WHATSAPP_ACCESS_TOKEN', ''),
                "enabled": self.app.config.get('WHATSAPP_ENABLED', True),
                "rate_limit": 1000  # WhatsApp messages per hour
            }
        }
    
    def send_notification(
        self,
        recipient_id: int,
        template_id: str,
        variables: Dict[str, Any],
        channel: NotificationChannel,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        scheduled_at: Optional[str] = None,
        data: Dict[str, Any] = None
    ) -> int:
        """Send a notification"""
        try:
            template = self.templates.get(template_id)
            if not template:
                raise ValueError(f"Template {template_id} not found")
            
            rendered_message = self._render_template(template, variables)
            
            notification = Notification(
                recipient_id=recipient_id,
                channel=channel,
                template_id=template_id,
                subject=template.subject,
                message=rendered_message,
                data=data or {},
                priority=priority,
                status=NotificationStatus.PENDING,
                scheduled_at=scheduled_at,
                sent_at=None,
                delivered_at=None,
                read_at=None,
            )
            
            notification_id = self._store_notification(notification)
            
            if not scheduled_at:
                self._process_notification(notification_id)
            
            logging.info(f"Notification queued: {notification_id}")
            return notification_id
            
        except Exception as e:
            logging.error(f"Error sending notification: {str(e)}")
            raise
    
    def _render_template(self, template: NotificationTemplate, variables: Dict[str, Any]) -> str:
        """Render notification template with variables"""
        try:
            template_obj = Template(template.body_template)
            return template_obj.render(**variables)
        except Exception as e:
            logging.error(f"Error rendering template {template.template_id}: {str(e)}")
            return template.body_template
    

    def _store_notification(self, notification: Notification) -> int:
        """Store notification in the database"""
        try:
            new_notification = NotificationModel(
                recipient_id=notification.recipient_id,
                message=notification.message,
                channel=notification.channel.value,
                template_id=notification.template_id,
                status=notification.status.value,
            )
            db.session.add(new_notification)
            db.session.commit()
            return new_notification.id
        except Exception as e:
            logging.error(f"Error storing notification in database: {str(e)}")
            db.session.rollback()
            raise
    
    def _process_notification(self, notification_id: int):
        """Process and send notification"""
        try:
            notification = self._get_notification(notification_id)
            if not notification:
                logging.warning(f"Notification {notification_id} not found")
                return
            
            notification.status = NotificationStatus.SENT.value
            self._update_notification(notification)
            
            channel = NotificationChannel(notification.channel)
            notification_data = notification.to_dict()
            
            if channel == NotificationChannel.SMS:
                success = self._send_sms(notification_data)
            elif channel == NotificationChannel.EMAIL:
                success = self._send_email(notification_data)
            elif channel == NotificationChannel.WHATSAPP:
                success = self._send_whatsapp(notification_data)
            elif channel == NotificationChannel.IN_APP:
                success = True
            elif channel == NotificationChannel.WEBSOCKET:
                success = self._send_websocket(notification_data)
            else:
                success = False
            
            if success:
                notification.status = NotificationStatus.DELIVERED.value
                self._update_notification(notification)
                logging.info(f"Notification {notification_id} delivered successfully")
            else:
                notification.status = NotificationStatus.FAILED.value
                self._update_notification(notification)
                
        except Exception as e:
            logging.error(f"Error processing notification {notification_id}: {str(e)}")
    
    def _send_sms(self, notification_data: Dict[str, Any]) -> bool:
        """Send SMS notification"""
        try:
            config = self.channel_config['sms']
            if not config['enabled']:
                return False
            
            # Check user preferences
            user_id = notification_data['recipient_id']
            if not self._check_preference(user_id, 'sms'):
                logging.info(f"SMS disabled for user {user_id}")
                return False
            
            # Get recipient phone number
            phone_number = self._get_user_phone(user_id)
            if not phone_number:
                logging.error(f"No phone number found for user {user_id}")
                return False
            
            # Prepare SMS data
            sms_data = {
                "username": config['username'],
                "to": phone_number,
                "message": notification_data['message'],
                "from": config['sender_id']
            }
            
            # Send SMS based on provider
            if config['provider'] == 'africastalking':
                return self._send_sms_africastalking(sms_data)
            else:
                logging.error(f"Unsupported SMS provider: {config['provider']}")
                return False
                
        except Exception as e:
            logging.error(f"Error sending SMS: {str(e)}")
            return False
    
    def _send_sms_africastalking(self, sms_data: Dict[str, Any]) -> bool:
        """Send SMS via Africa's Talking"""
        try:
            url = "https://api.africastalking.com/version1/messaging"
            headers = {
                "apiKey": self.channel_config['sms']['api_key'],
                "Content-Type": "application/x-www-form-urlencoded"
            }
            payload = {
                "username": sms_data['username'],
                "to": sms_data['to'],
                "message": sms_data['message'],
                "from": sms_data['from']
            }
            
            response = requests.post(url, data=payload, headers=headers, timeout=30)
            
            if response.status_code == 201:
                logging.info(f"SMS sent successfully to {sms_data['to']}")
                return True
            else:
                logging.error(f"SMS failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logging.error(f"Error sending SMS via Africa's Talking: {str(e)}")
            return False
    
    def _send_email(self, notification_data: Dict[str, Any]) -> bool:
        """Send email notification"""
        try:
            config = self.channel_config['email']
            if not config['enabled']:
                return False
            
            # Check user preferences
            user_id = notification_data['recipient_id']
            if not self._check_preference(user_id, 'email'):
                logging.info(f"Email disabled for user {user_id}")
                return False
            
            # Get recipient email
            email = self._get_user_email(user_id)
            if not email:
                logging.error(f"No email found for user {user_id}")
                return False
            
            # Create email message
            msg = Message(
                subject=notification_data['subject'] or 'Notification',
                recipients=[email],
                body=notification_data['message'],
                sender=config['sender']
            )
            
            # Send email
            self.mail.send(msg)
            
            logging.info(f"Email sent successfully to {email}")
            return True
            
        except Exception as e:
            logging.error(f"Error sending email: {str(e)}")
            return False
    
    def _send_whatsapp(self, notification_data: Dict[str, Any]) -> bool:
        """Send WhatsApp notification"""
        try:
            config = self.channel_config['whatsapp']
            if not config['enabled']:
                return False
            
            # Check user preferences
            user_id = notification_data['recipient_id']
            if not self._check_preference(user_id, 'whatsapp'):
                logging.info(f"WhatsApp disabled for user {user_id}")
                return False
            
            # Get recipient phone number
            phone_number = self._get_user_phone(user_id)
            if not phone_number:
                logging.error(f"No phone number found for user {user_id}")
                return False
            
            # Ensure phone number is in international format
            if not phone_number.startswith('+'):
                phone_number = f"+{phone_number}"
            
            # Send WhatsApp based on provider
            if config['provider'] == 'twilio':
                return self._send_whatsapp_twilio(phone_number, notification_data)
            elif config['provider'] == 'meta':
                return self._send_whatsapp_meta(phone_number, notification_data)
            else:
                logging.error(f"Unsupported WhatsApp provider: {config['provider']}")
                return False
                
        except Exception as e:
            logging.error(f"Error sending WhatsApp: {str(e)}")
            return False
    
    def _send_whatsapp_twilio(self, phone_number: str, notification_data: Dict[str, Any]) -> bool:
        """Send WhatsApp via Twilio"""
        try:
            config = self.channel_config['whatsapp']
            
            # Twilio WhatsApp API endpoint
            url = f"https://api.twilio.com/2010-04-01/Accounts/{config['account_sid']}/Messages.json"
            
            # Prepare WhatsApp data
            payload = {
                "From": f"whatsapp:{config['from_number']}",
                "To": f"whatsapp:{phone_number}",
                "Body": notification_data['message']
            }
            
            # Send WhatsApp via Twilio
            response = requests.post(
                url,
                data=payload,
                auth=(config['account_sid'], config['auth_token']),
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                logging.info(f"WhatsApp sent successfully via Twilio to {phone_number}")
                return True
            else:
                logging.error(f"WhatsApp failed via Twilio: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logging.error(f"Error sending WhatsApp via Twilio: {str(e)}")
            return False
    
    def _send_whatsapp_meta(self, phone_number: str, notification_data: Dict[str, Any]) -> bool:
        """Send WhatsApp via Meta (Facebook Business API)"""
        try:
            config = self.channel_config['whatsapp']
            
            # Meta WhatsApp Business API endpoint
            url = f"https://graph.instagram.com/v18.0/{config['business_phone_id']}/messages"
            
            # Ensure phone number is in correct format (country code + number without +)
            if phone_number.startswith('+'):
                phone_number = phone_number[1:]
            
            # Prepare WhatsApp data for Meta API
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {
                    "preview_url": True,
                    "body": notification_data['message']
                }
            }
            
            headers = {
                "Authorization": f"Bearer {config['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Send WhatsApp via Meta
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code in [200, 201]:
                logging.info(f"WhatsApp sent successfully via Meta to {phone_number}")
                return True
            else:
                logging.error(f"WhatsApp failed via Meta: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logging.error(f"Error sending WhatsApp via Meta: {str(e)}")
            return False
    
    def _send_websocket(self, notification_data: Dict[str, Any]) -> bool:
        """Send notification via WebSocket"""
        try:
            # If socketio is initialized, emit the message
            # For now, we'll just return True as it's also stored in Redis for polling
            if hasattr(self.app, 'socketio'):
                self.app.socketio.emit(
                    'notification', 
                    notification_data, 
                    room=f"user_{notification_data['recipient_id']}"
                )
            return True
        except Exception as e:
            logging.error(f"Error sending WebSocket notification: {str(e)}")
            return False

    def mark_as_read(self, user_id: int, notification_id: str) -> bool:
        """Mark a notification as read"""
        try:
            if not self.redis_client:
                return False
                
            # Update main notification object
            key = f"notification:{notification_id}"
            notif_json = self.redis_client.get(key)
            if notif_json:
                notif_data = json.loads(notif_json)
                notif_data['status'] = NotificationStatus.READ.value
                notif_data['read_at'] = datetime.utcnow().isoformat()
                self.redis_client.setex(key, 30*24*60*60, json.dumps(notif_data))
            
            # Update in user list
            user_key = f"notifications:user:{user_id}"
            notifications = self.redis_client.lrange(user_key, 0, -1)
            for i, n_json in enumerate(notifications):
                n_data = json.loads(n_json)
                if n_data['notification_id'] == notification_id:
                    n_data['status'] = NotificationStatus.READ.value
                    n_data['read_at'] = datetime.utcnow().isoformat()
                    self.redis_client.lset(user_key, i, json.dumps(n_data))
                    break
            
            return True
        except Exception as e:
            logging.error(f"Error marking notification as read: {str(e)}")
            return False

    def get_unread_count(self, user_id: int) -> int:
        """Get count of unread notifications for a user"""
        try:
            if not self.redis_client:
                return 0
                
            user_key = f"notifications:user:{user_id}"
            notifications = self.redis_client.lrange(user_key, 0, -1)
            count = 0
            for n_json in notifications:
                n_data = json.loads(n_json)
                if n_data.get('status') != NotificationStatus.READ.value:
                    count += 1
            return count
        except Exception as e:
            logging.error(f"Error getting unread count: {str(e)}")
            return 0

    def _get_user_phone(self, user_id: int) -> Optional[str]:
        """Get user phone number from database"""
        try:
            from app.models import User
            user = User.query.get(user_id)
            return user.phone if user else None
        except Exception as e:
            logging.error(f"Error getting user phone: {str(e)}")
            return None
    
    def _get_user_email(self, user_id: int) -> Optional[str]:
        """Get user email from database"""
        try:
            # Assuming username is email or we add email field
            # For now, let's assume username is email if it contains @
            from app.models import User
            user = User.query.get(user_id)
            if user and '@' in user.username:
                return user.username
            return None
        except Exception as e:
            logging.error(f"Error getting user email: {str(e)}")
            return None

    def _check_preference(self, user_id: int, channel: str) -> bool:
        """Check if user has enabled notifications for channel"""
        try:
            from app.models import User
            user = User.query.get(user_id)
            if not user:
                return False
            
            prefs = user.communication_preferences or {}
            # Default to True if not set
            return prefs.get(channel, True)
            
        except Exception as e:
            logging.error(f"Error checking preferences: {str(e)}")
            return True
    

    def _get_notification(self, notification_id: int) -> Optional[NotificationModel]:
        """Get notification from the database"""
        try:
            return NotificationModel.query.get(notification_id)
        except Exception as e:
            logging.error(f"Error getting notification {notification_id} from database: {str(e)}")
            return None

    def _update_notification(self, notification: NotificationModel):
        """Update notification status in the database"""
        try:
            db.session.commit()
        except Exception as e:
            logging.error(f"Error updating notification in database: {str(e)}")
            db.session.rollback()
            raise
    
    def handle_sms_delivery_callback(self, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle SMS delivery callbacks from Africa's Talking"""
        try:
            message_id = callback_data.get('id')
            status = callback_data.get('status')
            phone_number = callback_data.get('phoneNumber')
            
            # Find corresponding notification
            notification_data = self._find_notification_by_message_id(message_id)
            
            if notification_data:
                if status == 'Success':
                    notification_data['status'] = NotificationStatus.DELIVERED.value
                    notification_data['delivered_at'] = datetime.utcnow().isoformat()
                elif status == 'Failed':
                    notification_data['status'] = NotificationStatus.FAILED.value
                    notification_data['error_message'] = callback_data.get('errorMessage', 'Unknown error')
                    
                    # Retry if not exceeded max retries
                    if notification_data['retry_count'] < notification_data['max_retries']:
                        notification_data['retry_count'] += 1
                        self._retry_notification(notification_data)
                
                self._update_notification(notification_data)
            
            return {
                'status': 'success',
                'message_id': message_id,
                'acknowledged': True
            }
            
        except Exception as e:
            logging.error(f"Error handling SMS callback: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }
    

    def _find_notification_by_message_id(self, message_id: str) -> Optional[Dict[str, Any]]:
        """Find notification by Africa's Talking message ID"""
        try:
            if not self.redis_client:
                return None
                
            # Search in all notifications (this could be optimized)
            # For now, try to get from a mapping
            key = f"at_message:{message_id}"
            notification_id = self.redis_client.get(key)
            
            if notification_id:
                return self._get_notification(notification_id)
            
            return None
            
        except Exception as e:
            logging.error(f"Error finding notification by message ID: {str(e)}")
            return None
    

    def _retry_notification(self, notification_data: Dict[str, Any]) -> bool:
        """Retry sending a notification"""
        try:
            if not self.redis_client:
                logging.warning("Redis not available, cannot retry notification")
                return False
                
            notification_data['status'] = NotificationStatus.PENDING.value
            self._update_notification(notification_data)
            
            # Re-queue for processing
            channel = NotificationChannel(notification_data['channel'])
            priority = NotificationPriority(notification_data['priority'])
            queue_key = f"notifications:retry:{channel.value}:{priority.value}"
            self.redis_client.lpush(queue_key, json.dumps(notification_data))
            
            logging.info(f"Notification {notification_data['notification_id']} queued for retry")
            return True
            
        except Exception as e:
            logging.error(f"Error retrying notification: {str(e)}")
            return False
    
    def get_notification_stats(self, days: int = 30) -> Dict[str, Any]:
        """Get notification statistics"""
        try:
            stats = {
                'total_sent': 0,
                'total_delivered': 0,
                'total_failed': 0,
                'total_pending': 0,
                'by_channel': {},
                'by_priority': {},
                'daily_breakdown': {}
            }
            
            # Count notifications
            for channel in NotificationChannel:
                channel_key = f"notifications:user:*"
                # This would require scanning all user notification keys
                # In a real implementation, we'd maintain counters
                pass
            
            return stats
            
        except Exception as e:
            logging.error(f"Error getting notification stats: {str(e)}")
            return {}
    
    def add_notification_template(self, template: NotificationTemplate):
        """Dynamically add a new notification template"""
        try:
            self.templates[template.template_id] = template
            logging.info(f"Added notification template: {template.template_id}")
        except Exception as e:
            logging.error(f"Error adding template: {str(e)}")

# Global Notification service instance
notification_service = NotificationService()

