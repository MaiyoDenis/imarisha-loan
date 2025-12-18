from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models import StockMovement, LoanProduct, BranchProduct, Supplier, User, Branch
from app import db
from app.services import audit_service, AuditEventType, RiskLevel
from datetime import datetime

bp = Blueprint('stock', __name__, url_prefix='/api/stock')

def check_permission():
    """Check if current user can manage stock"""
    claims = get_jwt()
    role = claims.get('role')
    return role in ['admin', 'procurement_officer', 'branch_manager']

@bp.route('/movements', methods=['GET'])
@jwt_required()
def get_stock_movements():
    """Get all stock movements"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    product_id = request.args.get('product_id', None, type=int)
    branch_id = request.args.get('branch_id', None, type=int)
    movement_type = request.args.get('movement_type', None)
    
    query = StockMovement.query
    
    if product_id:
        query = query.filter_by(product_id=product_id)
    if branch_id:
        query = query.filter_by(branch_id=branch_id)
    if movement_type:
        query = query.filter_by(movement_type=movement_type)
    
    movements = query.order_by(StockMovement.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'movements': [movement.to_dict() for movement in movements.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': movements.total,
            'pages': movements.pages
        }
    })

@bp.route('/movements/<int:id>', methods=['GET'])
@jwt_required()
def get_stock_movement(id):
    """Get a specific stock movement"""
    movement = StockMovement.query.get(id)
    if not movement:
        return jsonify({'error': 'Stock movement not found'}), 404
    
    return jsonify(movement.to_dict())

@bp.route('/movements', methods=['POST'])
@jwt_required()
def create_stock_movement():
    """Create a stock movement (restock, usage, transfer, adjustment)"""
    if not check_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer/Branch Manager access required'}), 403
    
    data = request.get_json()
    
    required_fields = ['productId', 'movementType', 'quantity']
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Missing required fields: {", ".join(required_fields)}'}), 400
    
    # Validate movement type
    valid_types = ['in', 'out', 'transfer', 'adjustment']
    if data['movementType'] not in valid_types:
        return jsonify({'error': f'Invalid movement type. Must be one of: {", ".join(valid_types)}'}), 400
    
    # Check product exists
    product = LoanProduct.query.get(data['productId'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    # Check branch if provided
    branch_id = data.get('branchId')
    if branch_id:
        branch = Branch.query.get(branch_id)
        if not branch:
            return jsonify({'error': 'Branch not found'}), 404
    
    # Check supplier if provided
    supplier_id = data.get('supplierId')
    if supplier_id:
        supplier = Supplier.query.get(supplier_id)
        if not supplier:
            return jsonify({'error': 'Supplier not found'}), 404
    
    try:
        current_user = get_jwt()['sub']
        quantity = int(data['quantity'])
        
        # Create stock movement
        movement = StockMovement(
            product_id=data['productId'],
            branch_id=branch_id,
            supplier_id=supplier_id,
            movement_type=data['movementType'],
            quantity=quantity,
            reference_number=data.get('referenceNumber'),
            processed_by=current_user,
            notes=data.get('notes')
        )
        
        # Update product stock
        if data['movementType'] in ['in', 'adjustment']:
            product.stock_quantity += quantity
        elif data['movementType'] in ['out', 'transfer']:
            if product.stock_quantity < quantity:
                return jsonify({'error': 'Insufficient stock'}), 400
            product.stock_quantity -= quantity
        
        # Update branch stock if applicable
        if branch_id and data['movementType'] in ['in', 'out']:
            branch_product = BranchProduct.query.filter_by(
                branch_id=branch_id,
                product_id=data['productId']
            ).first()
            
            if branch_product:
                if data['movementType'] == 'in':
                    branch_product.stock_quantity += quantity
                else:
                    if branch_product.stock_quantity < quantity:
                        return jsonify({'error': 'Insufficient stock in branch'}), 400
                    branch_product.stock_quantity -= quantity
        
        db.session.add(movement)
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.INVENTORY_UPDATED,
            user_id=current_user,
            resource="stock_movement",
            action=data['movementType'],
            entity_id=movement.id,
            details={
                'productId': data['productId'],
                'quantity': quantity,
                'movementType': data['movementType'],
                'branchId': branch_id,
                'supplierId': supplier_id
            },
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({
            'message': 'Stock movement recorded successfully',
            'movement': movement.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': f'Invalid quantity: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/restock', methods=['POST'])
@jwt_required()
def create_restock_request():
    """Create a restock request from supplier"""
    if not check_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer/Branch Manager access required'}), 403
    
    data = request.get_json()
    
    required_fields = ['productId', 'supplierId', 'quantity']
    if not all(field in data for field in required_fields):
        return jsonify({'error': f'Missing required fields: {", ".join(required_fields)}'}), 400
    
    product = LoanProduct.query.get(data['productId'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    supplier = Supplier.query.get(data['supplierId'])
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    # Check if supplier supplies this product
    from app.models import SupplierProduct
    supplier_product = SupplierProduct.query.filter_by(
        supplier_id=data['supplierId'],
        product_id=data['productId']
    ).first()
    if not supplier_product:
        return jsonify({'error': 'Supplier does not supply this product'}), 400
    
    try:
        # Create restock movement
        movement = StockMovement(
            product_id=data['productId'],
            supplier_id=data['supplierId'],
            branch_id=data.get('branchId'),
            movement_type='in',
            quantity=int(data['quantity']),
            reference_number=f"RESTOCK-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            processed_by=get_jwt()['sub'],
            notes=f"Restock from {supplier.name}" + (f" - {data.get('notes')}" if data.get('notes') else "")
        )
        
        # Update stock
        product.stock_quantity += int(data['quantity'])
        
        db.session.add(movement)
        db.session.commit()
        
        audit_service.log_event(
            event_type=AuditEventType.INVENTORY_UPDATED,
            user_id=get_jwt()['sub'],
            resource="restock_request",
            action="create",
            entity_id=movement.id,
            details={
                'productId': data['productId'],
                'supplierId': data['supplierId'],
                'quantity': data['quantity']
            },
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({
            'message': 'Restock request created successfully',
            'movement': movement.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock_products():
    """Get products with low stock"""
    branch_id = request.args.get('branch_id', None, type=int)
    
    query = LoanProduct.query.filter(
        LoanProduct.stock_quantity <= LoanProduct.low_stock_threshold
    )
    
    if branch_id:
        query = query.filter(
            BranchProduct.branch_id == branch_id,
            BranchProduct.stock_quantity <= BranchProduct.low_stock_threshold
        )
    
    products = query.all()
    
    return jsonify([{
        'product': product.to_dict(),
        'status': 'critical' if product.stock_quantity <= product.critical_stock_threshold else 'low'
    } for product in products])

@bp.route('/critical-stock', methods=['GET'])
@jwt_required()
def get_critical_stock_products():
    """Get products with critical stock levels"""
    products = LoanProduct.query.filter(
        LoanProduct.stock_quantity <= LoanProduct.critical_stock_threshold
    ).all()
    
    return jsonify([{
        'product': product.to_dict(),
        'status': 'critical'
    } for product in products])

@bp.route('/branch/<int:branch_id>/inventory', methods=['GET'])
@jwt_required()
def get_branch_inventory(branch_id):
    """Get inventory for a specific branch"""
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    
    inventory = BranchProduct.query.filter_by(branch_id=branch_id).all()
    
    return jsonify([item.to_dict() for item in inventory])

@bp.route('/branch/<int:branch_id>/inventory', methods=['POST'])
@jwt_required()
def update_branch_inventory(branch_id):
    """Update branch inventory"""
    if not check_permission():
        return jsonify({'error': 'Unauthorized - Admin/Procurement Officer/Branch Manager access required'}), 403
    
    branch = Branch.query.get(branch_id)
    if not branch:
        return jsonify({'error': 'Branch not found'}), 404
    
    data = request.get_json()
    
    required_fields = ['productId', 'stockQuantity']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = LoanProduct.query.get(data['productId'])
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        branch_product = BranchProduct.query.filter_by(
            branch_id=branch_id,
            product_id=data['productId']
        ).first()
        
        if not branch_product:
            branch_product = BranchProduct(
                branch_id=branch_id,
                product_id=data['productId'],
                stock_quantity=int(data['stockQuantity']),
                low_stock_threshold=data.get('lowStockThreshold', 10)
            )
            db.session.add(branch_product)
        else:
            branch_product.stock_quantity = int(data['stockQuantity'])
            if 'lowStockThreshold' in data:
                branch_product.low_stock_threshold = data['lowStockThreshold']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Branch inventory updated successfully',
            'inventory': branch_product.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
