"""
Voice Assistant Routes - Voice commands and natural language processing
"""
from flask import Blueprint, request, jsonify, current_app
from app.services import voice_assistant, voice_analytics
import logging

bp = Blueprint('voice_assistant', __name__, url_prefix='/api/voice')

@bp.route('/command', methods=['POST'])
def process_command():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        transcript = data.get('transcript')
        language = data.get('language', 'en')
        
        if not all([user_id, transcript]):
            return jsonify({'error': 'Missing transcript or user_id'}), 400
        
        voice_assistant.init_app(current_app)
        result = voice_assistant.process_voice_command(user_id, transcript, language)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Voice command error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/commands', methods=['GET'])
def get_commands():
    try:
        language = request.args.get('language', 'en')
        
        voice_assistant.init_app(current_app)
        result = voice_assistant.get_supported_commands(language)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Get commands error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/analytics/<int:user_id>', methods=['GET'])
def get_analytics(user_id):
    try:
        days = request.args.get('days', 30, type=int)
        
        voice_analytics.init_app(current_app)
        stats = voice_analytics.get_usage_stats(user_id, days)
        
        return jsonify(stats)
    except Exception as e:
        logging.error(f"Analytics error: {str(e)}")
        return jsonify({'error': str(e)}), 500
