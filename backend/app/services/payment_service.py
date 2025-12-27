"""
Payment Service for M-Pesa Integration
Handles STK Push, C2B, and Transaction Status
"""
import requests
import base64
from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Optional, List
from flask import current_app
import json
import uuid
import redis
from decimal import Decimal
from app.models import Transaction, Member, SavingsAccount, Loan, User
from app import db
from app.services.notification_service import notification_service, NotificationChannel, NotificationPriority

class PaymentService:
    def __init__(self, app=None):
        self.app = None
        self.base_url = "https://sandbox.safaricom.co.ke"
        self.consumer_key = None
        self.consumer_secret = None
        self.shortcode = None
        self.passkey = None
        self.callback_url = None
        self.redis_client = None
        self.max_retries = 3
        self.retry_delay = 300  # 5 minutes
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize payment service with Flask app"""
        self.app = app
        
        # Load configuration
        self.env = app.config.get('MPESA_ENV', 'sandbox')
        if self.env == 'production':
            self.base_url = "https://api.safaricom.co.ke"
        else:
            self.base_url = "https://sandbox.safaricom.co.ke"
            
        self.consumer_key = app.config.get('MPESA_CONSUMER_KEY')
        self.consumer_secret = app.config.get('MPESA_CONSUMER_SECRET')
        self.shortcode = app.config.get('MPESA_SHORTCODE')
        self.passkey = app.config.get('MPESA_PASSKEY')
        self.callback_url = app.config.get('MPESA_CALLBACK_URL')
        
        # Initialize Redis for transaction tracking
        try:
            self.redis_client = redis.Redis(
                host=app.config.get('REDIS_HOST', 'localhost'),
                port=app.config.get('REDIS_PORT', 6379),
                db=app.config.get('REDIS_DB', 3),
                decode_responses=True
            )
        except Exception as e:
            logging.warning(f"Failed to initialize Redis: {str(e)}")
        
        logging.info(f"Payment Service initialized in {self.env} mode")

    def _get_access_token(self) -> Optional[str]:
        """Generate M-Pesa access token"""
        try:
            api_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            
            headers = {
                "Authorization": f"Basic {encoded_auth}"
            }
            
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()
            
            return response.json().get('access_token')
            
        except Exception as e:
            logging.error(f"Error generating M-Pesa access token: {str(e)}")
            return None

    def _generate_password(self, timestamp: str) -> str:
        """Generate M-Pesa password"""
        data_to_encode = f"{self.shortcode}{self.passkey}{timestamp}"
        return base64.b64encode(data_to_encode.encode()).decode()

    def initiate_stk_push(self, phone_number: str, amount: float, 
                         account_reference: str, transaction_desc: str,
                         callback_url: str = None) -> Dict[str, Any]:
        """Initiate Lipa Na M-Pesa Online (STK Push)"""
        try:
            access_token = self._get_access_token()
            if not access_token:
                raise Exception("Failed to get access token")
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_password(timestamp)
            
            # Format phone number (ensure 254 format)
            if phone_number.startswith('0'):
                phone_number = f"254{phone_number[1:]}"
            elif phone_number.startswith('+'):
                phone_number = phone_number[1:]
                
            api_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "BusinessShortCode": self.shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount), # Amount must be integer
                "PartyA": phone_number,
                "PartyB": self.shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": callback_url or self.callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": transaction_desc
            }
            
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logging.error(f"Error initiating STK push: {str(e)}")
            raise

    def handle_callback(self, data: Dict[str, Any]):
        """Handle M-Pesa callback"""
        try:
            # Parse callback data
            body = data.get('Body', {}).get('stkCallback', {})
            result_code = body.get('ResultCode')
            result_desc = body.get('ResultDesc')
            merchant_request_id = body.get('MerchantRequestID')
            checkout_request_id = body.get('CheckoutRequestID')
            
            logging.info(f"M-Pesa Callback: {result_code} - {result_desc}")
            
            if result_code == 0:
                # Success
                metadata = body.get('CallbackMetadata', {}).get('Item', [])
                amount = next((item['Value'] for item in metadata if item['Name'] == 'Amount'), 0)
                mpesa_receipt_number = next((item['Value'] for item in metadata if item['Name'] == 'MpesaReceiptNumber'), None)
                phone_number = next((item['Value'] for item in metadata if item['Name'] == 'PhoneNumber'), None)
                
                # Find pending transaction or create new one
                # In a real app, we would have stored the CheckoutRequestID when initiating STK push
                # and linked it to a pending transaction.
                # For now, we'll assume we can find the user by phone number or create a generic deposit.
                
                # TODO: Implement logic to match transaction
                logging.info(f"Payment received: {mpesa_receipt_number} - {amount} from {phone_number}")
                
                # Example: Find member by phone
                # member = Member.query.join(User).filter(User.phone == str(phone_number)).first()
                # if member:
                #     self._process_deposit(member, amount, mpesa_receipt_number)
                
            else:
                # Failed
                logging.warning(f"Payment failed: {result_desc}")
                
        except Exception as e:
            logging.error(f"Error handling callback: {str(e)}")
            raise

    def _process_deposit(self, member: Member, amount: float, receipt: str, account_type: str = 'savings'):
        """Process successful deposit"""
        try:
            from app.models import DrawdownAccount
            from app.services.loan_service import loan_service
            
            account = None
            if account_type == 'savings':
                account = SavingsAccount.query.filter_by(member_id=member.id).first()
                if not account:
                    account = SavingsAccount(member_id=member.id, account_number=f"SAV-{member.member_code}")
                    db.session.add(account)
            elif account_type == 'drawdown':
                account = DrawdownAccount.query.filter_by(member_id=member.id).first()
                if not account:
                    account = DrawdownAccount(member_id=member.id, account_number=f"DRD-{member.member_code}")
                    db.session.add(account)
            
            if not account:
                return
                
            balance_before = account.balance
            account.balance += amount
            
            # Create transaction record
            transaction = Transaction(
                transaction_id=str(uuid.uuid4()),
                member_id=member.id,
                account_type=account_type,
                transaction_type='deposit',
                amount=amount,
                balance_before=balance_before,
                balance_after=account.balance,
                reference=f"M-Pesa Deposit",
                mpesa_code=receipt,
                status='confirmed',
                confirmed_at=datetime.utcnow()
            )
            
            db.session.add(transaction)
            db.session.flush()
            
            # Auto-repay if drawdown
            if account_type == 'drawdown':
                loan_service.auto_repay_from_drawdown(member.id)
                
            db.session.commit()
            
            # Send notification
            notification_service.send_notification(
                recipient_id=member.user_id,
                template_id="payment_confirmation",
                variables={
                    "amount": amount,
                    "phone_number": member.user.phone,
                    "balance": str(account.balance)
                },
                channel=NotificationChannel.SMS
            )
            
        except Exception as e:
            logging.error(f"Error processing deposit: {str(e)}")
            db.session.rollback()

    def register_c2b_url(self, validation_url: str, confirmation_url: str) -> Dict[str, Any]:
        """Register C2B URLs for receiving payments"""
        try:
            access_token = self._get_access_token()
            if not access_token:
                raise Exception("Failed to get access token")
            
            api_url = f"{self.base_url}/mpesa/c2b/v1/registerurl"
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "ShortCode": self.shortcode,
                "ResponseType": "Completed",
                "ValidationURL": validation_url,
                "ConfirmationURL": confirmation_url
            }
            
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            logging.info("C2B URLs registered successfully")
            return response.json()
            
        except Exception as e:
            logging.error(f"Error registering C2B URLs: {str(e)}")
            raise

    def query_transaction_status(self, transaction_id: str, phone_number: str) -> Dict[str, Any]:
        """Query M-Pesa transaction status"""
        try:
            access_token = self._get_access_token()
            if not access_token:
                raise Exception("Failed to get access token")
            
            api_url = f"{self.base_url}/mpesa/transactionstatus/v1/query"
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_password(timestamp)
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "Initiator": "testapi",
                "SecurityCredential": password,
                "CommandID": "TransactionStatusQuery",
                "TransactionID": transaction_id,
                "PartyA": self.shortcode,
                "IdentifierType": "4",
                "ResultURL": self.callback_url,
                "QueueTimeOutURL": self.callback_url,
                "Remarks": "Status query"
            }
            
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logging.error(f"Error querying transaction status: {str(e)}")
            raise

    def validate_payment(self, amount: float, phone_number: str, 
                        account_reference: str) -> bool:
        """Validate payment before processing"""
        try:
            # Check if amount is valid
            if amount <= 0:
                logging.warning(f"Invalid amount: {amount}")
                return False
            
            # Check if phone number is valid
            if not phone_number or len(phone_number) < 10:
                logging.warning(f"Invalid phone number: {phone_number}")
                return False
            
            # Check if account reference exists (optional)
            if account_reference:
                # Could check against database
                pass
            
            return True
            
        except Exception as e:
            logging.error(f"Error validating payment: {str(e)}")
            return False

    def reconcile_payment(self, receipt_number: str, amount: float, 
                         phone_number: str) -> Dict[str, Any]:
        """Reconcile payment against pending transactions"""
        try:
            # Find pending transaction by receipt or phone
            transaction = Transaction.query.filter_by(
                mpesa_code=receipt_number,
                status='pending'
            ).first()
            
            if not transaction:
                # Try to find by phone number
                member = Member.query.join(Member.user).filter(
                    User.phone == str(phone_number)
                ).first()
                
                if not member:
                    return {
                        'status': 'unmatched',
                        'message': 'No matching transaction found'
                    }
                
                # Create new transaction
                transaction = Transaction(
                    transaction_id=str(uuid.uuid4()),
                    member_id=member.id,
                    account_type='savings', # Defaults to savings if unmatched
                    transaction_type='deposit',
                    amount=amount,
                    status='confirmed',
                    mpesa_code=receipt_number,
                    confirmed_at=datetime.utcnow()
                )
                db.session.add(transaction)
            else:
                # Update existing transaction
                transaction.status = 'confirmed'
                transaction.confirmed_at = datetime.utcnow()
                transaction.mpesa_code = receipt_number
            
            db.session.flush()
            
            # Update account balance
            from app.models import DrawdownAccount
            account = None
            if transaction.account_type == 'savings':
                account = SavingsAccount.query.filter_by(member_id=member.id).first()
            elif transaction.account_type == 'drawdown':
                account = DrawdownAccount.query.filter_by(member_id=member.id).first()
                
            if account:
                transaction.balance_before = account.balance
                account.balance += Decimal(str(amount))
                transaction.balance_after = account.balance
                
                # Auto-repay if drawdown
                if transaction.account_type == 'drawdown':
                    from app.services.loan_service import loan_service
                    loan_service.auto_repay_from_drawdown(member.id)
            
            db.session.commit()
            
            # Store in Redis for analytics
            if self.redis_client:
                payment_key = f"payment:{receipt_number}"
                self.redis_client.setex(payment_key, 86400, json.dumps({
                    'transaction_id': transaction.transaction_id,
                    'amount': amount,
                    'timestamp': datetime.utcnow().isoformat(),
                    'phone_number': phone_number
                }))
            
            return {
                'status': 'reconciled',
                'transaction_id': transaction.transaction_id,
                'message': 'Payment reconciled successfully'
            }
            
        except Exception as e:
            logging.error(f"Error reconciling payment: {str(e)}")
            db.session.rollback()
            return {
                'status': 'error',
                'message': str(e)
            }

    def retry_failed_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Retry a failed payment"""
        try:
            transaction = Transaction.query.filter_by(
                transaction_id=transaction_id,
                status='failed'
            ).first()
            
            if not transaction:
                return {
                    'status': 'not_found',
                    'message': 'Transaction not found or not in failed state'
                }
            
            # Check retry count
            retry_count = int(self.redis_client.get(f"retry_count:{transaction_id}") or 0) if self.redis_client else 0
            
            if retry_count >= self.max_retries:
                return {
                    'status': 'max_retries_exceeded',
                    'message': f'Maximum retry attempts ({self.max_retries}) exceeded'
                }
            
            # Retry the payment
            member = Member.query.get(transaction.member_id)
            result = self.initiate_stk_push(
                phone_number=member.user.phone,
                amount=transaction.amount,
                account_reference=str(transaction.reference),
                transaction_desc=f"Retry - {transaction.reference}"
            )
            
            # Update retry count
            if self.redis_client:
                self.redis_client.setex(
                    f"retry_count:{transaction_id}",
                    7*24*60*60,  # 7 days
                    retry_count + 1
                )
            
            return {
                'status': 'retrying',
                'message': 'Payment retry initiated',
                'retry_count': retry_count + 1
            }
            
        except Exception as e:
            logging.error(f"Error retrying payment: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }

    def get_payment_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get payment analytics"""
        try:
            analytics = {
                'total_payments': 0,
                'total_amount': 0,
                'successful_payments': 0,
                'failed_payments': 0,
                'pending_payments': 0,
                'average_amount': 0,
                'daily_totals': {}
            }
            
            # Query from database
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            transactions = Transaction.query.filter(
                Transaction.created_at >= start_date,
                Transaction.created_at <= end_date,
                Transaction.transaction_type.in_(['deposit', 'payment'])
            ).all()
            
            for transaction in transactions:
                analytics['total_payments'] += 1
                analytics['total_amount'] += transaction.amount
                
                if transaction.status == 'confirmed':
                    analytics['successful_payments'] += 1
                elif transaction.status == 'failed':
                    analytics['failed_payments'] += 1
                elif transaction.status == 'pending':
                    analytics['pending_payments'] += 1
                
                # Daily totals
                date_key = transaction.created_at.strftime('%Y-%m-%d')
                if date_key not in analytics['daily_totals']:
                    analytics['daily_totals'][date_key] = 0
                analytics['daily_totals'][date_key] += transaction.amount
            
            if transactions:
                analytics['average_amount'] = analytics['total_amount'] / len(transactions)
            
            return analytics
            
        except Exception as e:
            logging.error(f"Error getting payment analytics: {str(e)}")
            return {}

# Global Payment service instance
payment_service = PaymentService()
