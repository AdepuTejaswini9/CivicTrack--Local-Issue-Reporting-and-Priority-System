// ============================================================
// Local Issue Reporting System — Frontend JavaScript
// ============================================================

/* ── File Upload / Drag-Drop ── */
const uploadZone    = document.getElementById('uploadZone');
const fileInput     = document.getElementById('fileInput');
const previewContainer = document.getElementById('preview-container');

if (uploadZone && fileInput) {

  // Click zone → open file picker
  uploadZone.addEventListener('click', () => fileInput.click());

  // Drag events
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFilePreview(file);
  });

  // File chosen via picker
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) handleFilePreview(file);
  });
}

/**
 * Show a preview image when a file is selected.
 * @param {File} file
 */
function handleFilePreview(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file (JPG, PNG, etc.)', 'error');
    return;
  }
  // Assign file to the real input
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (previewContainer) {
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    }
    const label = document.querySelector('#uploadZone p');
    if (label) label.innerHTML = `<strong>${file.name}</strong> selected`;
  };
  reader.readAsDataURL(file);
}

/* ── Priority Live-Preview ── */
// Show which priority will be detected as user types
const titleInput = document.getElementById('title');
const descInput  = document.getElementById('description');
const priorityPreview = document.getElementById('priorityPreview');

const HIGH_KEYWORDS   = ['accident', 'fire', 'flood', 'emergency', 'danger', 'collapse', 'explosion', 'injury'];
const MEDIUM_KEYWORDS = ['garbage', 'traffic', 'streetlight', 'pothole', 'leak', 'noise', 'sewage', 'broken'];
const LOW_KEYWORDS    = ['suggestion', 'feedback', 'improvement', 'request'];

function detectPriorityLocal(text) {
  const lower = text.toLowerCase();
  if (HIGH_KEYWORDS.some(kw => lower.includes(kw)))   return 'high';
  if (MEDIUM_KEYWORDS.some(kw => lower.includes(kw))) return 'medium';
  if (LOW_KEYWORDS.some(kw => lower.includes(kw)))    return 'low';
  return null;
}

function updatePriorityPreview() {
  if (!priorityPreview) return;
  const combined = (titleInput ? titleInput.value : '') + ' ' + (descInput ? descInput.value : '');
  const priority = detectPriorityLocal(combined);
  if (priority) {
    const labels = { high: '🔴 High Priority', medium: '🟡 Medium Priority', low: '🟢 Low Priority' };
    priorityPreview.innerHTML = `
      <span class="badge badge-${priority}" style="font-size:0.82rem">
        ${labels[priority]} <span style="opacity:0.7;font-weight:400">(auto-detected)</span>
      </span>`;
    priorityPreview.style.display = 'block';
  } else {
    priorityPreview.style.display = 'none';
  }
}

if (titleInput) titleInput.addEventListener('input', updatePriorityPreview);
if (descInput)  descInput.addEventListener('input', updatePriorityPreview);

/* ── Dashboard Filtering ── */
const filterChips = document.querySelectorAll('.filter-chip');
const issueRows   = document.querySelectorAll('.issue-row');

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    // Toggle active state
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const filter = chip.dataset.filter; // 'all', 'high', 'medium', 'low'

    issueRows.forEach(row => {
      if (filter === 'all' || row.dataset.priority === filter) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // Update visible count
    const visible = [...issueRows].filter(r => r.style.display !== 'none').length;
    const countEl = document.getElementById('visibleCount');
    if (countEl) countEl.textContent = visible;
  });
});

/* ── Status Update (Admin) ── */
document.querySelectorAll('.status-select').forEach(select => {
  select.addEventListener('change', function () {
    const issueId = this.dataset.issueId;
    const newStatus = this.value;
    const row = this.closest('tr');

    fetch(`/admin/update-status/${issueId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Status updated!', 'success');
        // Update status badge in the row
        const badgeCell = row.querySelector('.status-badge-cell');
        if (badgeCell) {
          const cls = newStatus === 'In Progress' ? 'inprogress'
                    : newStatus === 'Resolved'    ? 'resolved'
                    : 'pending';
          badgeCell.innerHTML = `<span class="badge badge-${cls}">${newStatus}</span>`;
        }
      } else {
        showToast('Failed to update status', 'error');
      }
    })
    .catch(() => showToast('Network error', 'error'));
  });
});

/* ── Toast Notification ── */
/**
 * Show a small toast message at the bottom of the screen.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  // Remove existing toast
  const old = document.getElementById('toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#3ecf8e' : type === 'error' ? '#ff4d6d' : '#4f8ef7'};
    color: ${type === 'success' ? '#0f1117' : '#fff'};
    padding: 10px 22px; border-radius: 24px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 0.88rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: fadeUp 0.25s ease;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ── Auto-dismiss flash messages ── */
document.querySelectorAll('.alert').forEach(alert => {
  setTimeout(() => {
    alert.style.transition = 'opacity 0.4s ease';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 400);
  }, 4000);
});

/* ── Mobile nav toggle ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

/* ── Confirm delete ── */
document.querySelectorAll('.btn-delete').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (!confirm('Are you sure you want to delete this issue?')) {
      e.preventDefault();
    }
  });
});

/* ── Form submission loading state ── */
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function () {
    const submitBtn = this.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      const original = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="spinner"></span> Please wait...`;
      // Re-enable after 5s as fallback
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }, 5000);
    }
  });
});
