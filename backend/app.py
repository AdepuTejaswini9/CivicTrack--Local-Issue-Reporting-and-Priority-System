# backend/app.py — Flask application factory
# ============================================================
# This file creates and configures the Flask app.
# It registers all blueprints (route groups) and sets up the DB.
# ============================================================

import os
from flask import Flask, render_template, session, send_from_directory
from backend.config import Config
from backend.models import init_db, get_db


def create_app():
    """
    Application factory function.
    Returns a configured Flask app instance.
    """

    # Point Flask to the frontend folder for templates and static files
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend', 'templates'),
        static_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend', 'static'),
    )

    # Load config from Config class
    app.config.from_object(Config)

    # Ensure the uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['DATABASE']), exist_ok=True)

    # ── Initialize the database (creates tables) ──
    init_db(app)

    # ── Register route Blueprints ──
    from backend.routes.auth_routes  import auth_bp
    from backend.routes.issue_routes import issue_bp
    from backend.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(issue_bp)
    app.register_blueprint(admin_bp)

    # ── Home route ────────────────────────────────────────
    @app.route('/')
    def index():
        """
        Home page — display all issues (newest first).
        Join with users table to show reporter username.
        """
        db = get_db()
        issues = db.execute(
            '''SELECT issues.*, users.username
               FROM issues
               LEFT JOIN users ON issues.user_id = users.id
               ORDER BY issues.created_at DESC'''
        ).fetchall()
        return render_template('index.html', issues=issues)

    # ── Serve uploaded images ──────────────────────────────
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        """Serve user-uploaded images from the uploads folder."""
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # ── Seed admin account (first-run convenience) ─────────
    _seed_admin(app)

    return app


def _seed_admin(app):
    """
    Create a default admin user on first run if none exists.
    Credentials:  username=admin  password=admin123
    ⚠️  Change this password immediately in production!
    """
    with app.app_context():
        from werkzeug.security import generate_password_hash
        db = get_db()

        # Check if admin already exists
        admin = db.execute(
            'SELECT id FROM users WHERE username = ?', ('admin',)
        ).fetchone()

        if not admin:
            db.execute(
                'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)',
                ('admin', 'admin@civictrack.local', generate_password_hash('admin123'))
            )
            db.commit()
            print('✅ Default admin created → username: admin | password: admin123')
