# routes/auth_routes.py — Register, Login, Logout
# ============================================================

from flask import (
    Blueprint, render_template, request,
    redirect, url_for, flash, session
)
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import get_db

# Blueprint groups all auth-related routes under the prefix /auth
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


# ── Register ──────────────────────────────────────────────
@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Show registration form (GET) or process sign-up (POST)."""

    # If already logged in, go home
    if session.get('user_id'):
        return redirect(url_for('index'))

    if request.method == 'POST':
        username         = request.form.get('username', '').strip()
        email            = request.form.get('email', '').strip()
        password         = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # ── Validate inputs ──
        if not username or not password:
            flash('Username and password are required.', 'error')
            return render_template('register.html')

        if len(username) < 3:
            flash('Username must be at least 3 characters.', 'error')
            return render_template('register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')

        db = get_db()

        # Check if username already taken
        existing = db.execute(
            'SELECT id FROM users WHERE username = ?', (username,)
        ).fetchone()

        if existing:
            flash('Username is already taken. Please choose another.', 'error')
            return render_template('register.html')

        # Hash the password before storing
        hashed_pw = generate_password_hash(password)

        # Insert the new user
        db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (username, email or None, hashed_pw)
        )
        db.commit()

        flash('Account created! Please log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')


# ── Login ──────────────────────────────────────────────────
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Show login form (GET) or authenticate user (POST)."""

    if session.get('user_id'):
        return redirect(url_for('index'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            flash('Please fill in all fields.', 'error')
            return render_template('login.html')

        db = get_db()
        user = db.execute(
            'SELECT * FROM users WHERE username = ?', (username,)
        ).fetchone()

        # Check user exists and password matches
        if user is None or not check_password_hash(user['password'], password):
            flash('Invalid username or password.', 'error')
            return render_template('login.html')

        # Store user info in session (server-side cookie)
        session.clear()
        session['user_id']  = user['id']
        session['username'] = user['username']
        session['is_admin'] = bool(user['is_admin'])

        flash(f'Welcome back, {user["username"]}! 👋', 'success')

        # Admins go to dashboard, others go home
        if user['is_admin']:
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('index'))

    return render_template('login.html')


# ── Logout ─────────────────────────────────────────────────
@auth_bp.route('/logout')
def logout():
    """Clear the session and redirect to login."""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
