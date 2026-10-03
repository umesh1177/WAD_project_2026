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

async function boot() {
  session = getAuthSession();
  if (!session || !session.profile) {
    window.location.replace('../login.html');
    return;
  }

  clinicId = session.profile.activeClinicId || 'demo';

  // Fetch real-time clinic info from database API
  try {
    const res = await fetch(`/api/clinic/info?clinicId=${encodeURIComponent(clinicId)}`, {
      headers: {
        'x-clinic-id': clinicId,
        ...(session.token ? { 'Authorization': `Bearer ${session.token}` } : {})
      }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        clinicData = {
          id: json.data.id || clinicId,
          name: json.data.name || session.profile.clinicName || 'Dhyey Clinic',
          address: json.data.address || '',
          phone: json.data.phone || '',
          city: json.data.city || '',
          services: json.data.services || []
        };
      }
    }
  } catch (e) {}

  if (!clinicData) {
    clinicData = {
      id: clinicId,
      name: session.profile.clinicName || 'Dhyey Clinic',
      services: session.profile.services || []
    };
  }

  // Guard: receptionist service MUST be enabled in the database for this clinic
  const services = clinicData.services || [];
  if (!services.includes('receptionist')) {
    document.body.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: sans-serif; padding: 20px;">
        <div style="max-width: 480px; width: 100%; background: #ffffff; border: 1.5px solid #fecaca; border-radius: 12px; padding: 32px 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          <div style="font-size: 42px; color: #dc2626; margin-bottom: 12px;"><i class="fa-solid fa-lock"></i></div>
          <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">Receptionist Desk Service Disabled</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            The administrator has turned off Receptionist Service for <strong>${clinicData.name}</strong>. In Doctor-Only mode, consultations and patient registration are handled directly by the doctor.
          </p>
          <a href="../login.html" style="display: inline-block; padding: 10px 22px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13.5px;">Return to Sign In</a>
        </div>
      </div>
    `;
    return;
  }

  setupHeader();
  setupInteractions();
  applyTheme();
  startClock();
  navigateTo('dashboard');
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
async function updateQueueBadge() {
  const kbd = document.getElementById('rec-queue-kbd');
  if (!kbd) return;
  try {
    const res = await apiFetch('/appointments');
    if (res.success && res.data) {
      const waiting = res.data.filter(q => !q.status || q.status === 'Waiting').length;
      if (waiting > 0) {
        kbd.innerHTML = `<span style="background:#d32f2f;color:#fff;border-radius:999px;padding:1px 6px;font-size:10px;font-weight:800;">${waiting}</span>`;
      } else {
        kbd.innerHTML = `<i class="fa-solid fa-clock"></i>`;
      }
    }
  } catch (e) { }
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

  updateQueueBadge();
  renderView();
}

// ---- View Router ----
async function renderView() {
  const container = document.getElementById('rec-view-container');
  if (!container) return;
  container.innerHTML = '';

  if (currentView === 'dashboard') {
    await renderDashboard(container);
  } else if (currentView === 'family') {
    // Reuses exact same form as doctor dashboard
    renderFamilyRegistration(
      container,
      (famId, patId) => {
        // Self (Head) selected -> directly add head to patient queue without popup
        directPushToQueue(famId, patId, 'General OPD Consultation');
      },
      (famId, patId) => {
        // Family Member selected -> redirect directly to Add Member tab with new family preselected
        showToast('Family Head registered. Now add member details.');
        navigateTo('member', { familyId: famId, patientId: patId, isRedirectFromHeadReg: true });
      }
    );
    // Setup dynamic submit button text for receptionist
    setupReceptionistFamilyForm(container);
  } else if (currentView === 'member') {
    // Reuses exact same form as doctor dashboard
    renderPatientRegistration(
      container,
      currentSelection.familyId || null,
      (famId, patId) => {
        // Member registered -> directly add member to patient queue without popup
        directPushToQueue(famId, patId, 'General OPD Consultation');
      },
      currentSelection.isRedirectFromHeadReg || false,
      () => { navigateTo('family'); },
      null
    );
    // Setup dynamic submit button text for receptionist
    setupReceptionistMemberForm(container);
  } else if (currentView === 'queue') {
    await renderQueueView(container);
  } else if (currentView === 'search') {
    await renderSearchView(container);
  }
}

/**
 * Setup submit button text and change listener for Family Head Registration form
 */
function setupReceptionistFamilyForm(container) {
  setTimeout(() => {
    const regBySelect = container.querySelector('#head-registered-by-input');
    const btnText = container.querySelector('#btn-submit-text');
    const btnIcon = container.querySelector('#btn-submit-icon');

    function updateRecButton() {
      const editCancel = container.querySelector('#btn-cancel-edit-family');
      const isEditing = editCancel && editCancel.style.display !== 'none';
      if (isEditing) {
        if (btnText) btnText.textContent = 'Update Family Head';
        if (btnIcon) btnIcon.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
        return;
      }
      const val = regBySelect?.value;
      if (val === 'Family Member') {
        if (btnText) btnText.textContent = 'Register Head & Add Member';
        if (btnIcon) btnIcon.innerHTML = '<i class="fa-solid fa-user-plus"></i>';
      } else {
        if (btnText) btnText.textContent = 'Register & Add to Patient Queue';
        if (btnIcon) btnIcon.innerHTML = '<i class="fa-solid fa-users-line"></i>';
      }
    }

    if (regBySelect) {
      regBySelect.addEventListener('change', updateRecButton);
    }
    updateRecButton();
  }, 40);
}

/**
 * Setup submit button text for Member Registration form
 */
function setupReceptionistMemberForm(container) {
  setTimeout(() => {
    const submitBtn = container.querySelector('#btn-submit-member') || container.querySelector('button[type="submit"]');
    if (submitBtn) {
      const spans = submitBtn.querySelectorAll('span');
      if (spans.length >= 2) {
        spans[0].innerHTML = '<i class="fa-solid fa-users-line"></i>';
        spans[1].textContent = 'Submit & Add to Patient Queue';
      } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-users-line"></i> Submit & Add to Patient Queue <span class="cms-kbd">Enter</span>';
      }
    }
  }, 40);
}

// ---- Direct Queue Push (No popup required) ----
async function directPushToQueue(familyId, patientId, complaint = 'General OPD Consultation', prefilledData = null) {
  const curSession = getAuthSession();
  const cId = curSession?.profile?.activeClinicId || clinicId || 'demo';

  let patName = prefilledData?.name || prefilledData?.patientName || 'Patient';
  let famHead = prefilledData?.familyHead || prefilledData?.headName || 'Self';
  let phone = prefilledData?.phone || '';
  let area = prefilledData?.area || '';
  let age = prefilledData?.age || '';
  let gender = prefilledData?.gender || 'Male';
  let finalFamId = familyId || prefilledData?.familyId || '';
  let finalPatId = patientId || prefilledData?.patId || prefilledData?.id || '';

  // If details are missing, look up from local DB / API
  if (!prefilledData || !prefilledData.name || patName === 'Patient') {
    try {
      const [patRes, famRes] = await Promise.all([
        apiFetch('/patients').catch(() => ({ data: [] })),
        apiFetch('/families').catch(() => ({ data: [] }))
      ]);
      const allPats = patRes.data || [];
      const allFams = famRes.data || [];

      const foundPat = allPats.find(p =>
        (finalPatId && (p.patId === finalPatId || p._id === finalPatId || p.id === finalPatId)) ||
        (finalFamId && (p.familyId === finalFamId || (p.familyId && (p.familyId.famId === finalFamId || p.familyId._id === finalFamId))))
      );

      if (foundPat) {
        patName = foundPat.name || patName;
        age = foundPat.age || age;
        gender = foundPat.gender || gender;
        if (foundPat.phone) phone = foundPat.phone;
        if (foundPat.area) area = foundPat.area;
        if (!finalPatId) finalPatId = foundPat.patId || foundPat._id || foundPat.id;
        if (!finalFamId) finalFamId = typeof foundPat.familyId === 'object' ? (foundPat.familyId.famId || foundPat.familyId._id) : foundPat.familyId;
      }

      const foundFam = allFams.find(f =>
        (finalFamId && (f.famId === finalFamId || f._id === finalFamId || f.id === finalFamId))
      );
      if (foundFam) {
        famHead = foundFam.headName || famHead;
        if (!phone && foundFam.phone) phone = foundFam.phone;
        if (!area && (foundFam.area || foundFam.society)) area = [foundFam.society, foundFam.area].filter(Boolean).join(', ');
      }
    } catch (e) {
      console.warn('Queue lookup fallback error:', e);
    }
  }

  try {
    const res = await apiFetch('/appointments', {
      method: 'POST',
      body: {
        patientId: finalPatId || 'PAT-0001',
        patientName: patName,
        name: patName,
        familyId: finalFamId || 'FAM-0001',
        familyHead: famHead || patName,
        age: age || '',
        gender: gender || 'Male',
        phone: phone || '',
        area: area || '',
        complaint: complaint || 'General OPD Consultation',
        reason: complaint || 'General OPD Consultation',
        vitals: prefilledData?.vitals || {},
        date: todayISO(),
        appointmentDate: todayISO(),
        status: 'Waiting',
        clinicId: cId
      }
    });

    if (res && res.data?.token) {
      showToast(`✅ Token ${res.data.token} generated: ${patName} added to Patient Queue!`);
    } else {
      showToast(`✅ ${patName} added to Patient Queue!`);
    }
  } catch (err) {
    console.error('Backend queue push error:', err);
    showToast(`Failed to add to patient queue: ${err.message || 'Error'}`, 'error');
  }

  updateQueueBadge();
  navigateTo('queue');
}


// ---- Dashboard View ----
async function renderDashboard(container) {
  let totalPatients = 0;
  let familiesCount = 0;
  let queue = [];
  try {
    const patRes = await apiFetch('/patients');
    const famRes = await apiFetch('/families');
    if (patRes.success && Array.isArray(patRes.data)) {
      totalPatients = patRes.data.length;
    }
    if (famRes.success && Array.isArray(famRes.data)) {
      familiesCount = famRes.data.length;
    } else if (patRes.success && Array.isArray(patRes.data)) {
      familiesCount = new Set(patRes.data.map(p => p.familyId && p.familyId._id ? p.familyId._id : p.familyId)).size;
    }
    const aptRes = await apiFetch('/appointments');
    if (aptRes.success && Array.isArray(aptRes.data)) queue = aptRes.data;
  } catch (e) { }

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

      <!-- KPI Summary Cards -->
      <div class="cms-stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
        ${kpiCard('fa-people-roof', familiesCount, 'Registered Families', 'var(--primary)')}
        ${kpiCard('fa-users', totalPatients, 'Total Patients', 'var(--info)')}
        ${kpiCard('fa-clock', waiting.length, 'Waiting in Queue', 'var(--danger)')}
        ${kpiCard('fa-stethoscope', inConsult.length, 'In Consultation', 'var(--accent)')}
        ${kpiCard('fa-circle-check', completed.length, 'Completed Today', 'var(--success)')}
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

// Global nav shortcut for inline onclick
window.recNav = (view) => navigateTo(view);

// ---- Queue View ----
let currentQueueTab = 'pending'; // 'pending' | 'completed'

async function renderQueueView(container) {
  let queue = [];
  try {
    const r = await apiFetch('/appointments');
    if (r.success) queue = r.data || [];
  } catch (e) { }

  const pendingQueue = queue.filter(q => !q.status || q.status === 'Waiting' || q.status === 'In Consultation');
  const completedQueue = queue.filter(q => q.status === 'Completed' || q.status === 'Done');

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:18px;">
      <div class="cms-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div class="cms-card-title"><i class="fa-solid fa-users-line" style="color:var(--primary);"></i> Patient Consultation Queue</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Synchronized with Doctor's consultation desk in real-time</div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <!-- Two Tabs: Pending / Completed -->
          <div style="display:flex;background:var(--surface-alt);padding:4px;border-radius:var(--radius-md);border:1px solid var(--border);gap:4px;">
            <button type="button" class="cms-btn cms-btn-sm queue-tab-btn ${currentQueueTab === 'pending' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="pending" style="font-size:12px;padding:6px 14px;">
              <i class="fa-solid fa-clock"></i> Pending / Waiting (${pendingQueue.length})
            </button>
            <button type="button" class="cms-btn cms-btn-sm queue-tab-btn ${currentQueueTab === 'completed' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="completed" style="font-size:12px;padding:6px 14px;">
              <i class="fa-solid fa-circle-check"></i> Completed (${completedQueue.length})
            </button>
          </div>

          <button type="button" onclick="recNav('search')" class="cms-btn cms-btn-primary" style="font-size:12px;padding:7px 14px;">
            <i class="fa-solid fa-user-plus"></i> Add Patient to Queue
          </button>
        </div>
      </div>

      <div class="cms-card" style="padding:0;overflow:hidden;">
        ${renderQueueTable(currentQueueTab === 'completed' ? completedQueue : pendingQueue, currentQueueTab)}
      </div>
    </div>
  `;
  wireQueueActions(container);
}

function renderQueueTable(list, activeTab) {
  if (!list || list.length === 0) {
    return `
      <div style="text-align:center;padding:50px 20px;color:var(--text-muted);">
        <i class="fa-solid ${activeTab === 'completed' ? 'fa-clipboard-check' : 'fa-users-slash'}" style="font-size:36px;display:block;margin-bottom:10px;opacity:0.4;"></i>
        <div style="font-size:15px;font-weight:700;color:var(--text);">${activeTab === 'completed' ? 'No completed consultations today' : 'No patients currently waiting in queue'}</div>
        <p style="font-size:12px;margin-top:4px;">${activeTab === 'completed' ? 'When patients finish consultation, they will appear here.' : 'Register a family or find a patient to push them into the queue.'}</p>
        ${activeTab === 'pending' ? `
          <button type="button" onclick="recNav('search')" class="cms-btn cms-btn-primary" style="margin-top:12px;padding:8px 18px;font-size:12.5px;">
            <i class="fa-solid fa-magnifying-glass"></i> Find Patient &amp; Queue (F5)
          </button>
        ` : ''}
      </div>
    `;
  }

  const statusColor = { 'Waiting': 'var(--danger)', 'In Consultation': 'var(--success)', 'Completed': 'var(--info)', 'Done': 'var(--info)' };
  const statusBg = { 'Waiting': 'var(--danger-soft)', 'In Consultation': 'var(--success-soft)', 'Completed': 'var(--info-soft)', 'Done': 'var(--info-soft)' };

  return `
    <div class="cms-table-wrapper" style="margin:0;">
      <table class="cms-table" style="width:100%;">
        <thead>
          <tr>
            <th style="width:90px;">Token</th>
            <th>Patient Details</th>
            <th>Family Head &amp; Contact</th>
            <th>Chief Complaint</th>
            <th>Arrived</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((q, i) => {
    const st = q.status || 'Waiting';
    const col = statusColor[st] || 'var(--text-muted)';
    const bg = statusBg[st] || 'var(--surface-alt)';
    return `
              <tr>
                <td><span class="cms-pill font-mono" style="background:var(--primary-soft);color:var(--primary-dark);font-weight:800;font-size:12px;">${q.token || 'T-' + pad(i + 1, 2)}</span></td>
                <td>
                  <div style="font-weight:800;color:var(--text);font-size:13.5px;">${q.patientName || q.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:1px;">
                    ${q.age ? q.age + ' Yrs' : 'Adult'}${q.gender ? ' · ' + q.gender : ''} · <span class="font-mono">${q.patientId || 'ID-N/A'}</span>
                  </div>
                </td>
                <td>
                  <div style="font-size:12.5px;font-weight:600;"><i class="fa-solid fa-people-roof" style="color:var(--primary);font-size:11px;"></i> ${q.familyHead || '-'}</div>
                  <div style="font-size:11px;color:var(--text-muted);">${q.phone ? '📞 ' + q.phone : (q.area || 'General')}</div>
                </td>
                <td style="font-size:12.5px;max-width:200px;">
                  <span style="font-weight:600;color:var(--text);">${q.complaint || 'OPD Consultation'}</span>
                </td>
                <td style="font-size:12px;font-family:'IBM Plex Mono',monospace;color:var(--text-muted);">${q.arrivedAt || '-'}</td>
                <td>
                  <span class="cms-pill" style="background:${bg};color:${col};font-weight:700;font-size:11px;">${st}</span>
                </td>
                <td>
                  <div style="display:flex;gap:6px;justify-content:flex-end;align-items:center;">
                    <button type="button" class="cms-btn cms-btn-ghost btn-view-queue-details" data-token="${q.token}" style="font-size:11px;padding:5px 9px;border:1px solid var(--border);" title="View Full Details">
                      <i class="fa-solid fa-eye"></i> View
                    </button>
                    ${st === 'Waiting' ? `
                      <button type="button" class="cms-btn cms-btn-primary queue-action-btn" data-action="consult" data-token="${q.token}" style="font-size:11px;padding:5px 9px;" title="Call for consultation">
                        <i class="fa-solid fa-stethoscope"></i> Call
                      </button>
                    ` : ''}
                    ${st === 'In Consultation' ? `
                      <button type="button" class="cms-btn cms-btn-ghost queue-action-btn" data-action="complete" data-token="${q.token}" style="font-size:11px;padding:5px 9px;border:1px solid var(--border);color:#059669;" title="Mark consultation completed">
                        <i class="fa-solid fa-check"></i> Done
                      </button>
                    ` : ''}
                    <button type="button" class="cms-btn cms-btn-danger queue-action-btn" data-action="remove" data-token="${q.token}" style="font-size:11px;padding:5px 8px;" title="Remove">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
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
  // Tab Switcher
  container.querySelectorAll('.queue-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentQueueTab = btn.dataset.tab;
      renderQueueView(container);
    });
  });

  // View Details Modal
  container.querySelectorAll('.btn-view-queue-details').forEach(btn => {
    btn.addEventListener('click', () => {
      openQueueDetailModal(btn.dataset.token);
    });
  });

  // Action Buttons
  container.querySelectorAll('.queue-action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      const token = btn.dataset.token;

      if (action === 'remove') {
        // Here we'd map token back to ID or query the ID. Best to hit API to find it.
        try {
          const r = await apiFetch('/appointments');
          const i = (r.data || []).find(x => x.token === token);
          if (i && i._id) await apiFetch('/appointments/' + i._id, { method: 'DELETE' });
          showToast(`Removed token ${token}`);
          renderQueueView(container);
        } catch (e) { }
      } else {
        try {
          const r = await apiFetch('/appointments');
          const item = (r.data || []).find(x => x.token === token);
          if (item && item._id) {
            const newStat = action === 'consult' ? 'In Consultation' : 'Completed';
            await apiFetch('/appointments/' + item._id, { method: 'PUT', body: { status: newStat } });
            showToast(`${item.patientName || item.name} updated to ${newStat}`);
            renderQueueView(container);
          }
        } catch (e) { }
      }
    });
  });
}

async function openQueueDetailModal(token) {
  let queue = [];
  try {
    const r = await apiFetch('/appointments');
    if (r.success) queue = r.data || [];
  } catch (e) { }

  const item = queue.find(q => q.token === token);
  if (!item) {
    showToast('Patient record not found in queue', 'error');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'cms-overlay';
  overlay.innerHTML = `
    <div class="cms-modal" style="max-width:540px;width:100%;">
      <div class="cms-modal-header" style="background:var(--primary-soft);border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="cms-pill font-mono" style="background:var(--primary);color:#fff;font-size:14px;font-weight:900;padding:4px 10px;">${item.token}</span>
          <div>
            <div style="font-weight:800;font-size:16px;color:var(--text);">${item.patientName || item.name}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">${item.age ? item.age + ' Yrs' : 'Adult'} &bull; ${item.gender || 'Male'} &bull; ID: ${item.patientId || '-'}</div>
          </div>
        </div>
        <button type="button" id="modal-detail-close" class="cms-btn-ghost cms-btn-icon"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="cms-modal-body" style="display:flex;flex-direction:column;gap:14px;padding:20px;">
        <!-- Status Banner -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--surface-alt);border-radius:var(--radius-md);border:1px solid var(--border);">
          <span style="font-size:12px;color:var(--text-muted);font-weight:600;">Queue Status</span>
          <span class="cms-pill" style="font-weight:800;font-size:11.5px;background:${item.status === 'In Consultation' ? 'var(--success-soft)' : item.status === 'Completed' ? 'var(--info-soft)' : 'var(--danger-soft)'};color:${item.status === 'In Consultation' ? 'var(--success)' : item.status === 'Completed' ? 'var(--info)' : 'var(--danger)'};">${item.status || 'Waiting'}</span>
        </div>

        <!-- Family Information -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 14px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">Family &amp; Contact</div>
          <div style="font-size:13px;line-height:1.7;">
            <div><i class="fa-solid fa-people-roof" style="color:var(--primary);width:18px;"></i> Family Head: <b>${item.familyHead || 'Self'}</b> ${item.familyId ? '(FAM ' + item.familyId + ')' : ''}</div>
            <div><i class="fa-solid fa-phone" style="color:var(--primary);width:18px;"></i> Contact Phone: <b>${item.phone || 'N/A'}</b></div>
            <div><i class="fa-solid fa-location-dot" style="color:var(--primary);width:18px;"></i> Area / Address: ${item.area || 'General Area'}</div>
          </div>
        </div>

        <!-- Chief Complaint -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 14px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;">Chief Complaint / Reason for Visit</div>
          <div style="font-size:13.5px;font-weight:600;color:var(--text);">${item.complaint || 'General OPD Consultation'}</div>
        </div>

        <!-- Pre-Consultation OPD Vitals -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:12px 14px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">OPD Vitals Recorded</div>
          ${item.vitals && (item.vitals.bp || item.vitals.pulse || item.vitals.temp || item.vitals.spo2 || item.vitals.weight) ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;">
              ${item.vitals.bp ? `<div style="background:var(--surface-alt);padding:6px 10px;border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);display:block;font-size:10px;">Blood Pressure</span><b>${item.vitals.bp}</b></div>` : ''}
              ${item.vitals.pulse ? `<div style="background:var(--surface-alt);padding:6px 10px;border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);display:block;font-size:10px;">Pulse Rate</span><b>${item.vitals.pulse}</b></div>` : ''}
              ${item.vitals.temp ? `<div style="background:var(--surface-alt);padding:6px 10px;border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);display:block;font-size:10px;">Temperature</span><b>${item.vitals.temp}</b></div>` : ''}
              ${item.vitals.spo2 ? `<div style="background:var(--surface-alt);padding:6px 10px;border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);display:block;font-size:10px;">SpO2</span><b>${item.vitals.spo2}</b></div>` : ''}
              ${item.vitals.weight ? `<div style="background:var(--surface-alt);padding:6px 10px;border-radius:6px;font-size:12px;"><span style="color:var(--text-muted);display:block;font-size:10px;">Weight</span><b>${item.vitals.weight}</b></div>` : ''}
            </div>
          ` : `
            <div style="font-size:12px;color:var(--text-muted);font-style:italic;">No pre-consultation vitals recorded.</div>
          `}
        </div>

        <div style="font-size:11.5px;color:var(--text-muted);display:flex;justify-content:space-between;">
          <span>Arrived: <b>${item.arrivedAt || 'N/A'}</b></span>
          <span>Date: <b>${item.date || todayISO()}</b></span>
        </div>
      </div>
      <div class="cms-modal-footer" style="background:var(--surface-alt);border-top:1px solid var(--border);padding:10px 16px;">
        <button type="button" id="modal-detail-done" class="cms-btn cms-btn-primary" style="margin-left:auto;padding:7px 18px;">Close</button>
      </div>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('#modal-detail-close').addEventListener('click', close);
  overlay.querySelector('#modal-detail-done').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

// Disabled local pushToQueue implementations

// ---- Search & Direct Push View ----
async function renderSearchView(container) {
  let allPats = [];
  let allFams = [];
  try {
    const [pRes, fRes] = await Promise.all([
      apiFetch('/patients').catch(() => ({ data: [] })),
      apiFetch('/families').catch(() => ({ data: [] }))
    ]);
    if (fRes.success && Array.isArray(fRes.data)) {
      allFams = fRes.data;
    }
    if (pRes.success && Array.isArray(pRes.data)) {
      const famMap = {};
      allFams.forEach(f => {
        const fid = f.famId || f._id || f.id;
        if (fid) famMap[fid] = f;
      });

      allPats = pRes.data.map(p => {
        const rawFid = p.familyId ? (typeof p.familyId === 'object' ? (p.familyId.famId || p.familyId._id || p.familyId.id) : p.familyId) : '';
        const matchedFam = famMap[rawFid] || (typeof p.familyId === 'object' ? p.familyId : null);
        return {
          ...p,
          id: p._id || p.patId,
          patId: p.patId || p._id || p.id,
          familyId: rawFid,
          familyHead: matchedFam?.headName || p.familyHead || p.name || 'Self',
          familyPhone: p.phone || matchedFam?.phone || '',
          phone: p.phone || matchedFam?.phone || '',
          area: p.area || matchedFam?.area || matchedFam?.society || 'General',
          society: p.society || matchedFam?.society || ''
        };
      });
    }
  } catch (e) {
    console.error('Error fetching patients for search:', e);
  }

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="cms-card" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:280px;">
          <div class="cms-search-box" style="flex:1;position:relative;">
            <span class="cms-search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input type="text" id="rec-search-input" class="cms-search-input" placeholder="Type patient name, ID, family head, mobile number..." value="${globalSearchQuery}" autofocus style="width:100%;padding-left:36px;" />
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:13px;font-weight:700;color:var(--text-muted);">
            <span id="rec-search-count">${allPats.length}</span> registered patients
          </div>
          <button type="button" onclick="recNav('family')" class="cms-btn cms-btn-primary cms-btn-sm" style="font-size:12px;padding:7px 14px;">
            <i class="fa-solid fa-user-plus"></i> Register New Family (F1)
          </button>
        </div>
      </div>
      <div id="rec-search-results" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px;">
        ${buildSearchCards(allPats, globalSearchQuery)}
      </div>
    </div>
  `;

  const inputEl = container.querySelector('#rec-search-input');
  const countEl = container.querySelector('#rec-search-count');
  const resultsGrid = container.querySelector('#rec-search-results');

  if (inputEl) {
    inputEl.focus();
    inputEl.addEventListener('input', (e) => {
      globalSearchQuery = e.target.value;
      if (resultsGrid) {
        resultsGrid.innerHTML = buildSearchCards(allPats, globalSearchQuery);
        wireSearchPushBtns(resultsGrid, allPats);
      }
      const filteredCount = getFilteredPatients(allPats, globalSearchQuery).length;
      if (countEl) countEl.textContent = filteredCount;
    });
  }

  wireSearchPushBtns(resultsGrid, allPats);
}

function getFilteredPatients(list, q) {
  const ql = (q || '').trim().toLowerCase();
  if (!ql) return list;
  return list.filter(p =>
    (p.name || '').toLowerCase().includes(ql) ||
    (p.patId || p.id || '').toLowerCase().includes(ql) ||
    (p.familyHead || '').toLowerCase().includes(ql) ||
    (p.familyId || '').toLowerCase().includes(ql) ||
    (p.phone || p.familyPhone || '').includes(ql) ||
    (p.area || '').toLowerCase().includes(ql) ||
    (p.society || '').toLowerCase().includes(ql)
  );
}

function buildSearchCards(list, q) {
  const filtered = getFilteredPatients(list, q);

  if (!filtered.length) {
    return `
      <div style="grid-column:1/-1;" class="cms-card" style="text-align:center;padding:45px 20px;">
        <i class="fa-solid fa-user-xmark" style="font-size:36px;opacity:0.4;display:block;margin-bottom:10px;color:var(--text-muted);"></i>
        <div style="font-size:16px;font-weight:800;color:var(--text);">No matching patient found</div>
        <p style="font-size:12.5px;margin-top:4px;color:var(--text-muted);">
          ${q ? `No patient or family found matching "<b>${q}</b>".` : 'No registered patients found for this clinic.'}
        </p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;">
          <button type="button" onclick="recNav('family')" class="cms-btn cms-btn-primary" style="font-size:12.5px;padding:8px 18px;">
            <i class="fa-solid fa-id-card"></i> Register Family Head (F1)
          </button>
          <button type="button" onclick="recNav('member')" class="cms-btn cms-btn-ghost" style="font-size:12.5px;padding:8px 18px;border:1px solid var(--border);">
            <i class="fa-solid fa-user-plus"></i> Add Member (F2)
          </button>
        </div>
      </div>
    `;
  }

  return filtered.map(p => `
    <div class="cms-card" style="display:flex;flex-direction:column;gap:12px;justify-content:space-between;border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;transition:transform .15s,box-shadow .15s;"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-md)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <span class="cms-pill cms-badge-paid font-mono" style="font-size:11px;font-weight:800;">${p.patId || p.id}</span>
            <div style="font-size:15px;font-weight:800;color:var(--text);margin:6px 0 2px;">${p.name}</div>
            <div style="font-size:12px;color:var(--text-muted);">${p.age ? p.age + ' Yrs' : 'Adult'} ${p.gender ? '· ' + p.gender : ''} · <b style="color:var(--primary);">${p.relation || 'Self'}</b></div>
          </div>
          ${p.bloodGroup ? `<span class="cms-pill" style="background:var(--danger-soft);color:var(--danger);font-size:10.5px;font-weight:700;">${p.bloodGroup}</span>` : ''}
        </div>
        <div style="background:var(--surface-alt);border-radius:var(--radius-sm);padding:9px 11px;margin-top:10px;font-size:11.5px;color:var(--text-muted);border:1px solid var(--border-subtle, var(--border));">
          <div><i class="fa-solid fa-people-roof" style="color:var(--primary);width:16px;"></i> Head: <b style="color:var(--text);">${p.familyHead}</b> ${p.familyId ? `(FAM ${p.familyId})` : ''}</div>
          <div style="margin-top:3px;"><i class="fa-solid fa-phone" style="color:var(--primary);width:16px;"></i> ${p.phone || p.familyPhone || '-'} &bull; ${p.area || 'General'}</div>
        </div>
      </div>
      <button type="button" class="cms-btn cms-btn-primary btn-push-queue"
        data-patid="${p.patId || p.id}" data-famid="${p.familyId}"
        style="font-size:12.5px;justify-content:center;padding:8px 14px;font-weight:700;">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Add to Patient Queue
      </button>
    </div>
  `).join('');
}

function wireSearchPushBtns(containerEl, allPatsList) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.btn-push-queue').forEach(btn => {
    btn.addEventListener('click', () => {
      const patId = btn.getAttribute('data-patid');
      const famId = btn.getAttribute('data-famid');
      const matched = (allPatsList || []).find(p => p.patId === patId || p.id === patId || p._id === patId);
      directPushToQueue(famId, patId, 'General OPD Consultation', matched);
    });
  });
}


