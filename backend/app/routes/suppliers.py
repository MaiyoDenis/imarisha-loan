from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models import Supplier, SupplierProduct, LoanProduct, StockMovement, User
from app import db
from app.services import audit_service, AuditEventType, RiskLevel

bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')

def check_admin_permission():
    """Check if current user is admin or procurement_officer"""
    claims = get_jwt()
    role = claims.get('role')
    return role in ['admin', 'procurement_officer']

@bp.route('', methods=['GET'])
@jwt_required()
def get_suppliers():
    """Get all suppliers"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_active = request.args.get('is_active', None)
    
    query = Supplier.query
    
    if is_active is not None:
        query = query.filter_by(is_active=is_active == 'true')
    
    suppliers = query.order_by(Supplier.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'suppliers': [supplier.to_dict() for supplier in suppliers.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': suppliers.total,
            'pages': suppliers.pages
        }
    })

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_supplier(id):
    """Get a specific supplier with products"""
    supplier = Supplier.query.get(id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    supplier_dict = supplier.to_dict()
    supplier_dict['products'] = [product.to_dict() for product in supplier.products]
    
    return jsonify(supplier_dict)

@bp.route('', methods=['POST'])
@jwt_required()
def create_supplier():
    """Create a new supplier (admin/procurement officer only)"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer access required'}), 403
    
    data = request.get_json()
    
    required_fields = ['name', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields: name, phone'}), 400
    
    try:
        supplier = Supplier(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            location=data.get('location'),
            company_name=data.get('companyName'),
            contact_person=data.get('contactPerson'),
            bank_name=data.get('bankName'),
            bank_account=data.get('bankAccount'),
            mpesa_number=data.get('mpesaNumber'),
            is_active=data.get('isActive', True)
        )
        
        db.session.add(supplier)
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.DATA_CREATED,
            user_id=get_jwt()['sub'],
            resource="supplier",
            action="create",
            entity_id=supplier.id,
            details={
                'supplierName': data['name'],
                'phone': data['phone']
            },
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'message': 'Supplier created successfully',
            'supplier': supplier.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_supplier(id):
    """Update a supplier"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer access required'}), 403
    
    supplier = Supplier.query.get(id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'name' in data:
            supplier.name = data['name']
        if 'phone' in data:
            supplier.phone = data['phone']
        if 'email' in data:
            supplier.email = data['email']
        if 'location' in data:
            supplier.location = data['location']
        if 'companyName' in data:
            supplier.company_name = data['companyName']
        if 'contactPerson' in data:
            supplier.contact_person = data['contactPerson']
        if 'bankName' in data:
            supplier.bank_name = data['bankName']
        if 'bankAccount' in data:
            supplier.bank_account = data['bankAccount']
        if 'mpesaNumber' in data:
            supplier.mpesa_number = data['mpesaNumber']
        if 'isActive' in data:
            supplier.is_active = data['isActive']
        if 'rating' in data:
            supplier.rating = float(data['rating'])
        
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.DATA_UPDATED,
            user_id=get_jwt()['sub'],
            resource="supplier",
            action="update",
            entity_id=id,
            details={'supplierName': supplier.name},
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'message': 'Supplier updated successfully',
            'supplier': supplier.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_supplier(id):
    """Delete a supplier"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer access required'}), 403
    
    supplier = Supplier.query.get(id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    try:
        db.session.delete(supplier)
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.DATA_DELETED,
            user_id=get_jwt()['sub'],
            resource="supplier",
            action="delete",
            entity_id=id,
            details={'supplierName': supplier.name},
            risk_level=RiskLevel.HIGH
        )
        
        return jsonify({'message': 'Supplier deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>/products', methods=['GET'])
@jwt_required()
def get_supplier_products(id):
    """Get all products for a supplier"""
    supplier = Supplier.query.get(id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    products = SupplierProduct.query.filter_by(supplier_id=id).all()
    
    return jsonify([product.to_dict() for product in products])

@bp.route('/<int:supplier_id>/products', methods=['POST'])
@jwt_required()
def add_supplier_product(supplier_id):
    """Add a product to a supplier"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer access required'}), 403
    
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    data = request.get_json()
    
    required_fields = ['productId', 'costPrice']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields: productId, costPrice'}), 400
    
    # Check if product exists
    product = LoanProduct.query.get(data['productId'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Check if mapping already exists
    existing = SupplierProduct.query.filter_by(
        supplier_id=supplier_id,
        product_id=data['productId']
    ).first()
    if existing:
        return jsonify({'error': 'Product already assigned to this supplier'}), 400
    
    try:
        supplier_product = SupplierProduct(
            supplier_id=supplier_id,
            product_id=data['productId'],
            cost_price=float(data['costPrice']),
            minimum_order=data.get('minimumOrder', 1),
            delivery_days=data.get('deliveryDays', 7),
            is_active=data.get('isActive', True)
        )
        
        db.session.add(supplier_product)
        supplier.total_supplies += 1
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.DATA_CREATED,
            user_id=get_jwt()['sub'],
            resource="supplier_product",
            action="create",
            entity_id=supplier_product.id,
            details={
                'supplierId': supplier_id,
                'productId': data['productId']
            },
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'message': 'Product added to supplier successfully',
            'product': supplier_product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_supplier_product(product_id):
    """Remove a product from a supplier"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer access required'}), 403
    
    supplier_product = SupplierProduct.query.get(product_id)
    if not supplier_product:
        return jsonify({'error': 'Supplier product mapping not found'}), 404
    
    try:
        supplier = supplier_product.supplier
        db.session.delete(supplier_product)
        supplier.total_supplies -= 1
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.DATA_DELETED,
            user_id=get_jwt()['sub'],
            resource="supplier_product",
            action="delete",
            entity_id=product_id,
            details={
                'supplierId': supplier.id,
                'productId': supplier_product.product_id
            },
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({'message': 'Product removed from supplier successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:supplier_id>/rating', methods=['PUT'])
@jwt_required()
def rate_supplier(supplier_id):
    """Rate a supplier"""
    if not check_admin_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer access required'}), 403
    
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    data = request.get_json()
    
    if 'rating' not in data:
        return jsonify({'error': 'Rating is required'}), 400
    
    rating = float(data['rating'])
    if rating < 0 or rating > 5:
        return jsonify({'error': 'Rating must be between 0 and 5'}), 400
    
    try:
        supplier.rating = rating
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.DATA_UPDATED,
            user_id=get_jwt()['sub'],
            resource="supplier",
            action="rate",
            entity_id=supplier_id,
            details={
                'supplierName': supplier.name,
                'rating': rating
            },
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'message': 'Supplier rated successfully',
            'supplier': supplier.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
