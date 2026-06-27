from flask import Flask, jsonify
from flask_cors import CORS
from config import DevelopmentConfig
from database.db import init_db
from routes.auth import auth_bp
from routes.task import task_bp
from routes.dashboard import dashboard_bp
from routes.admin import admin_bp

import os

app = Flask(__name__)

# Load config dynamically
if os.getenv('FLASK_ENV') == 'production':
    from config import ProductionConfig
    app.config.from_object(ProductionConfig)
else:
    from config import DevelopmentConfig
    app.config.from_object(DevelopmentConfig)

# Enable CORS for frontend
# In production, we should ideally restrict this to the frontend URL.
frontend_url = os.getenv('FRONTEND_URL', '*')
CORS(app, resources={r"/*": {"origins": frontend_url}}, allow_headers=['Content-Type', 'Authorization'], supports_credentials=True)

# Initialize database
try:
    init_db()
except Exception as e:
    print(f"Database initialization error: {e}")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='')
app.register_blueprint(task_bp, url_prefix='')
app.register_blueprint(dashboard_bp, url_prefix='')
app.register_blueprint(admin_bp, url_prefix='')

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"}), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({"error": "Method not allowed"}), 405

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
