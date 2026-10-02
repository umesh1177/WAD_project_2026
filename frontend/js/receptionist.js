/**
 * ==========================================================================
 * DHYEY CLINIC - RECEPTIONIST PORTAL
 * Reuses exact same family.js + patient.js forms as Doctor Dashboard.
 * Only difference: submit callback pushes patient into OPD consultation queue.
 * ==========================================================================
 */

import {
  getLocalDB,
  saveLocalDB,
  getAuthSession,
  showToast,
  todayISO,
  nowTime,
  fmtDate,
  pad
} from './api.js';

import { renderFamilyRegistration } from './family.js';
import { renderPatientRegistration } from './patient.js';

// ---- Global State ----
let session = null;
let clinicId = 'demo';
let clinicData = null;    // full admin-clinic object
let db = null;
let currentView = 'dashboard';
let currentSelection = { familyId: null, patientId: null };
let globalSearchQuery = '';

const QUEUE_KEY = 'clinic_consultation_queue';

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  boot();
});

function boot() {
  session = getAuthSession();
  if (!session || !session.profile) {
    window.location.replace('../login.html');
    return;
  }

  clinicId = session.profile.activeClinicId || 'demo';

  // Resolve full clinic object from admin store (merging with session profile data)
  const adminClinics = JSON.parse(localStorage.getItem('dhyey-admin-clinics') || '[]');
  const adminClinic = adminClinics.find(c => c.id === clinicId || c.name === session.profile.clinicName);
  clinicData = {
    id: clinicId,
    name: session.profile.clinicName || adminClinic?.name || 'Dhyey Clinic',
    address: adminClinic?.address || adminClinic?.location || session.profile.clinicAddress || '',
    phone: adminClinic?.phone || adminClinic?.contact || session.profile.clinicPhone || '',
    city: adminClinic?.city || adminClinic?.district || session.profile.clinicCity || '',
    services: adminClinic?.services || session.profile.services || []
  };

  // Guard: receptionist service must be enabled
  const services = clinicData.services || [];
  if (!services.includes('receptionist')) {
    alert('This clinic has not enabled the Receptionist Service. Contact your administrator.');
    window.location.replace('../login.html');
    return;
  }

  db = getLocalDB(clinicId);
  if (!db.patientQueue) {
    try { db.patientQueue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { db.patientQueue = []; }
    saveLocalDB(db, clinicId);
  }

  setupHeader();
  setupInteractions();
  applyTheme();
  startClock();
  navigateTo('dashboard');

  // Cross-tab sync
  window.addEventListener('storage', e => {
    if (e.key === QUEUE_KEY || (e.key || '').startsWith('clinic_db_')) {
      db = getLocalDB(clinicId);
      updateQueueBadge();
      if (currentView === 'dashboard' || currentView === 'queue') renderView();
    }
  });
}

// ---- Clinic Header Setup ----
function setupHeader() {
  const cName = clinicData.name || 'Dhyey Clinic';
  const cAddress = clinicData.address || clinicData.location || '';
  const cPhone = clinicData.phone || clinicData.contact || '';
  const cCity = clinicData.city || clinicData.district || '';

  // Sidebar brand
  setEl('rec-clinic-name', cName);

  // Topbar
  setEl('rec-topbar-title', cName + ' — Reception Desk');
  setEl('rec-topbar-date', fmtDate(todayISO()));

  // Statusbar
  setEl('rec-statusbar-clinic', `<b>${cName}</b>`);

  // Page title
  document.title = `Reception Desk — ${cName}`;

  // Clinic details in sidebar footer
  const detailsEl = document.getElementById('rec-clinic-details');
  if (detailsEl) {
    detailsEl.innerHTML = [
      `<b><i class="fa-solid fa-hospital"></i> ${cName}</b>`,
      cAddress ? `<i class="fa-solid fa-location-dot"></i> ${cAddress}${cCity ? ', ' + cCity : ''}` : '',
      cPhone ? `<i class="fa-solid fa-phone"></i> ${cPhone}` : '',
    ].filter(Boolean).join('<br>');
  }

  // Profile dropdown
  const uName = session.profile.name || 'Front Desk';
  setEl('rec-user-name', uName);
  setEl('rec-dropdown-name', uName);
  setEl('rec-dropdown-clinic', cName);
  const addrEl = document.getElementById('rec-dropdown-address');
  if (addrEl) addrEl.textContent = [cAddress, cCity].filter(Boolean).join(', ');
  const phoneEl = document.getElementById('rec-dropdown-phone');
  if (phoneEl) phoneEl.textContent = cPhone ? `📞 ${cPhone}` : '';
}

function setEl(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  if (html.includes('<')) el.innerHTML = html; else el.textContent = html;
}

// ---- Theme ----
function applyTheme() {
  const theme = localStorage.getItem('clinic_theme') || 'light';
  if (theme === 'dark') document.body.classList.add('dark');
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('rec-theme-toggle');
  if (btn) btn.innerHTML = document.body.classList.contains('dark') ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

// ---- Clock ----
function startClock() {
  const tick = () => setEl('rec-statusbar-clock', nowTime());
  tick();
  setInterval(tick, 1000);
}

// ---- Queue Badge ----
function updateQueueBadge() {
  const waiting = (db.patientQueue || []).filter(q => !q.status || q.status === 'Waiting').length;
  const kbd = document.getElementById('rec-queue-kbd');
  if (!kbd) return;
  if (waiting > 0) {
    kbd.innerHTML = `<span style="background:#d32f2f;color:#fff;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:800;">${waiting}</span>`;
  } else {
    kbd.innerHTML = `<i class="fa-solid fa-clock"></i>`;
  }
}

// ---- Interactions ----
function setupInteractions() {
  // Sidebar toggle
  document.getElementById('rec-toggle-sidebar')?.addEventListener('click', () =>
    document.getElementById('rec-sidebar')?.classList.toggle('collapsed'));

  // Theme toggle
  document.getElementById('rec-theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const t = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('clinic_theme', t);
    updateThemeIcon();
  });

  // Profile dropdown
  const profileBtn = document.getElementById('rec-profile-btn');
  const dropdown = document.getElementById('rec-profile-dropdown');
  if (profileBtn && dropdown) {
    profileBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => { dropdown.style.display = 'none'; });
  }

  // Logout
  document.getElementById('rec-logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('clinic-auth-session');
    sessionStorage.clear();
    showToast('Signed out');
    setTimeout(() => window.location.replace('../login.html?logout=true'), 200);
  });

  // Nav items
  document.querySelectorAll('#rec-nav .cms-nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.view));
  });

  // Global search
  document.getElementById('rec-global-search-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const q = document.getElementById('rec-top-search')?.value?.trim() || '';
    if (!q) return;
    globalSearchQuery = q;
    navigateTo('search');
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', e => {
    const el = document.activeElement;
    const isInput = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');

    if (e.key === 'Escape') {
      const modal = document.querySelector('.cms-overlay') || document.querySelector('.cms-modal-backdrop');
      if (modal) { e.preventDefault(); modal.remove(); return; }
      if (isInput) { el.blur(); return; }
    }

    if (isInput && !e.key.startsWith('F')) return;

    if (e.key === 'F1') { e.preventDefault(); navigateTo('family'); }
    if (e.key === 'F2') { e.preventDefault(); navigateTo('member'); }
    if (e.key === 'F3') { e.preventDefault(); navigateTo('queue'); }
    if (e.key === 'F4') { e.preventDefault(); navigateTo('dashboard'); }
    if (e.key === 'F5') { e.preventDefault(); navigateTo('search'); }
    if (e.key === '/' && !isInput) {
      e.preventDefault();
      document.getElementById('rec-top-search')?.focus();
    }
  });
}

// ---- Navigation ----
function navigateTo(view, selection = null) {
  currentView = view;
  if (selection) currentSelection = selection;

  // Update nav active state
  document.querySelectorAll('#rec-nav .cms-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });

  db = getLocalDB(clinicId);
  updateQueueBadge();
  renderView();
}

// ---- View Router ----
function renderView() {
  const container = document.getElementById('rec-view-container');
  if (!container) return;
  container.innerHTML = '';

  if (currentView === 'dashboard') {
    renderDashboard(container);
  } else if (currentView === 'family') {
    // EXACT same form as doctor dashboard — only callback differs
    renderFamilyRegistration(
      container,
      (famId, patId) => {
        // "Open case" → for receptionist = push to queue
        openQueueModal(famId, patId);
      },
      (famId, patId) => {
        // "Added family, go add member" → navigate to member view
        navigateTo('member', { familyId: famId, patientId: patId, isRedirectFromHeadReg: true });
      }
    );
    // Patch submit button text after render
    patchSubmitButton(container, 'family');
  } else if (currentView === 'member') {
    // EXACT same form as doctor dashboard — only callback differs
    renderPatientRegistration(
      container,
      currentSelection.familyId || null,
      (famId, patId) => {
        // "Open case" → for receptionist = push to queue
        openQueueModal(famId, patId);
      },
      currentSelection.isRedirectFromHeadReg || false,
      () => { navigateTo('family'); },
      null
    );
    // Patch submit button text after render
    patchSubmitButton(container, 'member');
  } else if (currentView === 'queue') {
    renderQueueView(container);
  } else if (currentView === 'search') {
    renderSearchView(container);
  }
}

/**
 * After the doctor's form renders, change the primary submit button text
 * from "Save" / "Register" to "Register & Add to Patient Queue"
 */
function patchSubmitButton(container, mode) {
  // Give a tiny tick for the form to be in DOM
  setTimeout(() => {
    // Find primary submit button (cms-btn-primary type=submit)
    const primaryBtn = container.querySelector('button[type="submit"].cms-btn.cms-btn-primary')
      || container.querySelector('button[type="submit"]');
    if (primaryBtn) {
      if (mode === 'family') {
        primaryBtn.innerHTML = '<i class="fa-solid fa-users-line"></i> Register & Add to Patient Queue';
      } else {
        primaryBtn.innerHTML = '<i class="fa-solid fa-users-line"></i> Save Member & Add to Patient Queue';
      }
    }
  }, 50);
}

// ---- Dashboard View ----
function renderDashboard(container) {
  const families = Object.values(db.families || {});
  let totalPatients = 0;
  families.forEach(f => { totalPatients += Object.keys(f.patients || {}).length; });

  const queue = db.patientQueue || [];
  const waiting = queue.filter(q => !q.status || q.status === 'Waiting');
  const inConsult = queue.filter(q => q.status === 'In Consultation');
  const completed = queue.filter(q => q.status === 'Completed' || q.status === 'Done');
  const cName = clinicData.name || 'Dhyey Clinic';

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;">

      <!-- Clinic Banner -->
      <div class="cms-card" style="background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%);border:none;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-size:20px;font-weight:800;font-family:'Manrope',sans-serif;">${cName}</div>
          <div style="font-size:12px;opacity:0.85;margin-top:2px;">
            ${[clinicData.address, clinicData.city].filter(Boolean).join(', ') || 'Reception OPD Desk'}
            ${clinicData.phone ? ' &bull; ' + clinicData.phone : ''}
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <div style="text-align:right;">
            <div style="font-size:11px;opacity:0.8;">Today's Date</div>
            <div style="font-size:15px;font-weight:800;">${fmtDate(todayISO())}</div>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="cms-stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
        ${kpiCard('fa-people-roof', families.length, 'Registered Families', 'var(--primary)')}
        ${kpiCard('fa-users', totalPatients, 'Total Patients', 'var(--info)')}
        ${kpiCard('fa-clock', waiting.length, 'Waiting in Queue', 'var(--danger)')}
        ${kpiCard('fa-stethoscope', inConsult.length, 'In Consultation', 'var(--accent)')}
        ${kpiCard('fa-circle-check', completed.length, 'Completed Today', 'var(--success)')}
      </div>

      <!-- Quick Action Buttons -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
        ${quickBtn('family', 'fa-people-roof', 'Register Family Head', 'Create new family file & auto-generate ID', 'F1', 'var(--primary)', 'var(--primary-dark)')}
        ${quickBtn('member', 'fa-user-plus', 'Add Family Member', 'Add member to an existing family head', 'F2', '#0288d1', '#0277bd')}
        ${quickBtn('search', 'fa-magnifying-glass', 'Find Patient & Queue', 'Search patient and push to consultation queue', 'F5', '#7c3aed', '#6d28d9')}
        ${quickBtn('queue', 'fa-list-check', 'Manage Patient Queue', 'View and manage today\'s OPD queue', 'F3', 'var(--accent)', 'var(--accent-dark)')}
      </div>

      <!-- Live Queue Preview -->
      <div class="cms-card">
        <div class="cms-card-header">
          <div class="cms-card-title"><i class="fa-solid fa-users-line" style="color:var(--primary);"></i> Live OPD Consultation Queue</div>
          <button type="button" onclick="recNav('queue')" class="cms-btn cms-btn-ghost" style="font-size:12.5px;padding:6px 14px;">
            Manage Full Queue (F3)
          </button>
        </div>
        ${renderQueueTable(queue)}
      </div>

    </div>
  `;

  // Wire quick action buttons
  container.querySelectorAll('[data-nav-view]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.navView));
  });
}

function kpiCard(icon, val, label, color) {
  return `
    <div class="cms-stat-card">
      <div class="cms-stat-top">
        <div class="cms-stat-icon" style="background:${color}20;color:${color};"><i class="fa-solid ${icon}"></i></div>
        <div class="cms-stat-value">${val}</div>
      </div>
      <div class="cms-stat-label">${label}</div>
    </div>
  `;
}

function quickBtn(view, icon, title, sub, key, bg, bgHover) {
  return `
    <button type="button" data-nav-view="${view}"
      style="background:linear-gradient(135deg,${bg},${bgHover});color:#fff;border:none;border-radius:var(--radius-lg);padding:18px;text-align:left;cursor:pointer;box-shadow:var(--shadow-md);display:flex;justify-content:space-between;align-items:center;transition:transform .15s,box-shadow .15s;"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-lg)'"
      onmouseout="this.style.transform='';this.style.boxShadow='var(--shadow-md)'">
      <div>
        <div style="font-size:15px;font-weight:800;"><i class="fa-solid ${icon}"></i> ${title}</div>
        <div style="font-size:11.5px;opacity:0.85;margin-top:3px;">${sub}</div>
      </div>
      <span style="background:rgba(255,255,255,0.2);padding:4px 8px;border-radius:5px;font-size:11px;font-weight:800;">${key}</span>
    </button>
  `;
}

// Global nav shortcut for inline onclick
window.recNav = (view) => navigateTo(view);

// ---- Queue View ----
function renderQueueView(container) {
  const queue = db.patientQueue || [];
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:18px;">
      <div class="cms-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div>
          <div class="cms-card-title"><i class="fa-solid fa-users-line" style="color:var(--primary);"></i> Patient Consultation Queue</div>
          <div style="font-size:12px;color:var(--text-muted);">Synchronized with Doctor's consultation desk in real-time</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button type="button" onclick="recNav('search')" class="cms-btn cms-btn-primary" style="font-size:12.5px;padding:8px 16px;">
            <i class="fa-solid fa-user-plus"></i> Add Patient to Queue
          </button>
        </div>
      </div>
      <div class="cms-card">${renderQueueTable(queue)}</div>
    </div>
  `;
  wireQueueActions(container);
}

function renderQueueTable(queue) {
  if (!queue || queue.length === 0) {
    return `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
        <i class="fa-solid fa-users-slash" style="font-size:34px;display:block;margin-bottom:8px;opacity:0.4;"></i>
        <div style="font-size:15px;font-weight:700;color:var(--text);">No patients in queue right now</div>
        <p style="font-size:12px;margin-top:4px;">Register a family or find a patient to push them into the queue.</p>
        <button type="button" onclick="recNav('search')" class="cms-btn cms-btn-primary" style="margin-top:12px;padding:8px 18px;font-size:12.5px;">
          <i class="fa-solid fa-magnifying-glass"></i> Find Patient (F5)
        </button>
      </div>
    `;
  }

  const statusColor = { 'Waiting': 'var(--danger)', 'In Consultation': 'var(--success)', 'Completed': 'var(--info)', 'Done': 'var(--info)' };
  const statusBg = { 'Waiting': 'var(--danger-soft)', 'In Consultation': 'var(--success-soft)', 'Completed': 'var(--info-soft)', 'Done': 'var(--info-soft)' };

  return `
    <div class="cms-table-wrapper">
      <table class="cms-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Patient</th>
            <th>Family Head</th>
            <th>Chief Complaint</th>
            <th>Arrived</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${queue.map((q, i) => {
            const st = q.status || 'Waiting';
            const col = statusColor[st] || 'var(--text-muted)';
            const bg = statusBg[st] || 'var(--surface-alt)';
            return `
              <tr>
                <td><span class="cms-pill font-mono" style="background:var(--primary-soft);color:var(--primary-dark);font-weight:800;">${q.token || 'T-' + pad(i+1,2)}</span></td>
                <td>
                  <div style="font-weight:700;">${q.patientName || q.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);">${q.age ? q.age+'Y' : ''}${q.gender ? ' · '+q.gender : ''}</div>
                </td>
                <td style="font-size:12.5px;">${q.familyHead || '-'}</td>
                <td style="font-size:12.5px;max-width:180px;">${q.complaint || 'OPD Consultation'}</td>
                <td style="font-size:12.5px;font-family:'IBM Plex Mono',monospace;">${q.arrivedAt || '-'}</td>
                <td>
                  <span class="cms-pill" style="background:${bg};color:${col};">${st}</span>
                </td>
                <td>
                  <div style="display:flex;gap:6px;">
                    ${st === 'Waiting' ? `<button type="button" class="cms-btn cms-btn-primary queue-action-btn" data-action="consult" data-token="${q.token}" style="font-size:11px;padding:5px 10px;"><i class="fa-solid fa-stethoscope"></i> Call</button>` : ''}
                    ${st === 'In Consultation' ? `<button type="button" class="cms-btn cms-btn-ghost queue-action-btn" data-action="complete" data-token="${q.token}" style="font-size:11px;padding:5px 10px;"><i class="fa-solid fa-check"></i> Done</button>` : ''}
                    <button type="button" class="cms-btn cms-btn-danger queue-action-btn" data-action="remove" data-token="${q.token}" style="font-size:11px;padding:5px 10px;"><i class="fa-solid fa-xmark"></i></button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function wireQueueActions(container) {
  (container || document).querySelectorAll('.queue-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const token = btn.dataset.token;
      const queue = db.patientQueue || [];
      const item = queue.find(q => q.token === token);

      if (action === 'remove') {
        db.patientQueue = queue.filter(q => q.token !== token);
        saveQueue(db.patientQueue);
        showToast(`Removed token ${token} from queue`);
      } else if (item) {
        if (action === 'consult') {
          item.status = 'In Consultation';
          showToast(`${item.patientName} called for consultation`);
        } else if (action === 'complete') {
          item.status = 'Completed';
          showToast(`${item.patientName} marked as completed`);
        }
        saveQueue(queue);
      }
      db = getLocalDB(clinicId);
      renderView();
    });
  });
}

function saveQueue(queueArr) {
  db.patientQueue = queueArr;
  saveLocalDB(db, clinicId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queueArr));
  updateQueueBadge();
}

function pushToQueue(data) {
  const queue = db.patientQueue || [];
  const today = todayISO();
  const todayQ = queue.filter(q => (q.date || today) === today);
  const token = 'T-' + pad(todayQ.length + 1, 2);

  queue.push({
    token,
    patientId: data.patientId,
    patientName: data.patientName,
    name: data.patientName,
    familyId: data.familyId,
    familyHead: data.familyHead,
    age: data.age,
    gender: data.gender,
    phone: data.phone,
    area: data.area,
    complaint: data.complaint || 'OPD Consultation',
    vitals: data.vitals || {},
    arrivedAt: nowTime(),
    date: today,
    status: 'Waiting'
  });

  saveQueue(queue);
  return token;
}

// ---- Search & Push View ----
function renderSearchView(container) {
  const allPats = [];
  Object.values(db.families || {}).forEach(f => {
    Object.values(f.patients || {}).forEach(p => {
      allPats.push({ ...p, familyId: f.famId||f.id, familyHead: f.headName, familyPhone: f.phone, area: f.area });
    });
  });

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="cms-card" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
        <form id="rec-search-form" class="cms-search-box" style="flex:1;min-width:280px;">
          <span class="cms-search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
          <input type="text" id="rec-search-input" class="cms-search-input" placeholder="Type patient name, ID, family head, mobile number..." value="${globalSearchQuery}" autofocus />
        </form>
        <div style="font-size:13px;font-weight:700;color:var(--text-muted);">
          <span id="rec-search-count">${allPats.length}</span> registered patients
        </div>
      </div>
      <div id="rec-search-results" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
        ${buildSearchCards(allPats, globalSearchQuery)}
      </div>
    </div>
  `;

  container.querySelector('#rec-search-input')?.addEventListener('input', e => {
    globalSearchQuery = e.target.value;
    const grid = container.querySelector('#rec-search-results');
    if (grid) {
      grid.innerHTML = buildSearchCards(allPats, globalSearchQuery);
      wireSearchPushBtns(container);
    }
  });
  wireSearchPushBtns(container);
}

function buildSearchCards(list, q) {
  const ql = (q || '').trim().toLowerCase();
  const filtered = list.filter(p => {
    if (!ql) return true;
    return (p.name||'').toLowerCase().includes(ql)
      || (p.patId||p.id||'').toLowerCase().includes(ql)
      || (p.familyHead||'').toLowerCase().includes(ql)
      || (p.familyId||'').toLowerCase().includes(ql)
      || (p.phone||p.familyPhone||'').includes(ql)
      || (p.area||'').toLowerCase().includes(ql);
  });

  if (!filtered.length) return `
    <div style="grid-column:1/-1;" class="cms-card" style="text-align:center;padding:40px;">
      <i class="fa-solid fa-user-xmark" style="font-size:32px;opacity:0.4;display:block;margin-bottom:8px;"></i>
      <div style="font-size:15px;font-weight:700;color:var(--text);">No matching patient found</div>
      <p style="font-size:12px;margin-top:4px;color:var(--text-muted);">Register a new family to add this patient.</p>
      <button type="button" onclick="recNav('family')" class="cms-btn cms-btn-primary" style="margin-top:12px;font-size:12.5px;padding:8px 18px;">
        <i class="fa-solid fa-id-card"></i> Register Family Head (F1)
      </button>
    </div>
  `;

  return filtered.map(p => `
    <div class="cms-card" style="display:flex;flex-direction:column;gap:12px;justify-content:space-between;transition:transform .15s,box-shadow .15s;"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-md)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <span class="cms-pill cms-badge-paid font-mono" style="font-size:10px;">${p.patId||p.id}</span>
            <div style="font-size:15px;font-weight:800;color:var(--text);margin:5px 0 2px;">${p.name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${p.age?p.age+' yrs':''} ${p.gender?'· '+p.gender:''} · <b>${p.relation||'Self'}</b></div>
          </div>
          ${p.bloodGroup ? `<span class="cms-pill" style="background:var(--danger-soft);color:var(--danger);font-size:10.5px;">${p.bloodGroup}</span>` : ''}
        </div>
        <div style="background:var(--surface-alt);border-radius:var(--radius-sm);padding:8px 10px;margin-top:10px;font-size:11.5px;color:var(--text-muted);">
          <div><i class="fa-solid fa-people-roof" style="color:var(--primary);"></i> Head: <b style="color:var(--text);">${p.familyHead}</b></div>
          <div style="margin-top:2px;"><i class="fa-solid fa-phone"></i> ${p.phone||p.familyPhone||'-'} &bull; ${p.area||'General'}</div>
        </div>
      </div>
      <button type="button" class="cms-btn cms-btn-primary btn-push-queue"
        data-patid="${p.patId||p.id}" data-famid="${p.familyId}"
        style="font-size:12.5px;justify-content:center;">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Add to Patient Queue
      </button>
    </div>
  `).join('');
}

function wireSearchPushBtns(container) {
  (container || document).querySelectorAll('.btn-push-queue').forEach(btn => {
    btn.addEventListener('click', () => {
      openQueueModal(btn.dataset.famid, btn.dataset.patid);
    });
  });
}

// ---- Queue Push Modal ----
function openQueueModal(familyId, patientId) {
  db = getLocalDB(clinicId);
  const family = db.families[familyId] || Object.values(db.families||{}).find(f => f.famId===familyId || f.id===familyId);
  const patient = family?.patients
    ? (family.patients[patientId] || Object.values(family.patients).find(p => p.patId===patientId || p.id===patientId))
    : null;

  if (!family || !patient) {
    showToast('Patient data not found', 'error');
    return;
  }

  const today = todayISO();
  const q = db.patientQueue || [];
  const todayQ = q.filter(x => (x.date||today) === today);
  const previewToken = 'T-' + pad(todayQ.length + 1, 2);

  const overlay = document.createElement('div');
  overlay.className = 'cms-overlay';
  overlay.innerHTML = `
    <div class="cms-modal">
      <div class="cms-modal-header">
        <div>
          <div style="font-weight:800;font-size:16px;"><i class="fa-solid fa-users-line" style="color:var(--primary);"></i> Add to Patient Queue</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Token <b>${previewToken}</b> will be assigned</div>
        </div>
        <button type="button" id="modal-close-btn" class="cms-btn-ghost cms-btn-icon"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="cms-modal-body" style="display:flex;flex-direction:column;gap:14px;">
        <div style="background:var(--primary-soft);border:1.5px solid var(--primary);border-radius:var(--radius-md);padding:12px 16px;">
          <div style="font-weight:800;font-size:14px;color:var(--text);">${patient.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
            ${patient.age ? patient.age+' yrs' : 'Adult'} &bull; ${patient.gender||'Male'} &bull; 
            Family Head: <b>${family.headName}</b> &bull; 
            Ph: ${patient.phone||family.phone}
          </div>
        </div>
        <form id="queue-push-form" style="display:flex;flex-direction:column;gap:12px;">
          <div class="cms-form-group">
            <label class="cms-label">Chief Complaint / Reason for Visit *</label>
            <input type="text" id="q-complaint" class="cms-input" required placeholder="e.g. Fever, Headache, Routine checkup" autofocus />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">OPD Vitals (Optional)</label>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
              <input type="text" id="q-bp" class="cms-input cms-input-sm" placeholder="BP (120/80)" />
              <input type="text" id="q-pulse" class="cms-input cms-input-sm" placeholder="Pulse (72 bpm)" />
              <input type="text" id="q-temp" class="cms-input cms-input-sm" placeholder="Temp (98.6F)" />
              <input type="text" id="q-spo2" class="cms-input cms-input-sm" placeholder="SpO2 (99%)" />
              <input type="text" id="q-weight" class="cms-input cms-input-sm" placeholder="Weight (68kg)" />
            </div>
          </div>
        </form>
      </div>
      <div class="cms-modal-footer">
        <button type="button" id="modal-cancel-btn" class="cms-btn cms-btn-ghost">Cancel</button>
        <button type="button" id="modal-submit-btn" class="cms-btn cms-btn-primary">
          <i class="fa-solid fa-users-line"></i> Assign ${previewToken} &amp; Add to Queue
        </button>
      </div>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#modal-submit-btn').addEventListener('click', () => {
    const complaint = overlay.querySelector('#q-complaint')?.value?.trim();
    if (!complaint) {
      overlay.querySelector('#q-complaint').focus();
      showToast('Please enter the chief complaint', 'error');
      return;
    }
    const vitals = {};
    ['bp','pulse','temp','spo2','weight'].forEach(k => {
      const v = overlay.querySelector('#q-'+k)?.value?.trim();
      if (v) vitals[k] = v;
    });
    const token = pushToQueue({
      patientId: patient.patId||patient.id,
      patientName: patient.name,
      familyId: family.famId||family.id,
      familyHead: family.headName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone||family.phone,
      area: family.area,
      complaint,
      vitals
    });
    showToast(`${patient.name} added to queue — Token ${token}`);
    close();
    navigateTo('queue');
  });
}

