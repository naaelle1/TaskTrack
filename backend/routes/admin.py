import os
from flask import Blueprint, request, jsonify, session
from functools import wraps
from models.user import User

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        user_id = session['user_id']
        current_user = User.get_by_id(user_id)
        
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401
            
        admin_email = os.getenv('ADMIN_EMAIL')
        if not admin_email or current_user['email'] != admin_email:
            return jsonify({"error": "Forbidden: Admin access only"}), 403
            
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all registered users"""
    try:
        users = User.get_all()
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/admin/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user and associated tasks"""
    try:
        User.delete(user_id)
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/admin/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user login/data"""
    try:
        data = request.get_json()
        if not data.get('username') or not data.get('email'):
            return jsonify({"error": "Username and Email required"}), 400
            
        updated_user = User.admin_update(
            user_id=user_id,
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password') # optional
        )
        return jsonify({"message": "User updated", "user": updated_user}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
