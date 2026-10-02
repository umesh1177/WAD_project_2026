/**
 * ==========================================================================
 * DHYEY CLINIC - RECEPTIONIST PORTAL & PATIENT QUEUE DISPATCHER
 * Fully integrated with Clinic Database, Family IDs, and Doctor Workspace
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
  pad,
  generateFamilyId
} from './api.js';

// Global state
let session = null;
let clinicId = 'demo';
let db = null;
let currentView = 'dashboard'; // 'dashboard' | 'reg' | 'member' | 'queue' | 'search'
let selectedFamilyForMember = null;
let queueSearchQuery = '';
let globalSearchQuery = '';

// Storage Keys
const QUEUE_STORAGE_KEY = 'clinic_consultation_queue';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initReceptionistApp();
});

export function initReceptionistApp() {
  session = getAuthSession();
  clinicId = session?.profile?.activeClinicId || 'demo';

  // Check clinic receptionist service authorization
  const adminClinics = JSON.parse(localStorage.getItem('dhyey-admin-clinics') || '[]');
  const matchedClinic = adminClinics.find(c => c.id === clinicId || c.name === session?.profile?.clinicName);
  const services = matchedClinic?.services || session?.profile?.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'];

  if (!services.includes('receptionist')) {
    alert('This clinic has not enabled the Receptionist Service. Please contact your clinic administrator.');
    window.location.href = '../login.html';
    return;
  }

  loadClinicData();
  setupUIHeader();
  setupKeyboardShortcuts();
  setupLiveClock();

  // Initial render
  switchView('dashboard');

  // Multi-tab synchronization listener
  window.addEventListener('storage', (e) => {
    if (e.key === QUEUE_STORAGE_KEY || e.key?.startsWith('clinic_db_')) {
      loadClinicData();
      updateBadgeCounts();
      if (currentView === 'queue' || currentView === 'dashboard') {
        renderCurrentView();
      }
    }
  });
}

function loadClinicData() {
  db = getLocalDB(clinicId);
  if (!db.patientQueue) {
    db.patientQueue = getQueueFromLocalStorage() || [];
    saveLocalDB(db, clinicId);
  }
}

function getQueueFromLocalStorage() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return [];
  }
}

function saveQueueData(queueList) {
  db.patientQueue = queueList;
  saveLocalDB(db, clinicId);
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueList));
  // Broadcast update
  window.dispatchEvent(new CustomEvent('clinic-queue-updated', { detail: { queue: queueList } }));
  updateBadgeCounts();
}

function getNextTokenNumber() {
  const today = todayISO();
  const queue = db.patientQueue || [];
  const todayQueue = queue.filter(q => (q.date || q.arrivedDate || todayISO()) === today);
  const nextNum = todayQueue.length + 1;
  return `T-${pad(nextNum, 2)}`;
}

function setupUIHeader() {
  const clinicNameEl = document.getElementById('sb-clinic-name');
  const clinicFooterEl = document.getElementById('sb-clinic-footer');
  const headerDateEl = document.getElementById('headerDate');

  const name = session?.profile?.clinicName || session?.profile?.clinics?.[0]?.name || 'Dhyey Clinic & Nursing Home';
  if (clinicNameEl) clinicNameEl.textContent = name;
  if (clinicFooterEl) clinicFooterEl.textContent = `${name} · Reception OPD Desk`;
  if (headerDateEl) headerDateEl.textContent = fmtDate(todayISO());

  updateBadgeCounts();
}

function updateBadgeCounts() {
  const queue = db.patientQueue || [];
  const waitingCount = queue.filter(q => q.status === 'Waiting' || !q.status).length;
  const badge = document.getElementById('queue-count-badge');
  if (badge) {
    badge.textContent = waitingCount > 0 ? `${waitingCount} Waiting` : 'F3';
    badge.style.background = waitingCount > 0 ? '#dc2626' : 'rgba(255,255,255,0.15)';
    badge.style.color = '#ffffff';
  }
}

function setupLiveClock() {
  const clockEl = document.getElementById('receptionClock');
  if (!clockEl) return;
  const update = () => {
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    if (e.key === 'F1') { e.preventDefault(); switchView('reg'); }
    else if (e.key === 'F2') { e.preventDefault(); switchView('member'); }
    else if (e.key === 'F3') { e.preventDefault(); switchView('queue'); }
    else if (e.key === 'F4') { e.preventDefault(); switchView('dashboard'); }
    else if (e.key === 'F5') { e.preventDefault(); switchView('search'); }
    else if (e.key === '/') {
      e.preventDefault();
      const s = document.getElementById('globalSearchInput');
      if (s) s.focus();
    }
  });
}

// Global View Switcher
window.switchView = function(viewName, params = null) {
  currentView = viewName;
  loadClinicData();

  // Update sidebar active links
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
  const activeNav = document.getElementById(
    viewName === 'dashboard' ? 'nav-dashboard' :
    viewName === 'reg' ? 'nav-reg' :
    viewName === 'member' ? 'nav-member' :
    viewName === 'queue' ? 'nav-queue-mgmt' :
    'nav-search'
  );
  if (activeNav) activeNav.classList.add('active');

  // Update top title
  const titleEl = document.getElementById('view-title');
  if (titleEl) {
    if (viewName === 'dashboard') titleEl.innerHTML = '<i class="fa-solid fa-gauge-high"></i> Reception OPD Overview';
    else if (viewName === 'reg') titleEl.innerHTML = '<i class="fa-solid fa-id-card"></i> Register New Family Head';
    else if (viewName === 'member') titleEl.innerHTML = '<i class="fa-solid fa-user-plus"></i> Add Family Member';
    else if (viewName === 'queue') titleEl.innerHTML = '<i class="fa-solid fa-list-check"></i> Patient Consultation Queue';
    else if (viewName === 'search') titleEl.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Find Patient & Push to Queue';
  }

  renderCurrentView(params);
};

function renderCurrentView(params = null) {
  const container = document.getElementById('mainContent');
  if (!container) return;

  if (currentView === 'dashboard') renderDashboardView(container);
  else if (currentView === 'reg') renderFamilyRegView(container);
  else if (currentView === 'member') renderAddMemberView(container, params);
  else if (currentView === 'queue') renderPatientQueueView(container);
  else if (currentView === 'search') renderSearchPatientView(container);
}

// =========================================================
// 1. DASHBOARD OVERVIEW VIEW
// =========================================================
function renderDashboardView(container) {
  const families = Object.values(db.families || {});
  let totalPatientsCount = 0;
  families.forEach(f => {
    totalPatientsCount += Object.keys(f.patients || {}).length;
  });

  const queue = db.patientQueue || [];
  const waitingPatients = queue.filter(q => q.status === 'Waiting' || !q.status);
  const inConsultationPatients = queue.filter(q => q.status === 'In Consultation');
  const completedPatients = queue.filter(q => q.status === 'Completed' || q.status === 'Done');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Top KPI Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        
        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(20,107,92,0.1); color: var(--primary-teal, #146B5C); display: flex; align-items: center; justify-content: center; font-size: 20px;">
            <i class="fa-solid fa-people-roof"></i>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted, #64748b); font-weight: 600;">Registered Families</div>
            <div style="font-size: 24px; font-weight: 800; color: var(--text-main, #0f172a);">${families.length}</div>
          </div>
        </div>

        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(2,132,199,0.1); color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted, #64748b); font-weight: 600;">Total Patients</div>
            <div style="font-size: 24px; font-weight: 800; color: var(--text-main, #0f172a);">${totalPatientsCount}</div>
          </div>
        </div>

        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(220,38,38,0.1); color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted, #64748b); font-weight: 600;">Waiting in Queue</div>
            <div style="font-size: 24px; font-weight: 800; color: #dc2626;">${waitingPatients.length}</div>
          </div>
        </div>

        <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.1); color: #059669; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted, #64748b); font-weight: 600;">Today Completed</div>
            <div style="font-size: 24px; font-weight: 800; color: #059669;">${completedPatients.length}</div>
          </div>
        </div>

      </div>

      <!-- Quick Action Shortcuts -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
        <button type="button" onclick="switchView('reg')" style="background: linear-gradient(135deg, #146B5C, #0d7e74); color: white; border: none; border-radius: var(--radius-md, 8px); padding: 16px; text-align: left; cursor: pointer; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 800;"><i class="fa-solid fa-id-card"></i> Register Family Head</div>
            <div style="font-size: 11.5px; opacity: 0.85; margin-top: 2px;">Create new family file &amp; auto-generate ID</div>
          </div>
          <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">F1</span>
        </button>

        <button type="button" onclick="switchView('member')" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; border: none; border-radius: var(--radius-md, 8px); padding: 16px; text-align: left; cursor: pointer; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 800;"><i class="fa-solid fa-user-plus"></i> Add Family Member</div>
            <div style="font-size: 11.5px; opacity: 0.85; margin-top: 2px;">Add member to existing family</div>
          </div>
          <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">F2</span>
        </button>

        <button type="button" onclick="switchView('search')" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border: none; border-radius: var(--radius-md, 8px); padding: 16px; text-align: left; cursor: pointer; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 800;"><i class="fa-solid fa-magnifying-glass"></i> Find Patient &amp; Queue</div>
            <div style="font-size: 11.5px; opacity: 0.85; margin-top: 2px;">Search patient and push to doctor queue</div>
          </div>
          <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">F5</span>
        </button>
      </div>

      <!-- Live Queue Panel -->
      <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 20px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 800; margin: 0; color: var(--text-main, #0f172a);">
              <i class="fa-solid fa-list-check" style="color: var(--primary-teal, #146B5C);"></i> Live OPD Consultation Queue
            </h3>
            <span style="font-size: 12px; color: var(--text-muted, #64748b);">Pushed patients waiting for doctor consultation</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" onclick="switchView('queue')" class="btn-start-consult" style="padding: 6px 14px;">
              Manage Full Queue (F3)
            </button>
          </div>
        </div>

        ${renderQueueListHTML(queue)}
      </div>

    </div>
  `;
}

// =========================================================
// 2. REGISTER FAMILY HEAD VIEW (F1)
// =========================================================
function renderFamilyRegView(container) {
  const year = new Date().getFullYear();
  const nextFamId = generateFamilyId(clinicId, year, Object.keys(db.families || {}).length + 1);

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 24px; box-shadow: var(--shadow-sm);">
      
      <div style="border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0;">
            <i class="fa-solid fa-id-card" style="color: var(--primary-teal, #146B5C);"></i> Register New Family Head
          </h2>
          <p style="font-size: 12px; color: var(--text-muted, #64748b); margin-top: 3px;">
            Creates a unified family record. The Head is automatically enrolled as the first patient member.
          </p>
        </div>
        <div style="background: rgba(20,107,92,0.1); border: 1px dashed var(--primary-teal, #146B5C); border-radius: 6px; padding: 6px 14px; text-align: right;">
          <span style="font-size: 11px; font-weight: 700; color: var(--primary-teal, #146B5C); display: block;">AUTO-ASSIGNED FAMILY ID</span>
          <span class="font-mono" style="font-size: 14px; font-weight: 900; color: #111;">${nextFamId}</span>
        </div>
      </div>

      <form id="form-receptionist-family-reg" style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Row 1: Surname, Head Name, Father/Husband -->
        <div style="display: grid; grid-template-columns: 1fr 1.5fr 1.2fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Surname *</label>
            <input type="text" id="reg-surname" class="top-search-input" required placeholder="e.g. PATEL" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; font-weight: 700;" autofocus />
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Head First Name *</label>
            <input type="text" id="reg-head-name" class="top-search-input" required placeholder="e.g. RAMESHBHAI" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; font-weight: 700;" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Father / Husband Name</label>
            <input type="text" id="reg-father-name" class="top-search-input" placeholder="e.g. GOVINDBHAI" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
          </div>
        </div>

        <!-- Row 2: Phone, Area, Address -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Primary Mobile Phone *</label>
            <input type="tel" id="reg-phone" class="top-search-input" required placeholder="10-digit Mobile" maxlength="10" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; font-weight: 700;" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Area / Locality *</label>
            <input type="text" id="reg-area" class="top-search-input" required placeholder="e.g. VASTRAPUR" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Full Address</label>
            <input type="text" id="reg-address" class="top-search-input" placeholder="House No, Society / Apt" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
          </div>
        </div>

        <!-- Row 3: Age, Gender, Blood Group for Head Patient Profile -->
        <div style="background: rgba(20,107,92,0.04); border: 1px solid rgba(20,107,92,0.15); border-radius: 8px; padding: 14px;">
          <span style="font-size: 12px; font-weight: 800; color: var(--primary-teal, #146B5C); display: block; margin-bottom: 8px;">
            <i class="fa-solid fa-user"></i> Head Patient Profile Details
          </span>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
            <div>
              <label style="display: block; font-size: 11.5px; font-weight: 600; color: var(--text-muted, #64748b); margin-bottom: 3px;">Age</label>
              <input type="number" id="reg-age" class="top-search-input" min="1" max="120" placeholder="e.g. 45" style="width: 100%; padding: 7px 10px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
            </div>
            <div>
              <label style="display: block; font-size: 11.5px; font-weight: 600; color: var(--text-muted, #64748b); margin-bottom: 3px;">Gender</label>
              <select id="reg-gender" class="top-search-input" style="width: 100%; padding: 7px 10px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;">
                <option value="Male" selected>Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 11.5px; font-weight: 600; color: var(--text-muted, #64748b); margin-bottom: 3px;">Blood Group</label>
              <select id="reg-blood" class="top-search-input" style="width: 100%; padding: 7px 10px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;">
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Optional: Immediately Push Head to Consultation Queue -->
        <div style="background: rgba(2,132,199,0.05); border: 1px dashed rgba(2,132,199,0.3); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="reg-push-queue-check" style="width: 18px; height: 18px; cursor: pointer;" checked />
          <label for="reg-push-queue-check" style="font-size: 12.5px; font-weight: 700; color: #0369a1; cursor: pointer; margin: 0;">
            Immediately push this Family Head into Patient Consultation Queue (Doctor OPD)
          </label>
        </div>

        <!-- Submit & Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 14px;">
          <button type="button" onclick="switchView('dashboard')" style="background: none; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <button type="submit" class="btn-start-consult" style="padding: 10px 24px; font-size: 13.5px;">
            <i class="fa-solid fa-floppy-disk"></i> Register Family &amp; Save
          </button>
        </div>

      </form>

    </div>
  `;

  const form = container.querySelector('#form-receptionist-family-reg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const surname = container.querySelector('#reg-surname').value.trim().toUpperCase();
    const headName = container.querySelector('#reg-head-name').value.trim().toUpperCase();
    const fatherName = container.querySelector('#reg-father-name').value.trim().toUpperCase();
    const phone = container.querySelector('#reg-phone').value.trim();
    const area = container.querySelector('#reg-area').value.trim().toUpperCase();
    const address = container.querySelector('#reg-address').value.trim();
    const age = container.querySelector('#reg-age').value.trim();
    const gender = container.querySelector('#reg-gender').value;
    const bloodGroup = container.querySelector('#reg-blood').value;
    const pushQueue = container.querySelector('#reg-push-queue-check').checked;

    const fullHeadName = `${surname} ${headName} ${fatherName}`.trim();
    const famId = nextFamId;
    const patId = `PAT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Create Head patient record
    const headPatient = {
      id: patId,
      patId: patId,
      name: fullHeadName,
      age: age || '35',
      gender: gender,
      relation: 'Self',
      phone: phone,
      bloodGroup: bloodGroup,
      allergies: '',
      visits: []
    };

    // Create Family Record
    const newFamily = {
      id: famId,
      famId: famId,
      surname: surname,
      headName: fullHeadName,
      fatherName: fatherName,
      phone: phone,
      area: area,
      address: address,
      createdAt: todayISO(),
      patients: {
        [patId]: headPatient
      }
    };

    if (!db.families) db.families = {};
    db.families[famId] = newFamily;
    saveLocalDB(db, clinicId);

    showToast(`✅ Family ${famId} registered successfully!`);

    // Push to queue if requested
    if (pushQueue) {
      pushPatientToQueue({
        patientId: patId,
        patientName: fullHeadName,
        familyId: famId,
        familyHead: fullHeadName,
        age: age || '35',
        gender: gender,
        phone: phone,
        area: area,
        complaint: 'New Family OPD Consultation'
      });
      switchView('queue');
    } else {
      switchView('dashboard');
    }
  });
}

// =========================================================
// 3. ADD MEMBER TO FAMILY HEAD VIEW (F2)
// =========================================================
function renderAddMemberView(container, presetFamilyId = null) {
  const families = Object.values(db.families || {});

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 24px; box-shadow: var(--shadow-sm);">
      
      <div style="border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 14px; margin-bottom: 18px;">
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0;">
          <i class="fa-solid fa-user-plus" style="color: #0284c7;"></i> Add Member to Family
        </h2>
        <p style="font-size: 12px; color: var(--text-muted, #64748b); margin-top: 3px;">
          Attach a new family member (Spouse, Child, Parent) under an existing Family Head record.
        </p>
      </div>

      <!-- Step 1: Select Family Head -->
      <div style="background: rgba(2,132,199,0.04); border: 1px solid rgba(2,132,199,0.2); border-radius: 8px; padding: 14px; margin-bottom: 18px;">
        <label style="display: block; font-size: 12.5px; font-weight: 800; color: #0369a1; margin-bottom: 6px;">
          Select Existing Family Head *
        </label>
        <select id="member-family-select" class="top-search-input" style="width: 100%; padding: 9px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; font-weight: 700; font-size: 13.5px;">
          <option value="">-- Choose Family Head / Search --</option>
          ${families
            .map(
              (f) => `
            <option value="${f.famId || f.id}" ${presetFamilyId === (f.famId || f.id) ? 'selected' : ''}>
              ${f.famId || f.id} &bull; ${f.headName} &bull; Ph: ${f.phone} (${f.area || 'General'})
            </option>
          `
            )
            .join('')}
        </select>
      </div>

      <!-- Step 2: Member Details Form -->
      <form id="form-receptionist-add-member" style="display: flex; flex-direction: column; gap: 16px;">
        
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Member Full Name *</label>
            <input type="text" id="member-name" class="top-search-input" required placeholder="(SURNAME NAME FATHER)" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; font-weight: 700;" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Relation to Head *</label>
            <select id="member-relation" class="top-search-input" required style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; font-weight: 600;">
              <option value="Spouse">Spouse (Wife / Husband)</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Other">Other / Relative</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Age *</label>
            <input type="number" id="member-age" class="top-search-input" required min="0" max="120" placeholder="e.g. 28" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Gender *</label>
            <select id="member-gender" class="top-search-input" required style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Blood Group</label>
            <select id="member-blood" class="top-search-input" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;">
              <option value="">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Member Phone (Optional)</label>
            <input type="tel" id="member-phone" class="top-search-input" placeholder="Individual Mobile" maxlength="10" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 4px;">Known Allergies / Medical Notes</label>
          <input type="text" id="member-allergies" class="top-search-input" placeholder="e.g. Penicillin allergy, Diabetes, Hypertension" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
        </div>

        <div style="background: rgba(2,132,199,0.05); border: 1px dashed rgba(2,132,199,0.3); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="member-push-queue-check" style="width: 18px; height: 18px; cursor: pointer;" checked />
          <label for="member-push-queue-check" style="font-size: 12.5px; font-weight: 700; color: #0369a1; cursor: pointer; margin: 0;">
            Immediately push this member into Patient Consultation Queue (Doctor OPD)
          </label>
        </div>

        <!-- Submit & Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 14px;">
          <button type="button" onclick="switchView('dashboard')" style="background: none; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <button type="submit" class="btn-start-consult" style="background: #0284c7; padding: 10px 24px; font-size: 13.5px;">
            <i class="fa-solid fa-user-plus"></i> Save Member &amp; Add
          </button>
        </div>

      </form>

    </div>
  `;

  const famSelect = container.querySelector('#member-family-select');
  const form = container.querySelector('#form-receptionist-add-member');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const famId = famSelect.value;
    if (!famId) {
      showToast('Please select a Family Head first', 'error');
      famSelect.focus();
      return;
    }

    const family = db.families[famId] || Object.values(db.families || {}).find(f => f.famId === famId || f.id === famId);
    if (!family) {
      showToast('Selected family not found in database', 'error');
      return;
    }

    const name = container.querySelector('#member-name').value.trim().toUpperCase();
    const relation = container.querySelector('#member-relation').value;
    const age = container.querySelector('#member-age').value.trim();
    const gender = container.querySelector('#member-gender').value;
    const blood = container.querySelector('#member-blood').value;
    const phone = container.querySelector('#member-phone').value.trim() || family.phone;
    const allergies = container.querySelector('#member-allergies').value.trim();
    const pushQueue = container.querySelector('#member-push-queue-check').checked;

    const patId = `PAT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const newMember = {
      id: patId,
      patId: patId,
      name: name,
      age: age,
      gender: gender,
      relation: relation,
      phone: phone,
      bloodGroup: blood,
      allergies: allergies,
      visits: []
    };

    if (!family.patients) family.patients = {};
    family.patients[patId] = newMember;
    saveLocalDB(db, clinicId);

    showToast(`✅ Added ${name} to Family ${family.headName}!`);

    if (pushQueue) {
      pushPatientToQueue({
        patientId: patId,
        patientName: name,
        familyId: famId,
        familyHead: family.headName,
        age: age,
        gender: gender,
        phone: phone,
        area: family.area,
        complaint: 'Routine OPD Consultation'
      });
      switchView('queue');
    } else {
      switchView('dashboard');
    }
  });
}

// =========================================================
// 4. FIND PATIENT IN SYSTEM & PUSH TO QUEUE (F5)
// =========================================================
function renderSearchPatientView(container) {
  const allPatients = [];
  Object.values(db.families || {}).forEach(f => {
    Object.values(f.patients || {}).forEach(p => {
      allPatients.push({
        ...p,
        familyId: f.famId || f.id,
        familyHead: f.headName,
        familyPhone: f.phone,
        area: f.area,
        address: f.address,
        visitCount: (p.visits || []).length
      });
    });
  });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      
      <!-- Top Search Filter Bar -->
      <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 18px; box-shadow: var(--shadow-sm); display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; position: relative;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted, #64748b); font-size: 14px;"></i>
          <input type="text" id="reception-patient-search" class="top-search-input" style="width: 100%; padding: 10px 14px 10px 40px; border: 1.5px solid var(--border-color, #cbd5e1); border-radius: 8px; font-size: 14px; font-weight: 600;" placeholder="Type Patient Name, Patient ID, Family Head, or Mobile No..." value="${globalSearchQuery}" autofocus />
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text-muted, #64748b);">
          <span id="search-result-count">${allPatients.length}</span> Total Registered Patients
        </div>
      </div>

      <!-- Patients Grid / List -->
      <div id="patient-search-results-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
        ${renderPatientSearchResultsHTML(allPatients, globalSearchQuery)}
      </div>

    </div>
  `;

  const searchInput = container.querySelector('#reception-patient-search');
  searchInput.addEventListener('input', (e) => {
    globalSearchQuery = e.target.value;
    const grid = container.querySelector('#patient-search-results-grid');
    const countEl = container.querySelector('#search-result-count');
    if (grid) {
      grid.innerHTML = renderPatientSearchResultsHTML(allPatients, globalSearchQuery);
      wireSearchPushButtons();
    }
  });

  wireSearchPushButtons();
}

function renderPatientSearchResultsHTML(patientList, query = '') {
  const q = query.trim().toLowerCase();
  const filtered = patientList.filter(p => {
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.patId || p.id || '').toLowerCase().includes(q) ||
      (p.familyHead || '').toLowerCase().includes(q) ||
      (p.familyId || '').toLowerCase().includes(q) ||
      (p.phone || p.familyPhone || '').includes(q) ||
      (p.area || '').toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return `
      <div style="grid-column: 1 / -1; background: #fff; border: 1px dashed var(--border-color, #cbd5e1); border-radius: 12px; padding: 40px; text-align: center; color: var(--text-muted, #64748b);">
        <i class="fa-solid fa-user-xmark" style="font-size: 32px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-main, #0f172a);">No matching patient found</div>
        <p style="font-size: 12px; margin-top: 4px;">Click <b>Register Family Head (F1)</b> to create a new record.</p>
        <button type="button" onclick="switchView('reg')" class="btn-start-consult" style="margin-top: 12px; padding: 8px 18px;">
          <i class="fa-solid fa-id-card"></i> Register New Family Head (F1)
        </button>
      </div>
    `;
  }

  return filtered.map(p => `
    <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 18px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: transform .15s, box-shadow .15s;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <span class="token-chip" style="background: rgba(20,107,92,0.1); color: var(--primary-teal, #146B5C); font-size: 11px; padding: 2px 7px;">
              ${p.patId || p.id}
            </span>
            <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main, #0f172a); margin: 6px 0 2px;">${p.name}</h4>
            <div style="font-size: 12px; color: var(--text-muted, #64748b);">
              ${p.age ? p.age + ' Yrs' : 'Adult'} &bull; ${p.gender || 'Male'} &bull; Rel: <b>${p.relation || 'Self'}</b>
            </div>
          </div>
          ${p.bloodGroup ? `<span style="font-size: 11px; font-weight: 800; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px;">${p.bloodGroup}</span>` : ''}
        </div>

        <div style="background: var(--surface-alt, #f8fafc); border-radius: 6px; padding: 8px 10px; margin-top: 10px; font-size: 11.5px; color: var(--text-muted, #64748b);">
          <div><i class="fa-solid fa-people-roof" style="color: var(--primary-teal, #146B5C);"></i> Family Head: <b style="color: var(--text-main, #0f172a);">${p.familyHead}</b></div>
          <div style="margin-top: 2px;"><i class="fa-solid fa-phone"></i> Mobile: ${p.phone || p.familyPhone} &bull; ${p.area || 'General'}</div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 12px;">
        <button type="button" class="btn-push-patient-queue btn-start-consult" data-patid="${p.patId || p.id}" data-famid="${p.familyId}" style="flex: 1; text-align: center; padding: 8px 12px; font-size: 12.5px;">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Push to Patient Queue
        </button>
      </div>
    </div>
  `).join('');
}

function wireSearchPushButtons() {
  document.querySelectorAll('.btn-push-patient-queue').forEach(btn => {
    btn.addEventListener('click', () => {
      const patId = btn.getAttribute('data-patid');
      const famId = btn.getAttribute('data-famid');
      openPushToQueueModal(famId, patId);
    });
  });
}

// =========================================================
// 5. PATIENT QUEUE MANAGEMENT VIEW (F3)
// =========================================================
function renderPatientQueueView(container) {
  const queue = db.patientQueue || [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 18px;">
      
      <!-- Queue Header & Actions -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 14px 20px; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-list-check" style="color: var(--primary-teal, #146B5C); font-size: 18px;"></i>
            <h2 style="font-size: 17px; font-weight: 800; color: var(--text-main, #0f172a); margin: 0;">
              Live Patient Consultation Queue
            </h2>
          </div>
          <span style="font-size: 12px; color: var(--text-muted, #64748b);">
            Assigned token queue synchronized with Doctor's consultation desk
          </span>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button type="button" onclick="switchView('search')" class="btn-start-consult" style="padding: 8px 16px;">
            <i class="fa-solid fa-user-plus"></i> + Push Patient to Queue
          </button>
        </div>
      </div>

      <!-- Queue Cards List -->
      <div style="background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-lg, 12px); padding: 20px; box-shadow: var(--shadow-sm);">
        ${renderQueueListHTML(queue)}
      </div>

    </div>
  `;

  wireQueueRowActions();
}

function renderQueueListHTML(queue) {
  if (!queue || queue.length === 0) {
    return `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-muted, #64748b);">
        <i class="fa-solid fa-users-slash" style="font-size: 34px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-main, #0f172a);">No patients currently in consultation queue</div>
        <p style="font-size: 12px; margin-top: 4px;">Find or register a patient and push them into the queue.</p>
        <button type="button" onclick="switchView('search')" class="btn-start-consult" style="margin-top: 10px; padding: 7px 16px;">
          <i class="fa-solid fa-magnifying-glass"></i> Find Patient to Queue (F5)
        </button>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${queue.map((q, idx) => `
        <div class="queue-card" style="border-left: 4px solid ${q.status === 'In Consultation' ? '#166534' : q.status === 'Completed' ? '#0369a1' : '#dc2626'};">
          <div class="queue-token-num">${q.token || 'T-' + pad(idx + 1, 2)}</div>
          
          <div class="queue-info">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong>${q.patientName || q.name}</strong>
              <span class="badge-key" style="font-size: 10px;">${q.age ? q.age + 'Y' : ''}/${q.gender || 'M'}</span>
              <span class="status-pill-${(q.status || 'waiting').toLowerCase().replace(/\s+/g, '-')}" style="padding: 2px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 700;">
                ${q.status || 'Waiting'}
              </span>
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted, #64748b); margin-top: 3px;">
              <span><i class="fa-solid fa-people-roof"></i> Head: ${q.familyHead || 'Self'}</span> &bull; 
              <span><i class="fa-solid fa-clock"></i> Arrived: ${q.arrivedAt || 'Just now'}</span>
              ${q.complaint ? ` &bull; <span style="color: var(--text-main, #0f172a); font-weight: 600;">Chief Complaint: ${q.complaint}</span>` : ''}
            </div>
            ${
              q.vitals && Object.keys(q.vitals).length > 0
                ? `
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; font-size: 10.5px; color: var(--primary-teal, #146B5C); font-weight: 700;">
                ${q.vitals.bp ? `<span>BP: ${q.vitals.bp}</span>` : ''}
                ${q.vitals.pulse ? `<span>Pulse: ${q.vitals.pulse}</span>` : ''}
                ${q.vitals.temp ? `<span>Temp: ${q.vitals.temp}</span>` : ''}
                ${q.vitals.spo2 ? `<span>SpO2: ${q.vitals.spo2}</span>` : ''}
                ${q.vitals.weight ? `<span>Wt: ${q.vitals.weight}</span>` : ''}
              </div>
            `
                : ''
            }
          </div>

          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="btn-change-status btn-start-consult" data-token="${q.token}" data-status="${q.status || 'Waiting'}" style="padding: 6px 12px; font-size: 11.5px;">
              ${q.status === 'In Consultation' ? '<i class="fa-solid fa-check"></i> Complete' : '<i class="fa-solid fa-stethoscope"></i> Call to Doctor'}
            </button>
            <button type="button" class="btn-remove-queue" data-token="${q.token}" title="Remove from queue">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function wireQueueRowActions() {
  document.querySelectorAll('.btn-change-status').forEach(btn => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-token');
      const curStatus = btn.getAttribute('data-status');
      const queue = db.patientQueue || [];
      const item = queue.find(q => q.token === token);
      if (item) {
        if (curStatus === 'Waiting') {
          item.status = 'In Consultation';
          showToast(`${item.patientName} (${token}) called for Doctor Consultation`);
        } else if (curStatus === 'In Consultation') {
          item.status = 'Completed';
          showToast(`${item.patientName} marked as Completed`);
        }
        saveQueueData(queue);
        renderCurrentView();
      }
    });
  });

  document.querySelectorAll('.btn-remove-queue').forEach(btn => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-token');
      const queue = (db.patientQueue || []).filter(q => q.token !== token);
      saveQueueData(queue);
      showToast(`Removed token ${token} from queue`);
      renderCurrentView();
    });
  });
}

// =========================================================
// MODAL: PUSH PATIENT TO CONSULTATION QUEUE
// =========================================================
function openPushToQueueModal(familyId, patientId) {
  const modalRoot = document.getElementById('modalMount');
  if (!modalRoot) return;

  const family = db.families[familyId] || Object.values(db.families || {}).find(f => f.famId === familyId || f.id === familyId);
  const patient = family && family.patients ? (family.patients[patientId] || Object.values(family.patients).find(p => p.patId === patientId || p.id === patientId)) : null;

  if (!family || !patient) {
    showToast('Patient details not found', 'error');
    return;
  }

  const tokenNum = getNextTokenNumber();

  modalRoot.innerHTML = `
    <div class="cms-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; backdrop-filter: blur(2px);">
      <div class="cms-modal cms-card" style="width: 100%; max-width: 520px; box-shadow: var(--shadow-xl); border: 1px solid var(--border-color, #e2e8f0); padding: 22px; display: flex; flex-direction: column; gap: 14px; background: #ffffff; border-radius: 14px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color, #e2e8f0); padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-arrow-right-to-bracket" style="color: var(--primary-teal, #146B5C); font-size: 18px;"></i>
            <div>
              <h2 style="font-size: 16px; font-weight: 800; margin: 0; color: var(--text-main, #0f172a);">
                Push Patient to Consultation Queue
              </h2>
              <div style="font-size: 11px; color: var(--text-muted, #64748b);">Token: <b>${tokenNum}</b></div>
            </div>
          </div>
          <button type="button" id="btn-close-queue-modal" style="background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted, #64748b);">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style="background: rgba(20,107,92,0.06); border-radius: 8px; padding: 12px; font-size: 12.5px;">
          <div style="font-weight: 800; color: var(--text-main, #0f172a); font-size: 14px;">${patient.name}</div>
          <div style="color: var(--text-muted, #64748b); margin-top: 2px;">
            ${patient.age ? patient.age + ' Yrs' : 'Adult'} &bull; ${patient.gender || 'Male'} &bull; Head: <b>${family.headName}</b> &bull; Ph: ${patient.phone || family.phone}
          </div>
        </div>

        <form id="form-do-push-queue" style="display: flex; flex-direction: column; gap: 12px;">
          
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 3px;">
              Chief Complaint / Reason for Visit *
            </label>
            <input type="text" id="queue-complaint" required placeholder="e.g. Fever, Headache, Routine Checkup" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" autofocus />
          </div>

          <!-- Vitals -->
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-main, #0f172a); margin-bottom: 3px;">
              OPD Triage Vitals (Optional)
            </label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <input type="text" id="vitals-bp" placeholder="BP (120/80)" style="padding: 6px 8px; font-size: 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
              <input type="text" id="vitals-pulse" placeholder="Pulse (72 bpm)" style="padding: 6px 8px; font-size: 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
              <input type="text" id="vitals-temp" placeholder="Temp (98.6°F)" style="padding: 6px 8px; font-size: 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
              <input type="text" id="vitals-spo2" placeholder="SpO2 (99%)" style="padding: 6px 8px; font-size: 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
              <input type="text" id="vitals-weight" placeholder="Weight (68 kg)" style="padding: 6px 8px; font-size: 12px; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px;" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; border-top: 1px solid var(--border-color, #e2e8f0); padding-top: 10px;">
            <button type="button" id="btn-cancel-queue-modal" style="background: none; border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; padding: 8px 16px; font-size: 12.5px; font-weight: 600; cursor: pointer;">
              Cancel
            </button>
            <button type="submit" class="btn-start-consult" style="padding: 8px 20px; font-size: 13px;">
              <i class="fa-solid fa-check"></i> Assign ${tokenNum} &amp; Push to Doctor Queue
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  const closeBtn = modalRoot.querySelector('#btn-close-queue-modal');
  const cancelBtn = modalRoot.querySelector('#btn-cancel-queue-modal');
  const form = modalRoot.querySelector('#form-do-push-queue');

  const closeModal = () => (modalRoot.innerHTML = '');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const complaint = modalRoot.querySelector('#queue-complaint').value.trim();
    const bp = modalRoot.querySelector('#vitals-bp').value.trim();
    const pulse = modalRoot.querySelector('#vitals-pulse').value.trim();
    const temp = modalRoot.querySelector('#vitals-temp').value.trim();
    const spo2 = modalRoot.querySelector('#vitals-spo2').value.trim();
    const weight = modalRoot.querySelector('#vitals-weight').value.trim();

    const vitalsObj = {};
    if (bp) vitalsObj.bp = bp;
    if (pulse) vitalsObj.pulse = pulse;
    if (temp) vitalsObj.temp = temp;
    if (spo2) vitalsObj.spo2 = spo2;
    if (weight) vitalsObj.weight = weight;

    pushPatientToQueue({
      token: tokenNum,
      patientId: patient.patId || patient.id,
      patientName: patient.name,
      familyId: family.famId || family.id,
      familyHead: family.headName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone || family.phone,
      area: family.area,
      complaint: complaint,
      vitals: vitalsObj
    });

    closeModal();
    showToast(`✅ Patient ${patient.name} pushed to Doctor Queue with Token ${tokenNum}`);
    switchView('queue');
  });
}

function pushPatientToQueue(data) {
  const queue = db.patientQueue || [];
  const token = data.token || getNextTokenNumber();

  const newEntry = {
    token: token,
    patientId: data.patientId,
    name: data.patientName,
    patientName: data.patientName,
    familyId: data.familyId,
    familyHead: data.familyHead,
    age: data.age,
    gender: data.gender,
    phone: data.phone,
    area: data.area,
    arrivedAt: nowTime(),
    date: todayISO(),
    vitals: data.vitals || {},
    complaint: data.complaint || 'OPD Consultation',
    status: 'Waiting'
  };

  queue.push(newEntry);
  saveQueueData(queue);
}

// Global Search bar handler
window.globalSearch = function(val) {
  globalSearchQuery = val;
  if (currentView !== 'search') {
    switchView('search');
  } else {
    renderSearchPatientView(document.getElementById('mainContent'));
  }
};

window.handleLogout = function() {
  localStorage.removeItem('clinic-auth-session');
  sessionStorage.clear();
  window.location.href = '../login.html?logout=true';
};

window.toggleTheme = function() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = isDark ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
  }
};
