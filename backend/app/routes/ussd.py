from flask import Blueprint, request, jsonify
from app.services.ussd_service import ussd_service
import logging

bp = Blueprint('ussd', __name__, url_prefix='/api/ussd')

@bp.route('/handle', methods=['POST'])
def handle_ussd():
    """Handle incoming USSD requests from Africa's Talking or Twilio"""
    try:
        data = request.get_json() or request.form
        
        phone_number = data.get('phoneNumber') or data.get('From')
        user_input = data.get('text') or data.get('Body', '')
        session_id = data.get('sessionId') or data.get('CallSid')
        
        if not all([phone_number, session_id]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        response = ussd_service.handle_ussd_request(
            phone_number=phone_number,
            user_input=user_input,
            session_id=session_id
        )
        
        return jsonify({
            'response': response['response'],
            'continue_session': response.get('continue_session', True)
        })
    
    except Exception as e:
        logging.error(f"Error handling USSD request: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/status', methods=['GET'])
def get_ussd_status():
    """Get USSD service status"""
    try:
        status = ussd_service.get_ussd_status()
        return jsonify(status)
    except Exception as e:
        logging.error(f"Error getting USSD status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/code', methods=['GET'])
def get_ussd_code():
    """Get USSD code for marketing"""
    try:
        code = ussd_service.get_ussd_code()
        return jsonify({
            'code': code,
            'description': 'Dial this code to access Imarisha Loans on your feature phone',
            'supported_features': [
                'Check your balance',
                'Apply for loans',
                'View loan information',
                'Make payments',
                'Contact support'
            ]
        })
    except Exception as e:
        logging.error(f"Error getting USSD code: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/callback/africastalking', methods=['POST'])
def africastalking_ussd_callback():
    """Africa's Talking USSD callback endpoint"""
    try:
        return handle_ussd()
    except Exception as e:
        logging.error(f"Error in Africa's Talking callback: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/callback/twilio', methods=['POST'])
def twilio_ussd_callback():
    """Twilio USSD callback endpoint"""
    try:
        return handle_ussd()
    except Exception as e:
        logging.error(f"Error in Twilio callback: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['POST'])
def test_ussd_flow():
    """Test USSD flow (Admin only)"""
    try:
        data = request.get_json()
        
        phone_number = data.get('phone_number', '+254700123456')
        session_id = data.get('session_id', 'test_session_123')
        user_input = data.get('input', '')
        
        response = ussd_service.handle_ussd_request(
            phone_number=phone_number,
            user_input=user_input,
            session_id=session_id
        )
        
        return jsonify({
            'test': True,
            'phone_number': phone_number,
            'session_id': session_id,
            'input': user_input,
            'response': response['response'],
            'continue_session': response.get('continue_session', True)
        })
    
    except Exception as e:
        logging.error(f"Error testing USSD flow: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/simulate', methods=['GET'])
def simulate_ussd():
    """Simulate USSD flow in browser (for demo/testing)"""
    try:
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>USSD Simulator</title>
            <style>
                body { font-family: Arial; background: #f5f5f5; }
                .container { max-width: 600px; margin: 50px auto; background: white; padding: 20px; border-radius: 5px; }
                .screen { background: #000; color: #0f0; padding: 20px; font-family: monospace; height: 300px; overflow-y: auto; margin: 20px 0; }
                input { width: 100%; padding: 10px; margin: 10px 0; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 3px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>USSD Simulator</h1>
                <p>Phone Number: <input type="tel" id="phone" value="+254700123456"></p>
                <div class="screen" id="screen"></div>
                <input type="text" id="input" placeholder="Enter your choice (0-5)">
                <button onclick="sendInput()">Send</button>
                <button onclick="reset()">Reset</button>
            </div>
            
            <script>
                const screen = document.getElementById('screen');
                let sessionId = 'session_' + Date.now();
                
                async function sendInput() {
                    const input = document.getElementById('input').value;
                    const phone = document.getElementById('phone').value;
                    
                    try {
                        const response = await fetch('/api/ussd/test', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            },
                            body: JSON.stringify({
                                phone_number: phone,
                                session_id: sessionId,
                                input: input
                            })
                        });
                        
                        const data = await response.json();
                        screen.innerHTML += '<p>> ' + input + '</p>';
                        screen.innerHTML += '<p>' + data.response.replace(/\\n/g, '<br>') + '</p>';
                        document.getElementById('input').value = '';
                        screen.scrollTop = screen.scrollHeight;
                    } catch (error) {
                        screen.innerHTML += '<p style="color: red;">Error: ' + error.message + '</p>';
                    }
                }
                
                function reset() {
                    screen.innerHTML = '';
                    sessionId = 'session_' + Date.now();
                    sendInput();
                }
                
                // Initialize with main menu
                reset();
            </script>
        </body>
        </html>
        """
        from flask import Response
        return Response(html, mimetype='text/html')
    
    except Exception as e:
        logging.error(f"Error simulating USSD: {str(e)}")
        return jsonify({'error': str(e)}), 500
