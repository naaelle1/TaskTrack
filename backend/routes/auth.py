from flask import Blueprint, request, jsonify, session
from models.user import User
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()

        # Validation
        if not data.get('username'):
            return jsonify({"error": "Username is required"}), 400
        if not data.get('email'):
            return jsonify({"error": "Email is required"}), 400
        if not data.get('password'):
            return jsonify({"error": "Password is required"}), 400

        if len(data['password']) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400

        if not validate_email(data['email']):
            return jsonify({"error": "Invalid email format"}), 400

        # Check if username already exists
        existing_user = User.get_by_username(data['username'])
        if existing_user:
            return jsonify({"error": "Username already taken"}), 400

        # Create user
        new_user = User.create(data['username'], data['email'], data['password'])

        return jsonify({
            "message": "User registered successfully",
            "user": new_user
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()

        if not data.get('username') or not data.get('password'):
            return jsonify({"error": "Username and password required"}), 400

        # Get user from database
        user = User.get_by_username(data['username'])
        if not user:
            return jsonify({"error": "Invalid username or password"}), 401

        # Verify password
        if not User.verify_password(data['password'], user['password_hash']):
            return jsonify({"error": "Invalid username or password"}), 401

        # Set session
        session['user_id'] = user['id']
        session['username'] = user['username']

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email']
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        session.clear()
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current logged in user"""
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Not authenticated"}), 401

        user = User.get_by_id(session['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user": user}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update current logged in user profile"""
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Not authenticated"}), 401

        data = request.get_json()

        # Update profile
        updated_user = User.update_profile(
            user_id=session['user_id'],
            full_name=data.get('full_name'),
            school=data.get('school'),
            major=data.get('major'),
            bio=data.get('bio')
        )

        return jsonify({
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
