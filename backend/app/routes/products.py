from flask import Blueprint, request, jsonify
from app.models import LoanProduct, LoanType
from app import db
from app.services.inventory_service import InventoryService

bp = Blueprint('products', __name__, url_prefix='/api')

# Loan Products
@bp.route('/loan-products', methods=['GET'])
def get_loan_products():
    products = LoanProduct.query.filter_by(is_active=True).all()
    return jsonify([product.to_dict() for product in products])

@bp.route('/loan-products/alerts', methods=['GET'])
def get_stock_alerts():
    alerts = InventoryService.check_stock_levels()
    return jsonify(alerts)

@bp.route('/loan-products/<int:id>/forecast', methods=['GET'])
def get_product_forecast(id):
    days = request.args.get('days', 30, type=int)
    forecast = InventoryService.predict_demand(id, days)
    return jsonify(forecast)

@bp.route('/loan-products/<int:id>', methods=['GET'])
def get_loan_product(id):
    product = LoanProduct.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_dict())

from app.utils.decorators import admin_required

@bp.route('/loan-products', methods=['POST'])
@admin_required
def create_loan_product():
    data = request.get_json()
    
    # Basic validation
    required_fields = ['name', 'categoryId', 'buyingPrice', 'sellingPrice']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
        
    product = LoanProduct(
        name=data['name'],
        category_id=data['categoryId'],
        buying_price=data['buyingPrice'],
        selling_price=data['sellingPrice'],
        stock_quantity=data.get('stockQuantity', 0),
        low_stock_threshold=data.get('lowStockThreshold', 10),
        critical_stock_threshold=data.get('criticalStockThreshold', 5)
    )
    
    try:
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/loan-products/<int:id>', methods=['PATCH'])
@admin_required
def update_loan_product(id):
    product = LoanProduct.query.get(id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
        
    data = request.get_json()
    
    if 'name' in data: product.name = data['name']
    if 'categoryId' in data: product.category_id = data['categoryId']
    if 'buyingPrice' in data: product.buying_price = data['buyingPrice']
    if 'sellingPrice' in data: product.selling_price = data['sellingPrice']
    if 'stockQuantity' in data: product.stock_quantity = data['stockQuantity']
    if 'lowStockThreshold' in data: product.low_stock_threshold = data['lowStockThreshold']
    if 'criticalStockThreshold' in data: product.critical_stock_threshold = data['criticalStockThreshold']
    if 'isActive' in data: product.is_active = data['isActive']
    
    try:
        db.session.commit()
        return jsonify(product.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Loan Types
@bp.route('/loan-types', methods=['GET'])
def get_loan_types():
    loan_types = LoanType.query.filter_by(is_active=True).all()
    return jsonify([lt.to_dict() for lt in loan_types])

@bp.route('/loan-types', methods=['POST'])
@admin_required
def create_loan_type():
    data = request.get_json()
    
    required_fields = ['name', 'interestRate', 'minAmount', 'maxAmount', 'durationMonths']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
        
    loan_type = LoanType(
        name=data['name'],
        interest_rate=data['interestRate'],
        interest_type=data.get('interestType', 'flat'),
        charge_fee_percentage=data.get('chargeFeePercentage', 4),
        min_amount=data['minAmount'],
        max_amount=data['maxAmount'],
        duration_months=data['durationMonths']
    )
    
    try:
        db.session.add(loan_type)
        db.session.commit()
        return jsonify(loan_type.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/loan-types/<int:id>', methods=['PATCH'])
@admin_required
def update_loan_type(id):
    loan_type = LoanType.query.get(id)
    if not loan_type:
        return jsonify({'error': 'Loan type not found'}), 404

    data = request.get_json()

    if 'name' in data: loan_type.name = data['name']
    if 'interestRate' in data: loan_type.interest_rate = data['interestRate']
    if 'interestType' in data: loan_type.interest_type = data['interestType']
    if 'chargeFeePercentage' in data: loan_type.charge_fee_percentage = data['chargeFeePercentage']
    if 'minAmount' in data: loan_type.min_amount = data['minAmount']
    if 'maxAmount' in data: loan_type.max_amount = data['maxAmount']
    if 'durationMonths' in data: loan_type.duration_months = data['durationMonths']
    if 'isActive' in data: loan_type.is_active = data['isActive']

    try:
        db.session.commit()
        return jsonify(loan_type.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
