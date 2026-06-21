from flask import Blueprint, jsonify, session
from models.task import Task
from models.user import User

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard data for current user"""
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Not authenticated"}), 401

        # Get current user
        user = User.get_by_id(session['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get all tasks
        tasks = Task.get_all_by_user(session['user_id'])

        # Calculate stats
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t['status'] == 'completed'])
        pending_tasks = len([t for t in tasks if t['status'] == 'pending'])

        # Count by priority
        high_priority = len([t for t in tasks if t['priority'] == 'high'])
        medium_priority = len([t for t in tasks if t['priority'] == 'medium'])
        low_priority = len([t for t in tasks if t['priority'] == 'low'])

        # Get unique subjects
        subjects = list(set([t['subject'] for t in tasks]))

        return jsonify({
            "user": user,
            "stats": {
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "pending_tasks": pending_tasks,
                "high_priority": high_priority,
                "medium_priority": medium_priority,
                "low_priority": low_priority
            },
            "subjects": subjects,
            "tasks": tasks
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
