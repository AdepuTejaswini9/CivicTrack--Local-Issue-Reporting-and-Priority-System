# models.py — Database schema and helper functions
# ============================================================
# We use raw SQLite (via Python's built-in sqlite3 module)
# so beginners can follow along without an ORM.
# ============================================================

import sqlite3
from flask import g, current_app


def get_db():
    """
    Open a database connection and store it on Flask's request context (g).
    Re-uses the same connection within a single request.
    """
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        # Return rows as dict-like objects (access by column name)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    """
    Create all tables if they don't exist yet.
    Call this once when the Flask app starts.
    """
    with app.app_context():
        db = get_db()

        # ── Users table ──
        db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                username   TEXT    NOT NULL UNIQUE,
                email      TEXT,
                password   TEXT    NOT NULL,          -- Hashed with werkzeug
                is_admin   INTEGER NOT NULL DEFAULT 0, -- 0 = regular, 1 = admin
                created_at TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        ''')

        # ── Issues table ──
        db.execute('''
            CREATE TABLE IF NOT EXISTS issues (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL,
                title       TEXT    NOT NULL,
                description TEXT    NOT NULL,
                location    TEXT,
                image_path  TEXT,                     -- Filename only, stored in /uploads
                priority    TEXT    NOT NULL DEFAULT 'Low',  -- High / Medium / Low
                status      TEXT    NOT NULL DEFAULT 'Pending', -- Pending / In Progress / Resolved
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

        db.commit()

    # Tear-down: close DB after each request
    app.teardown_appcontext(close_db)
