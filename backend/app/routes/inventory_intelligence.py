"""
Inventory Intelligence Routes - Demand forecasting and optimization
"""
from flask import Blueprint, request, jsonify, current_app
from app.services import demand_forecasting, inventory_optimization
import logging

bp = Blueprint('inventory_intelligence', __name__, url_prefix='/api/inventory-intelligence')

@bp.route('/forecast/<int:product_id>', methods=['GET'])
def get_forecast(product_id):
    try:
        days = request.args.get('days', 30, type=int)
        method = request.args.get('method', 'arima')
        
        demand_forecasting.init_app(current_app)
        result = demand_forecasting.forecast_demand(product_id, days, method)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Forecast error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/reorder-point/<int:product_id>', methods=['GET'])
def get_reorder_point(product_id):
    try:
        lead_time = request.args.get('lead_time', 7, type=int)
        
        inventory_optimization.init_app(current_app)
        result = inventory_optimization.calculate_reorder_point(product_id, lead_time)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Reorder point error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    try:
        branch_id = request.args.get('branch_id', type=int)
        
        inventory_optimization.init_app(current_app)
        result = inventory_optimization.get_inventory_recommendations(branch_id)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Recommendations error: {str(e)}")
        return jsonify({'error': str(e)}), 500
