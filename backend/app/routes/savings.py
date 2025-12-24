from flask import Blueprint, jsonify, request
from app.models import SavingsAccount, Member
from app import db

bp = Blueprint('savings', __name__, url_prefix='/api/savings')

@bp.route('', methods=['GET'])
def get_savings_accounts():
    accounts = SavingsAccount.query.join(Member).all()
    return jsonify([{
        **account.to_dict(),
        'member': {
            'firstName': account.member.user.first_name,
            'lastName': account.member.user.last_name,
            'memberCode': account.member.member_code
        }
    } for account in accounts])
