from flask import Blueprint, request, jsonify, session
from models.task import Task

task_bp = Blueprint('task', __name__)

def is_authenticated():
    """Check if user is authenticated"""
    return 'user_id' in session

@task_bp.route('/tasks', methods=['POST'])
def create_task():
    """Create new task"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        data = request.get_json()

        # Validation
        if not data.get('title'):
            return jsonify({"error": "Title is required"}), 400
        if not data.get('subject'):
            return jsonify({"error": "Subject is required"}), 400
        if not data.get('deadline'):
            return jsonify({"error": "Deadline is required"}), 400

        priority = data.get('priority', 'medium')
        if priority not in ['low', 'medium', 'high']:
            return jsonify({"error": "Priority must be low, medium, or high"}), 400

        # Create task
        new_task = Task.create(
            title=data['title'],
            subject=data['subject'],
            deadline=data['deadline'],
            priority=priority,
            user_id=session['user_id']
        )

        return jsonify({
            "message": "Task created successfully",
            "task": new_task
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks', methods=['GET'])
def get_all_tasks():
    """Get all tasks for current user"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        tasks = Task.get_all_by_user(session['user_id'])

        return jsonify({
            "total": len(tasks),
            "tasks": tasks
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    """Get single task by ID"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        task = Task.get_by_id(task_id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Check ownership
        if task['user_id'] != session['user_id']:
            return jsonify({"error": "Unauthorized"}), 403

        return jsonify({"task": task}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update task"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        task = Task.get_by_id(task_id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Check ownership
        if task['user_id'] != session['user_id']:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        # Update task
        updated_task = Task.update(
            task_id=task_id,
            title=data.get('title'),
            subject=data.get('subject'),
            deadline=data.get('deadline'),
            priority=data.get('priority'),
            status=data.get('status')
        )

        return jsonify({
            "message": "Task updated successfully",
            "task": updated_task
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete task"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        task = Task.get_by_id(task_id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Check ownership
        if task['user_id'] != session['user_id']:
            return jsonify({"error": "Unauthorized"}), 403

        Task.delete(task_id)

        return jsonify({"message": "Task deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks/<task_id>/complete', methods=['PATCH'])
def complete_task(task_id):
    """Mark task as completed"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        task = Task.get_by_id(task_id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Check ownership
        if task['user_id'] != session['user_id']:
            return jsonify({"error": "Unauthorized"}), 403

        updated_task = Task.update(task_id=task_id, status='completed')

        return jsonify({
            "message": "Task marked as completed",
            "task": updated_task
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks/search', methods=['GET'])
def search_tasks():
    """Search tasks by keyword"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        keyword = request.args.get('q', '')

        if not keyword:
            return jsonify({"error": "Search keyword required"}), 400

        tasks = Task.search(session['user_id'], keyword)

        return jsonify({
            "total": len(tasks),
            "tasks": tasks
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_bp.route('/tasks/filter', methods=['GET'])
def filter_tasks():
    """Filter tasks by subject"""
    try:
        if not is_authenticated():
            return jsonify({"error": "Not authenticated"}), 401

        subject = request.args.get('subject', '')

        if not subject:
            return jsonify({"error": "Subject filter required"}), 400

        tasks = Task.filter_by_subject(session['user_id'], subject)

        return jsonify({
            "total": len(tasks),
            "tasks": tasks
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
