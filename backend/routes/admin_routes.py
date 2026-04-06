# routes/admin_routes.py — Admin dashboard and management
# ============================================================

from flask import (
    Blueprint, render_template, request,
    redirect, url_for, flash, session, jsonify
)
from backend.models import get_db
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


# ── Admin-only decorator ───────────────────────────────────
def admin_required(f):
    """
    Decorator that blocks non-admin users.
    Use @admin_required on any admin-only route.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('user_id'):
            flash('Please login first.', 'error')
            return redirect(url_for('auth.login'))
        if not session.get('is_admin'):
            flash('Admin access required.', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated


# ── Dashboard ─────────────────────────────────────────────
@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    """
    Show all issues in a table with stats.
    Supports ?priority=high/medium/low filter via query string.
    """
    db = get_db()
    priority_filter = request.args.get('priority', 'all').lower()

    # Base query — join with users to get the reporter's username
    base_query = '''
        SELECT issues.*, users.username
        FROM issues
        LEFT JOIN users ON issues.user_id = users.id
    '''

    if priority_filter in ('high', 'medium', 'low'):
        # SQLite is case-sensitive, use COLLATE NOCASE or title-case
        priority_title = priority_filter.capitalize()
        issues = db.execute(
            base_query + ' WHERE issues.priority = ? ORDER BY issues.created_at DESC',
            (priority_title,)
        ).fetchall()
    else:
        issues = db.execute(
            base_query + ' ORDER BY issues.created_at DESC'
        ).fetchall()

    # ── Aggregate stats ──
    all_issues = db.execute('SELECT priority, status FROM issues').fetchall()

    stats = {
        'total':       len(all_issues),
        'high':        sum(1 for i in all_issues if i['priority'] == 'High'),
        'medium':      sum(1 for i in all_issues if i['priority'] == 'Medium'),
        'low':         sum(1 for i in all_issues if i['priority'] == 'Low'),
        'pending':     sum(1 for i in all_issues if i['status'] == 'Pending'),
        'in_progress': sum(1 for i in all_issues if i['status'] == 'In Progress'),
        'resolved':    sum(1 for i in all_issues if i['status'] == 'Resolved'),
    }

    return render_template('dashboard.html', issues=issues, stats=stats)


# ── Update Status (AJAX) ──────────────────────────────────
@admin_bp.route('/update-status/<int:issue_id>', methods=['POST'])
@admin_required
def update_status(issue_id):
    """
    Receive a JSON POST with { "status": "..." } and update the DB.
    Called by the frontend JS when admin changes status dropdown.
    Returns JSON { "success": true }.
    """
    data       = request.get_json()
    new_status = data.get('status')

    # Validate — only allow these three values
    allowed_statuses = ('Pending', 'In Progress', 'Resolved')
    if new_status not in allowed_statuses:
        return jsonify({'success': False, 'error': 'Invalid status'}), 400

    db = get_db()
    db.execute(
        'UPDATE issues SET status = ? WHERE id = ?',
        (new_status, issue_id)
    )
    db.commit()

    return jsonify({'success': True})
