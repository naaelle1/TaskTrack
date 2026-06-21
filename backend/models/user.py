import uuid
import bcrypt
from database.db import execute_query, fetch_one


class User:
    @staticmethod
    def create(username, email, password):
        """Create new user"""
        try:
            user_id = str(uuid.uuid4())
            password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

            execute_query(
                "INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)",
                [user_id, username, email, password_hash]
            )

            return {"id": user_id, "username": username, "email": email}
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")

    @staticmethod
    def get_by_username(username):
        """Get user by username"""
        try:
            row = fetch_one(
                "SELECT id, username, email, password_hash, full_name, school, major, bio, created_at FROM users WHERE username = ?",
                [username]
            )

            if row:
                return {
                    "id": row[0],
                    "username": row[1],
                    "email": row[2],
                    "password_hash": row[3],
                    "full_name": row[4],
                    "school": row[5],
                    "major": row[6],
                    "bio": row[7],
                    "created_at": row[8]
                }
            return None
        except Exception as e:
            raise Exception(f"Error getting user: {str(e)}")

    @staticmethod
    def verify_password(password, password_hash):
        """Verify password"""
        return bcrypt.checkpw(password.encode(), password_hash.encode())

    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        try:
            row = fetch_one(
                "SELECT id, username, email, password_hash, full_name, school, major, bio, created_at FROM users WHERE id = ?",
                [user_id]
            )

            if row:
                return {
                    "id": row[0],
                    "username": row[1],
                    "email": row[2],
                    "full_name": row[4],
                    "school": row[5],
                    "major": row[6],
                    "bio": row[7],
                    "created_at": row[8]
                }
            return None
        except Exception as e:
            raise Exception(f"Error getting user: {str(e)}")

    @staticmethod
    def update_profile(user_id, full_name, school, major, bio):
        """Update user profile"""
        try:
            execute_query(
                "UPDATE users SET full_name = ?, school = ?, major = ?, bio = ? WHERE id = ?",
                [full_name, school, major, bio, user_id]
            )
            return User.get_by_id(user_id)
        except Exception as e:
            raise Exception(f"Error updating profile: {str(e)}")
