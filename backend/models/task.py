import uuid
from database.db import execute_query, fetch_one, fetch_all


class Task:
    @staticmethod
    def _row_to_dict(row):
        """Convert a database row to a task dictionary"""
        if not row:
            return None
        return {
            "id": row[0],
            "title": row[1],
            "subject": row[2],
            "deadline": row[3],
            "priority": row[4],
            "status": row[5],
            "user_id": row[6],
            "created_at": row[7]
        }

    @staticmethod
    def create(title, subject, deadline, priority, user_id):
        """Create new task"""
        try:
            task_id = str(uuid.uuid4())

            execute_query(
                """INSERT INTO tasks
                (id, title, subject, deadline, priority, status, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                [task_id, title, subject, deadline, priority, "pending", user_id]
            )

            return {
                "id": task_id,
                "title": title,
                "subject": subject,
                "deadline": deadline,
                "priority": priority,
                "status": "pending"
            }
        except Exception as e:
            raise Exception(f"Error creating task: {str(e)}")

    @staticmethod
    def get_all_by_user(user_id):
        """Get all tasks for user"""
        try:
            rows = fetch_all(
                "SELECT id, title, subject, deadline, priority, status, user_id, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
                [user_id]
            )

            return [Task._row_to_dict(row) for row in rows]
        except Exception as e:
            raise Exception(f"Error getting tasks: {str(e)}")

    @staticmethod
    def get_by_id(task_id):
        """Get single task by ID"""
        try:
            row = fetch_one(
                "SELECT id, title, subject, deadline, priority, status, user_id, created_at FROM tasks WHERE id = ?",
                [task_id]
            )

            return Task._row_to_dict(row)
        except Exception as e:
            raise Exception(f"Error getting task: {str(e)}")

    @staticmethod
    def update(task_id, title=None, subject=None, deadline=None, priority=None, status=None):
        """Update task"""
        try:
            updates = []
            params = []

            if title:
                updates.append("title = ?")
                params.append(title)
            if subject:
                updates.append("subject = ?")
                params.append(subject)
            if deadline:
                updates.append("deadline = ?")
                params.append(deadline)
            if priority:
                updates.append("priority = ?")
                params.append(priority)
            if status:
                updates.append("status = ?")
                params.append(status)

            if not updates:
                return None

            params.append(task_id)
            query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?"

            execute_query(query, params)

            return Task.get_by_id(task_id)
        except Exception as e:
            raise Exception(f"Error updating task: {str(e)}")

    @staticmethod
    def delete(task_id):
        """Delete task"""
        try:
            execute_query("DELETE FROM tasks WHERE id = ?", [task_id])
            return True
        except Exception as e:
            raise Exception(f"Error deleting task: {str(e)}")

    @staticmethod
    def search(user_id, keyword):
        """Search tasks by keyword"""
        try:
            rows = fetch_all(
                """SELECT id, title, subject, deadline, priority, status, user_id, created_at FROM tasks
                WHERE user_id = ? AND (title LIKE ? OR subject LIKE ?)
                ORDER BY created_at DESC""",
                [user_id, f"%{keyword}%", f"%{keyword}%"]
            )

            return [Task._row_to_dict(row) for row in rows]
        except Exception as e:
            raise Exception(f"Error searching tasks: {str(e)}")

    @staticmethod
    def filter_by_subject(user_id, subject):
        """Filter tasks by subject"""
        try:
            rows = fetch_all(
                "SELECT id, title, subject, deadline, priority, status, user_id, created_at FROM tasks WHERE user_id = ? AND subject = ? ORDER BY created_at DESC",
                [user_id, subject]
            )

            return [Task._row_to_dict(row) for row in rows]
        except Exception as e:
            raise Exception(f"Error filtering tasks: {str(e)}")
