"""
ETL Pipeline Routes - Data warehouse integration
"""
from flask import Blueprint, request, jsonify, current_app
from app.services import etl_service
import logging

bp = Blueprint('etl_pipeline', __name__, url_prefix='/api/etl')

@bp.route('/pipeline', methods=['POST'])
def create_pipeline():
    try:
        data = request.get_json()
        name = data.get('name')
        source = data.get('source')
        target = data.get('target')
        schedule = data.get('schedule', 'daily')
        
        if not all([name, source, target]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        etl_service.init_app(current_app)
        result = etl_service.create_pipeline(name, source, target, schedule)
        
        return jsonify(result), 201
    except Exception as e:
        logging.error(f"Pipeline creation error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/extract', methods=['POST'])
def extract():
    try:
        data = request.get_json()
        source = data.get('source')
        filters = data.get('filters')
        
        if not source:
            return jsonify({'error': 'Missing source'}), 400
        
        etl_service.init_app(current_app)
        result = etl_service.extract_data(source, filters)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Extract error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/transform', methods=['POST'])
def transform():
    try:
        data = request.get_json()
        source_data = data.get('data', [])
        transformations = data.get('transformations')
        
        etl_service.init_app(current_app)
        result = etl_service.transform_data(source_data, transformations)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Transform error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/load', methods=['POST'])
def load():
    try:
        data = request.get_json()
        pipeline_id = data.get('pipeline_id')
        target_table = data.get('target_table')
        records = data.get('records', [])
        
        if not all([pipeline_id, target_table]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        etl_service.init_app(current_app)
        result = etl_service.load_to_warehouse(pipeline_id, records, target_table)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Load error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/pipeline/<pipeline_id>/run', methods=['POST'])
def run_pipeline(pipeline_id):
    try:
        etl_service.init_app(current_app)
        result = etl_service.run_pipeline(pipeline_id)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Pipeline run error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/pipeline/<pipeline_id>/status', methods=['GET'])
def get_status(pipeline_id):
    try:
        etl_service.init_app(current_app)
        result = etl_service.get_pipeline_status(pipeline_id)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Status error: {str(e)}")
        return jsonify({'error': str(e)}), 500
