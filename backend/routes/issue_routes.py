# routes/issue_routes.py — Report and view issues
# ============================================================

import os
import uuid
from flask import (
    Blueprint, render_template, request,
    redirect, url_for, flash, session,
    current_app
)
from werkzeug.utils import secure_filename
from backend.models import get_db
from backend.services.priority_service import detect_priority

issue_bp = Blueprint('issue', __name__)

# ── Allowed file extension check ──
def allowed_file(filename):
    """Return True if the file extension is in the allowed list."""
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
    )


# ── Report Issue ───────────────────────────────────────────
@issue_bp.route('/report', methods=['GET', 'POST'])
def report_issue():
    """
    GET  → Show the issue submission form.
    POST → Validate, detect priority, save to DB.
    """

    # Must be logged in to report
    if not session.get('user_id'):
        flash('Please login to report an issue.', 'error')
        return redirect(url_for('auth.login'))

    if request.method == 'POST':
        title       = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        location    = request.form.get('location', '').strip()

        # Validate required fields
        if not title or not description:
            flash('Title and description are required.', 'error')
            return render_template('report_issue.html')

        # ── Auto-detect priority from keywords ──
        priority = detect_priority(title, description)

        # ── Handle image upload ──
        image_path = None
        image_file = request.files.get('image')

        if image_file and image_file.filename:
            if allowed_file(image_file.filename):
                # Create a unique filename to avoid collisions
                ext          = image_file.filename.rsplit('.', 1)[1].lower()
                unique_name  = f"{uuid.uuid4().hex}.{ext}"
                safe_name    = secure_filename(unique_name)
                upload_dir   = current_app.config['UPLOAD_FOLDER']

                # Make sure upload directory exists
                os.makedirs(upload_dir, exist_ok=True)

                image_file.save(os.path.join(upload_dir, safe_name))
                image_path = safe_name  # Store just the filename
            else:
                flash('Invalid file type. Use JPG, PNG, GIF, or WebP.', 'error')
                return render_template('report_issue.html')

        # ── Save issue to database ──
        db = get_db()
        db.execute(
            '''INSERT INTO issues
               (user_id, title, description, location, image_path, priority, status)
               VALUES (?, ?, ?, ?, ?, ?, 'Pending')''',
            (session['user_id'], title, description,
             location or None, image_path, priority)
        )
        db.commit()

        flash(f'Issue submitted! Detected priority: {priority} 🎯', 'success')
        return redirect(url_for('index'))

    return render_template('report_issue.html')
