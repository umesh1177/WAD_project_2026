// Authentication & Authorization Guard: Admin access only
(function verifyAdminAccess() {
  try {
    const raw = localStorage.getItem('clinic-auth-session');
    if (!raw) {
      window.location.replace('../login.html?auth=admin_required');
      return;
    }
    const session = JSON.parse(raw);
    if (!session || !session.token || session.role !== 'admin') {
      window.location.replace('../login.html?auth=admin_required');
      return;
    }
  } catch (e) {
    window.location.replace('../login.html?auth=admin_required');
  }
})();

const API_BASE_URL = window.location.origin.includes('5000')
  ? ''
  : window.location.port === '' || window.location.port === '80'
  ? ''
  : 'http://localhost:5000';

function getAuthHeader() {
  try {
    const session = JSON.parse(localStorage.getItem('clinic-auth-session') || '{}');
    return session.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch (e) {
    return {};
  }
}

const PLATFORM_SERVICES = [
  {
    id: 'receptionist',
    name: 'Receptionist & Front Desk Service',
    icon: 'fa-solid fa-user-nurse',
    badge: 'Dual-Role Staff',
    desc: 'Empowers front-desk staff to register Family Heads, add family members, search patients, and push arriving cases directly into the doctor\'s consultation queue.',
    features: [
      'Dedicated Receptionist Portal Login',
      'Family Head & Member Registration',
      'Push Arriving Patient to Doctor Queue',
      'Front-Desk Flow & Token Management'
    ]
  },
  {
    id: 'appointment',
    name: 'Patient Consultation Queue Service',
    icon: 'fa-solid fa-users-line',
    badge: 'Queue Dispatch',
    desc: 'Live patient consultation queue and token dispatch. Receptionist pushes patients to queue, so the doctor can directly initiate consultations without patient search.',
    features: [
      'Live Doctor Consultation Queue',
      'Direct Pick for New Visit Consultation',
      'Instant Patient Token Dispatch',
      'Receptionist-Driven Patient Flow'
    ]
  },
  {
    id: 'digitalPrescription',
    name: 'Digital Multi-Language Prescription Service',
    icon: 'fa-solid fa-file-prescription',
    badge: 'Customizable UI',
    desc: 'Advanced digital prescription builder with multi-language dosage instructions (Gujarati, Hindi, English), meal timing (AF/BF), and quick templates.',
    features: [
      'Multi-Language Regional Dosage Labels',
      'Meal Timing (Before/After Food)',
      'Quick Dosage Presets & Templates',
      'Thermal & A4 Instant Prescription Print'
    ]
  },
  {
    id: 'certificates',
    name: 'Medical Certificates & Verification Service',
    icon: 'fa-solid fa-certificate',
    badge: 'Security & IDs',
    desc: 'Generate fitness, sickness, and medical leave certificates with automatic unique certificate IDs and tamper-proof verification badges.',
    features: [
      'Unique Auto-Generated Certificate IDs',
      'Customizable Clinical Templates',
      'Tamper-Proof Verification System',
      'Instant Patient Copy PDF Generation'
    ]
  },
  {
    id: 'billing',
    name: 'Billing, Invoicing & Receipts Service',
    icon: 'fa-solid fa-file-invoice-dollar',
    badge: 'Financials',
    desc: 'Itemized consultation billing, fee receipt generation, payment history tracking, and patient balance due records.',
    features: [
      'Itemized Clinical Bill Generation',
      'Payment Status (Paid, Partial, Due)',
      'Receipt Printing & Ledger Audit',
      'Balance Dues Auto-Highlight'
    ]
  }
];

// In-memory application state - populated live from MongoDB Database
let clinics = [];
let clinicDoctors = [];
let clinicRequests = [];
let activityLogs = [];
let adminAccounts = [];
let patients = [];
let activeFeedbackTickets = [];
let currentClinicTab = 'active';

// Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

// Real-time Database Synchronization Functions
async function fetchClinicsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinics`, { headers: getAuthHeader() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        clinics = json.data.map(c => ({
          ...c,
          id: c.clinicId || c._id,
          doctors: c.doctorsCount || c.doctors || 1,
          patients: c.patientsCount || c.patients || 0,
          visits: c.visitsCount || c.visits || 0,
          services: Array.isArray(c.services) ? c.services : ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing']
        }));
      }
    }
  } catch (e) {
    console.error('Error fetching clinics from DB:', e);
  }
}

async function fetchDoctorsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/doctors`, { headers: getAuthHeader() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.doctors)) {
        clinicDoctors = json.doctors.map(d => ({
          ...d,
          name: d.name || `Dr. ${d.username}`,
          specialty: d.specialty || 'General Medicine',
          clinic: d.clinic || (clinics.find(c => c.id === d.clinicId)?.name) || 'Dhyey Main Clinic',
          clinicId: d.clinicId || 'CLN-001',
          email: d.email || d.username || '',
          status: d.status || 'Active'
        }));
      }
    }
  } catch (e) {
    console.error('Error fetching doctors from DB:', e);
  }
}

async function fetchRequestsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinics/requests`, { headers: getAuthHeader() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        clinicRequests = json.data;
      }
    }
  } catch (e) {
    console.error('Error fetching requests from DB:', e);
  }
}

async function fetchAdminsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/admins`, { headers: getAuthHeader() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.admins)) {
        adminAccounts = json.admins;
      }
    }
  } catch (e) {
    console.error('Error fetching admins from DB:', e);
  }
}

async function fetchLogsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/logs`, { headers: getAuthHeader() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.logs)) {
        activityLogs = json.logs;
      }
    }
  } catch (e) {
    console.error('Error fetching logs from DB:', e);
  }
}

async function fetchFeedbackFromDB() {
  try {
    let res = await fetch(`${API_BASE_URL}/api/feedback/admin/all`, { headers: getAuthHeader() });
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/feedback`, { headers: getAuthHeader() });
    }
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        activeFeedbackTickets = json.data;
      }
    }
  } catch (e) {
    console.error('Error fetching feedback from DB:', e);
  }
}

async function fetchPatientsFromDB() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/patients`, { headers: getAuthHeader() });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        patients = json.data.map(p => ({
          id: p.patId || p._id,
          name: p.name,
          clinic: p.clinicName || 'Dhyey Main Clinic',
          doctor: 'Dr. Mehul Shah',
          visits: p.visits ? p.visits.length : 1,
          lastVisit: p.lastVisit || 'Recent',
          status: 'Active',
          phone: p.phone || '',
          address: p.address || '',
          bloodGroup: p.bloodGroup || 'O+'
        }));
      }
    }
  } catch (e) {
    console.error('Error fetching patients from DB:', e);
  }
}

async function logActivity(action, entity, entityId, result = 'Success', details = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action, entity, entityId, result, details, admin: 'Administrator' })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.log) activityLogs.unshift(json.log);
    }
  } catch (e) {
    activityLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      admin: 'Administrator',
      action,
      entity,
      entityId,
      result,
      details,
    });
  }
}

async function reloadAllAdminData() {
  await Promise.all([
    fetchClinicsFromDB(),
    fetchDoctorsFromDB(),
    fetchRequestsFromDB(),
    fetchAdminsFromDB(),
    fetchLogsFromDB(),
    fetchFeedbackFromDB(),
    fetchPatientsFromDB()
  ]);
}

const content = document.getElementById('adminContent');

function money(value) { return `₹${Number(value || 0).toLocaleString('en-IN')}`; }
function clinicOptions() { return clinics.map(c => `<option value="${c.name}">${c.name}</option>`).join(''); }

function page(title, subtitle, body, actions = '') {
  content.innerHTML = `<div class="admin-page"><div class="admin-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="admin-actions">${actions}</div></div>${body}</div>`;
}

function table(headers, rows, empty = 'No records match these filters.') {
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}" class="empty-results">${empty}</td></tr>`}</tbody></table></div>`;
}

function renderServiceTagsMini(services = []) {
  if (!services || !services.length) return `<span class="service-pill-mini">Basic Doctor Only</span>`;
  const map = {
    receptionist: { label: 'Reception Desk', cls: 'receptionist-active', icon: 'fa-user-nurse' },
    appointment: { label: 'Queue Dispatch', cls: 'active', icon: 'fa-calendar-check' },
    digitalPrescription: { label: 'Digital Rx', cls: 'prescription-active', icon: 'fa-file-prescription' },
    certificates: { label: 'Certificates', cls: 'active', icon: 'fa-certificate' },
    billing: { label: 'Billing', cls: 'active', icon: 'fa-file-invoice-dollar' }
  };
  return `<div class="service-tags-wrap">${services.map(s => {
    const item = map[s];
    if (!item) return '';
    return `<span class="service-pill-mini ${item.cls}"><i class="fa-solid ${item.icon}"></i> ${item.label}</span>`;
  }).join('')}</div>`;
}

function stats() {
  const active = clinics.filter(c => c.status === 'Active').length;
  const withReception = clinics.filter(c => (c.services || []).includes('receptionist')).length;
  const doctorOnly = clinics.filter(c => !(c.services || []).includes('receptionist')).length;
  return `<div class="admin-stats">
    <div class="admin-stat"><div class="admin-stat-top"><span>Total clinics</span><span class="admin-stat-icon"><i class="fa-solid fa-hospital"></i></span></div><strong>${clinics.length}</strong><small>${active} active locations</small></div>
    <div class="admin-stat"><div class="admin-stat-top"><span>Receptionist Desks</span><span class="admin-stat-icon"><i class="fa-solid fa-user-nurse"></i></span></div><strong>${withReception}</strong><small>Dual-role enabled clinics</small></div>
    <div class="admin-stat"><div class="admin-stat-top"><span>Doctor-Only Mode</span><span class="admin-stat-icon"><i class="fa-solid fa-user-doctor"></i></span></div><strong>${doctorOnly}</strong><small>Direct registration clinics</small></div>
    <div class="admin-stat"><div class="admin-stat-top"><span>Visits this month</span><span class="admin-stat-icon"><i class="fa-solid fa-calendar-check"></i></span></div><strong>${clinics.reduce((s, c) => s + (c.visits || 0), 0).toLocaleString()}</strong><small>Live MongoDB sync</small></div>
  </div>`;
}

function renderOverview() {
  const pendingRequests = clinicRequests.filter(r => r.status === 'Pending');
  const rows = clinics.map(c => `
    <tr data-clinic-id="${c.id}">
      <td><strong>${c.name}</strong><br><small>${c.id} · ${c.city}</small></td>
      <td>${c.doctors}</td>
      <td>${(c.patients || 0).toLocaleString()}</td>
      <td>${c.visits || 0}</td>
      <td>${(c.services || []).includes('receptionist') ? '<span class="role-badge role-badge-receptionist"><i class="fa-solid fa-user-nurse"></i> Doctor + Receptionist</span>' : '<span class="role-badge role-badge-doctor"><i class="fa-solid fa-user-doctor"></i> Doctor Only (Direct)</span>'}</td>
      <td><span class="status-pill ${c.status === 'Paused' ? 'paused' : c.status === 'Suspended' ? 'account-status-suspended' : ''}">${c.status}</span></td>
    </tr>
  `).join('');

  page('Good day, Administrator', 'Here is the latest snapshot across your clinic network and provisioned service roles.', stats(), `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic</button>`);
  
  const pendingBanner = pendingRequests.length > 0 ? `
    <div class="pending-requests-banner">
      <div class="banner-left">
        <div class="banner-bell"><i class="fa-solid fa-bell"></i></div>
        <div>
          <strong>${pendingRequests.length} Clinic Registration Application${pendingRequests.length > 1 ? 's' : ''} Pending Review</strong>
          <p>New clinic applications submitted via the Public Landing Page require administrative approval.</p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn-primary" data-action="view-requests-tab" style="padding:7px 15px;font-size:12px">
          <i class="fa-solid fa-clipboard-check"></i> Review Applications (${pendingRequests.length})
        </button>
      </div>
    </div>
  ` : '';

  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    ${pendingBanner}
    <div class="admin-grid">
      <section class="admin-card">
        <div class="admin-card-header">
          <div><h2>Clinic network status</h2><span>Live performance and active roles</span></div>
          <a class="btn-secondary" href="#clinics" data-view="clinics">View all</a>
        </div>
        ${table(['Clinic', 'Doctors', 'Patients', 'Visits', 'Role Access', 'Status'], rows)}
      </section>
      
      <section class="admin-card">
        <div class="admin-card-header">
          <div><h2>Modular platform services</h2><span>Configure clinic capabilities & roles</span></div>
          <a class="btn-secondary" href="#services" data-view="services">Manage</a>
        </div>
        <div class="quick-links">
          <a class="admin-quick-link" href="#services" data-view="services">
            <i class="fa-solid fa-user-nurse"></i>
            <span><strong>Receptionist Service (Dual Role)</strong><small>Receptionist registers family & pushes to doctor queue</small></span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
          <a class="admin-quick-link" href="#services" data-view="services">
            <i class="fa-solid fa-user-doctor"></i>
            <span><strong>Doctor-Only Direct Mode</strong><small>Doctor directly registers family head & enters visit</small></span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
          <a class="admin-quick-link" href="#services" data-view="services">
            <i class="fa-solid fa-file-prescription"></i>
            <span><strong>Customizable Digital Prescription</strong><small>Multi-language dosage & timing controls</small></span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
          <a class="admin-quick-link" href="#analysis-clinic" data-view="analysis-clinic">
            <i class="fa-solid fa-hospital"></i>
            <span><strong>Clinic Analytics</strong><small>Patient volume, visits, and collections</small></span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </section>
    </div>
  `);
}

function renderClinics(tab = currentClinicTab) {
  currentClinicTab = tab;
  const pendingCount = clinicRequests.filter(r => r.status === 'Pending').length;
  const totalRequestsCount = clinicRequests.length;
  const activeClinicsCount = clinics.length;

  page(
    'Clinic Management & Network Onboarding',
    'Manage authorized clinics, inspect registered doctors, and review clinic applications submitted from the landing page.',
    '',
    `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic</button>`
  );

  const tabBarHtml = `
    <div class="clinic-tab-bar">
      <button class="clinic-tab-btn ${currentClinicTab === 'active' ? 'active' : ''}" data-action="switch-clinic-tab" data-tab="active">
        <i class="fa-solid fa-hospital"></i> Active Network Clinics
        <span class="badge-count">${activeClinicsCount}</span>
      </button>
      <button class="clinic-tab-btn ${currentClinicTab === 'requests' ? 'active' : ''}" data-action="switch-clinic-tab" data-tab="requests">
        <i class="fa-solid fa-file-signature"></i> Landing Page Requests
        <span class="badge-count ${pendingCount > 0 ? 'pending-alert' : ''}">${pendingCount > 0 ? pendingCount + ' Pending' : totalRequestsCount}</span>
      </button>
    </div>
  `;

  if (currentClinicTab === 'requests') {
    content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
      ${tabBarHtml}
      <section class="admin-card">
        <div class="admin-card-header" style="margin-bottom:14px">
          <div>
            <h2>Incoming Clinic Registration Requests</h2>
            <span>Applications received directly through the public landing page "Add Clinic" portal.</span>
          </div>
          <span class="badge-count ${pendingCount > 0 ? 'pending-alert' : ''}">${pendingCount} Pending</span>
        </div>
        <div class="admin-filter-row">
          <div class="form-group" style="flex:1;min-width:240px;margin:0">
            <input class="form-input" id="reqSearch" placeholder="Search by clinic name, applicant, city, or Request ID...">
          </div>
          <select class="form-select" id="reqStatusFilter">
            <option value="">All statuses</option>
            <option value="Pending" selected>Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div id="requestsTable" style="margin-top:16px"></div>
      </section>
    `);

    const updateRequests = () => {
      const term = (document.getElementById('reqSearch')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('reqStatusFilter')?.value || '';

      const filtered = clinicRequests.filter(r => {
        const docNames = (r.doctors || []).map(d => d.name || '').join(' ');
        const matchesTerm = `${r.id} ${r.name} ${r.city} ${r.applicantName || ''} ${r.email || ''} ${r.phone || ''} ${docNames}`.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || r.status === statusFilter;
        return matchesTerm && matchesStatus;
      });

      const rows = filtered.map(r => {
        let statusBadge = '';
        if (r.status === 'Pending') {
          statusBadge = `<span class="status-pill status-pending"><i class="fa-solid fa-clock"></i> Pending Review</span>`;
        } else if (r.status === 'Approved') {
          statusBadge = `<span class="status-pill" style="background:#ecfdf5;color:#059669;border:1px solid #a7f3d0"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
        } else {
          statusBadge = `<span class="status-pill" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>`;
        }

        let actionBtns = '';
        if (r.status === 'Pending') {
          actionBtns = `
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn-action-approve" data-action="approve-request" data-req-id="${r.id || r.clinicId}" title="Approve and add clinic to network"><i class="fa-solid fa-check"></i> Approve</button>
              <button class="btn-action-reject" data-action="reject-request" data-req-id="${r.id || r.clinicId}" title="Reject application"><i class="fa-solid fa-xmark"></i> Reject</button>
              <button class="btn-action-details" data-action="view-request" data-req-id="${r.id || r.clinicId}" title="Review complete application packet"><i class="fa-solid fa-eye"></i> Details</button>
            </div>
          `;
        } else if (r.status === 'Approved') {
          actionBtns = `
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn-action-details" data-action="view-request" data-req-id="${r.id || r.clinicId}"><i class="fa-solid fa-eye"></i> View</button>
              <span style="font-size:11px;color:#059669;font-weight:600"><i class="fa-solid fa-check-double"></i> In Network</span>
            </div>
          `;
        } else {
          actionBtns = `
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn-action-details" data-action="view-request" data-req-id="${r.id || r.clinicId}"><i class="fa-solid fa-eye"></i> View</button>
              <button class="btn-action-approve" style="background:#64748b;border-color:#64748b" data-action="approve-request" data-req-id="${r.id || r.clinicId}" title="Re-evaluate & approve"><i class="fa-solid fa-rotate-left"></i> Re-Approve</button>
            </div>
          `;
        }

        const docCount = (r.doctors && r.doctors.length) ? r.doctors.length : Number(r.doctorsCount || 1);

        return `
          <tr data-request-id="${r.id || r.clinicId}">
            <td><strong>${r.id || r.clinicId}</strong><br><small style="color:var(--text-muted)">${r.formattedDate || r.submittedAt?.slice(0, 10) || 'Recent'}</small></td>
            <td><strong>${r.name}</strong><br><small><i class="fa-solid fa-location-dot" style="color:#0284c7"></i> ${r.city}</small></td>
            <td><strong>${r.applicantName || 'Applicant'}</strong><br><small style="color:var(--text-muted)">${r.phone || r.email || 'N/A'}</small></td>
            <td>
              <span><i class="fa-solid fa-user-doctor" style="color:var(--primary-teal)"></i> ${docCount} Doctor${docCount > 1 ? 's' : ''}</span>
              <br><small style="color:var(--text-muted);display:block;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.specialties || ''}">${r.specialties || 'General'}</small>
            </td>
            <td>${statusBadge}</td>
            <td>${actionBtns}</td>
          </tr>
        `;
      }).join('');

      const tableContainer = document.getElementById('requestsTable');
      if (tableContainer) {
        tableContainer.innerHTML = table(
          ['App ID & Date', 'Clinic & City', 'Applicant & Contact', 'Doctors & Specialties', 'Status', 'Actions'],
          rows,
          'No registration requests found matching these filters.'
        );
      }
    };

    document.getElementById('reqSearch')?.addEventListener('input', updateRequests);
    document.getElementById('reqStatusFilter')?.addEventListener('change', updateRequests);
    updateRequests();
    return;
  }

  // Active network clinics view
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    ${tabBarHtml}
    <section class="admin-card">
      <div class="admin-filter-row">
        <div class="form-group" style="flex:1;min-width:220px;margin:0">
          <input class="form-input" id="clinicSearch" placeholder="Search by clinic, city, or ID">
        </div>
        <select class="form-select" id="clinicServiceFilter">
          <option value="">All service tiers</option>
          <option value="receptionist">With Receptionist Service (Dual Role)</option>
          <option value="doctor-only">Doctor-Only Mode (Direct)</option>
          <option value="digitalPrescription">With Digital Prescription</option>
          <option value="certificates">With Medical Certificates</option>
        </select>
        <select class="form-select" id="clinicStatus">
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Paused</option>
          <option>Suspended</option>
        </select>
      </div>
      <div id="clinicTable" style="margin-top:16px"></div>
    </section>
  `);

  const update = () => {
    const term = document.getElementById('clinicSearch').value.toLowerCase();
    const status = document.getElementById('clinicStatus').value;
    const serviceFilter = document.getElementById('clinicServiceFilter').value;
    
    const filtered = clinics.filter(c => {
      const matchesTerm = `${c.name} ${c.city} ${c.id} ${c.specialties || ''}`.toLowerCase().includes(term);
      const matchesStatus = !status || c.status === status;
      let matchesService = true;
      if (serviceFilter === 'receptionist') matchesService = (c.services || []).includes('receptionist');
      if (serviceFilter === 'doctor-only') matchesService = !(c.services || []).includes('receptionist');
      if (serviceFilter === 'digitalPrescription') matchesService = (c.services || []).includes('digitalPrescription');
      if (serviceFilter === 'certificates') matchesService = (c.services || []).includes('certificates');
      return matchesTerm && matchesStatus && matchesService;
    });

    document.getElementById('clinicTable').innerHTML = table(
      ['Clinic', 'City', 'Access Role', 'Subscribed Services', 'Doctors', 'Patients', 'Status'],
      filtered.map(c => `
        <tr data-clinic-id="${c.id}">
          <td><strong>${c.name}</strong><br><small>${c.id}</small></td>
          <td>${c.city}</td>
          <td>${(c.services || []).includes('receptionist') ? '<span class="role-badge role-badge-receptionist"><i class="fa-solid fa-user-nurse"></i> Doctor + Receptionist</span>' : '<span class="role-badge role-badge-doctor"><i class="fa-solid fa-user-doctor"></i> Doctor Only (Direct)</span>'}</td>
          <td>${renderServiceTagsMini(c.services)}</td>
          <td>${c.doctors}</td>
          <td>${(c.patients || 0).toLocaleString()}</td>
          <td><span class="status-pill ${c.status === 'Paused' ? 'paused' : c.status === 'Suspended' ? 'account-status-suspended' : ''}">${c.status}</span></td>
        </tr>
      `).join('')
    );
    renderDoctorManagement();
  };

  document.getElementById('clinicSearch').addEventListener('input', update);
  document.getElementById('clinicStatus').addEventListener('change', update);
  document.getElementById('clinicServiceFilter').addEventListener('change', update);
  update();
}

function renderDoctorManagement() {
  const pageRoot = content.querySelector('.admin-page');
  if (!pageRoot || pageRoot.querySelector('#doctorManagement')) return;
  pageRoot.insertAdjacentHTML('beforeend', `
    <section class="admin-card" id="doctorManagement">
      <div class="admin-card-header">
        <div><h2>Doctor management</h2><span>Every doctor account is mapped to a registered clinic in MongoDB.</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <span>${clinicDoctors.length} accounts</span>
          <button class="btn-primary" data-action="open-add-doctor-global" style="padding:5px 12px;font-size:12px;display:inline-flex;align-items:center;gap:6px">
            <i class="fa-solid fa-user-plus"></i> Add Doctor
          </button>
        </div>
      </div>
      ${table(['Doctor', 'Clinic', 'Email', 'Specialty', 'Status', 'Action'], clinicDoctors.map(doctor => `
        <tr data-doctor-name="${doctor.name}">
          <td><strong>${doctor.name}</strong><br><small>${doctor.registration || 'Credential on file'}</small></td>
          <td>${doctor.clinic}</td>
          <td>${doctor.email || 'Not provided'}</td>
          <td>${doctor.specialty}</td>
          <td><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn-secondary suspend-button" style="font-size:11px;padding:4px 8px" data-action="toggle-doctor" data-doctor="${doctor.name}" data-clinic="${doctor.clinicId || ''}">${doctor.status === 'Suspended' ? 'Restore' : 'Suspend'}</button>
              <button class="btn-secondary" style="font-size:11px;padding:4px 8px;color:#dc2626;border-color:#dc2626" data-action="delete-doctor" data-doctor-id="${doctor._id || doctor.id || doctor.name}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `).join(''))}
    </section>
  `);
}

function renderServices() {
  page(
    'Platform Services & Clinic Feature Modules',
    'Manage modular capabilities per clinic. Services can be enabled or disabled anytime and sync live to the database.',
    `
      <div class="services-admin-grid">
        ${PLATFORM_SERVICES.map(svc => `
          <div class="service-admin-card">
            <div class="service-admin-card-header">
              <div class="service-admin-icon"><i class="${svc.icon}"></i></div>
              <div class="service-admin-title-group">
                <span class="service-admin-badge">${svc.badge}</span>
                <h3>${svc.name}</h3>
              </div>
            </div>
            <p class="service-admin-desc">${svc.desc}</p>
            <div class="service-admin-features">
              <strong>Key Capabilities:</strong>
              <ul>
                ${svc.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
              </ul>
            </div>
            <div class="service-admin-usage">
              <span>Active in <strong>${clinics.filter(c => (c.services || []).includes(svc.id)).length} of ${clinics.length}</strong> clinics</span>
            </div>
          </div>
        `).join('')}
      </div>

      <section class="admin-card" style="margin-top:20px">
        <div class="admin-card-header">
          <div>
            <h2>Clinic Service Provisioning Matrix</h2>
            <span>Toggle modular services on or off per clinic. Changes are instantly saved to MongoDB.</span>
          </div>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table services-matrix-table">
            <thead>
              <tr>
                <th style="width:200px">Clinic</th>
                <th>Role Access</th>
                <th style="text-align:center"><i class="fa-solid fa-user-nurse" style="color:#0f766e"></i> Reception Desk</th>
                <th style="text-align:center"><i class="fa-solid fa-users-line" style="color:#0284c7"></i> Patient Queue</th>
                <th style="text-align:center"><i class="fa-solid fa-file-prescription" style="color:#2563eb"></i> Digital Rx</th>
                <th style="text-align:center"><i class="fa-solid fa-certificate" style="color:#d97706"></i> Certificates</th>
                <th style="text-align:center"><i class="fa-solid fa-file-invoice-dollar" style="color:#16a34a"></i> Billing</th>
                <th style="text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${clinics.map(c => {
                const s = c.services || [];
                const isRec = s.includes('receptionist');
                const isAppt = s.includes('appointment');
                const isRx = s.includes('digitalPrescription');
                const isCert = s.includes('certificates');
                const isBill = s.includes('billing');

                return `
                  <tr data-clinic-id="${c.id}">
                    <td><strong>${c.name}</strong><br><small>${c.city} · ${c.id}</small></td>
                    <td>${isRec ? '<span class="role-badge role-badge-receptionist"><i class="fa-solid fa-user-nurse"></i> Doctor + Receptionist</span>' : '<span class="role-badge role-badge-doctor"><i class="fa-solid fa-user-doctor"></i> Doctor Only (Direct)</span>'}</td>
                    <td style="text-align:center">
                      <button class="svc-toggle-btn ${isRec ? 'is-active' : ''}" data-action="toggle-service" data-clinic="${c.id}" data-service="receptionist" title="${isRec ? 'Disable Receptionist' : 'Enable Receptionist'}">
                        <i class="fa-solid ${isRec ? 'fa-check' : 'fa-xmark'}"></i>
                      </button>
                    </td>
                    <td style="text-align:center">
                      <button class="svc-toggle-btn ${isAppt ? 'is-active' : ''} ${!isRec ? 'is-disabled' : ''}" data-action="toggle-service" data-clinic="${c.id}" data-service="appointment" title="${!isRec ? 'Requires Receptionist Service' : isAppt ? 'Disable Queue' : 'Enable Queue'}" ${!isRec ? 'disabled' : ''}>
                        <i class="fa-solid ${isAppt ? 'fa-check' : 'fa-xmark'}"></i>
                      </button>
                    </td>
                    <td style="text-align:center">
                      <button class="svc-toggle-btn ${isRx ? 'is-active' : ''}" data-action="toggle-service" data-clinic="${c.id}" data-service="digitalPrescription" title="${isRx ? 'Disable Digital Rx' : 'Enable Digital Rx'}">
                        <i class="fa-solid ${isRx ? 'fa-check' : 'fa-xmark'}"></i>
                      </button>
                    </td>
                    <td style="text-align:center">
                      <button class="svc-toggle-btn ${isCert ? 'is-active' : ''}" data-action="toggle-service" data-clinic="${c.id}" data-service="certificates" title="${isCert ? 'Disable Certificates' : 'Enable Certificates'}">
                        <i class="fa-solid ${isCert ? 'fa-check' : 'fa-xmark'}"></i>
                      </button>
                    </td>
                    <td style="text-align:center">
                      <button class="svc-toggle-btn ${isBill ? 'is-active' : ''}" data-action="toggle-service" data-clinic="${c.id}" data-service="billing" title="${isBill ? 'Disable Billing' : 'Enable Billing'}">
                        <i class="fa-solid ${isBill ? 'fa-check' : 'fa-xmark'}"></i>
                      </button>
                    </td>
                    <td style="text-align:right">
                      <button class="btn-secondary" data-action="edit-clinic" data-clinic="${c.id}" style="padding:4px 10px;font-size:12px">
                        <i class="fa-solid fa-pen"></i> Edit
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `
  );
}

function renderLogs() {
  page('Log management', 'Filter, inspect, and export administrator and system audit events from MongoDB database.', '', `<button class="btn-secondary" data-action="clear-logs"><i class="fa-solid fa-trash-can"></i> Clear logs</button><button class="btn-primary" data-action="export"><i class="fa-solid fa-download"></i> Export CSV</button>`);
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    <section class="admin-card">
      <div class="admin-filter-row">
        <div class="form-group" style="flex:1;min-width:220px;margin:0">
          <input class="form-input" id="logSearch" placeholder="Search by admin, action, or entity">
        </div>
        <select class="form-select" id="logResult">
          <option value="">All results</option>
          <option>Success</option>
          <option>Warning</option>
          <option>Failed</option>
        </select>
        <select class="form-select" id="logEntity">
          <option value="">All entities</option>
          <option>Clinic</option>
          <option>Doctor</option>
          <option>Service</option>
          <option>Account</option>
          <option>Billing</option>
        </select>
      </div>
      <div id="logTable" style="margin-top:16px"></div>
    </section>
  `);

  const update = () => {
    const term = document.getElementById('logSearch').value.toLowerCase();
    const result = document.getElementById('logResult').value;
    const entity = document.getElementById('logEntity').value;
    const filtered = activityLogs.filter(log => {
      const matchesTerm = `${log.action} ${log.entity} ${log.entityId || ''} ${log.admin || ''}`.toLowerCase().includes(term);
      const matchesResult = !result || log.result === result;
      const matchesEntity = !entity || log.entity === entity;
      return matchesTerm && matchesResult && matchesEntity;
    });

    document.getElementById('logTable').innerHTML = table(
      ['Timestamp', 'Administrator', 'Action', 'Entity', 'Details', 'Result'],
      filtered.map(l => `
        <tr>
          <td><small>${new Date(l.timestamp || l.createdAt || Date.now()).toLocaleString('en-IN')}</small></td>
          <td><strong>${l.admin || 'Administrator'}</strong></td>
          <td>${l.action}</td>
          <td><span class="role-badge role-badge-doctor">${l.entity}: ${l.entityId || 'N/A'}</span></td>
          <td><small>${l.details || '—'}</small></td>
          <td><span class="status-pill ${l.result === 'Failed' ? 'account-status-suspended' : l.result === 'Warning' ? 'paused' : ''}">${l.result}</span></td>
        </tr>
      `).join(''),
      'No audit log entries recorded yet.'
    );
  };

  document.getElementById('logSearch').addEventListener('input', update);
  document.getElementById('logResult').addEventListener('change', update);
  document.getElementById('logEntity').addEventListener('change', update);
  update();
}

// Admin Accounts Tab - Clean and Simple without Complex Regex Errors
function renderAdmins() {
  page('Admin Account Management', 'Create verified administrator accounts stored directly in MongoDB database.', '', '');
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    <div class="admin-grid">
      <section class="admin-card">
        <div class="admin-card-header">
          <div><h2>Add Administrator</h2><span>New accounts are created directly in MongoDB.</span></div>
          <i class="fa-solid fa-user-shield"></i>
        </div>
        <form id="adminForm" class="clinic-form-grid">
          <div class="form-group">
            <label class="form-label">Full Name <span class="req">*</span></label>
            <input class="form-input" name="name" required minlength="2" placeholder="e.g. John Doe" autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label">Work Email <span class="req">*</span></label>
            <input class="form-input" name="email" type="email" required placeholder="admin@dhyeyclinic.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label class="form-label">Username <span class="req">*</span></label>
            <input class="form-input" name="username" required minlength="3" maxlength="30" placeholder="e.g. admin_john" autocomplete="username">
            <small class="clinic-form-help">Enter a username (at least 3 characters).</small>
          </div>
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input class="form-input" name="employeeId" placeholder="e.g. ADM-002">
          </div>
          <div class="form-group">
            <label class="form-label">Password <span class="req">*</span></label>
            <input class="form-input" name="password" type="password" required minlength="6" placeholder="At least 6 characters" autocomplete="new-password">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password <span class="req">*</span></label>
            <input class="form-input" name="confirmPassword" type="password" required minlength="6" placeholder="Repeat password" autocomplete="new-password">
          </div>
          <div class="form-group full-width">
            <label class="form-check-label"><input type="checkbox" name="attestation" required checked> I confirm this person is an authorized administrator.</label>
          </div>
          <div class="full-width">
            <button class="btn-primary" type="submit"><i class="fa-solid fa-user-plus"></i> Create Admin Account</button>
          </div>
        </form>
      </section>
      
      <section class="admin-card">
        <div class="admin-card-header">
          <div><h2>Registered Administrators</h2><span>Fetched directly from MongoDB.</span></div>
          <span class="badge-count">${adminAccounts.length}</span>
        </div>
        <div id="adminAccountsTable"></div>
      </section>
    </div>
  `);

  const accountTable = document.getElementById('adminAccountsTable');
  const renderAccountTable = () => {
    accountTable.innerHTML = table(
      ['Name', 'Username', 'Email', 'Employee ID', 'Created', 'Action'],
      adminAccounts.map(admin => `
        <tr>
          <td><strong>${admin.name}</strong></td>
          <td>${admin.username}</td>
          <td>${admin.email || 'N/A'}</td>
          <td>${admin.employeeId || 'ADM'}</td>
          <td>${admin.createdAt ? new Date(admin.createdAt).toLocaleString('en-IN') : 'Active'}</td>
          <td>
            ${admin.username !== 'admin' ? `
              <button class="btn-secondary" style="font-size:11px;padding:4px 8px;color:#dc2626;border-color:#dc2626" data-action="delete-admin" data-admin-id="${admin._id || admin.id}"><i class="fa-solid fa-trash"></i></button>
            ` : '<span style="font-size:11px;color:var(--text-muted)">Master Admin</span>'}
          </td>
        </tr>
      `).join(''),
      'No administrator accounts found in database.'
    );
  };
  renderAccountTable();

  document.getElementById('adminForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('password'));
    const confirmPassword = String(data.get('confirmPassword'));

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          name: data.get('name').trim(),
          email: data.get('email').trim(),
          username: data.get('username').trim(),
          employeeId: (data.get('employeeId') || '').trim(),
          password
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'The server could not create this administrator.');
      }

      await fetchAdminsFromDB();
      await logActivity('Created administrator account', 'Account', result.admin.username, 'Success', result.admin.employeeId);
      form.reset();
      renderAccountTable();
      showToast('Administrator account created successfully in MongoDB database!');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submit.disabled = false;
    }
  });
}

// Feedback & Complaints
function escapeFeedbackHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function renderFeedbackInbox() {
  page('Complaints & Feedback Inbox', 'Monitor and resolve patient/staff inquiries, complaints, and service reviews from MongoDB.', '', '');
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    <section class="admin-card">
      <div class="admin-filter-row">
        <div class="form-group" style="flex:1;min-width:220px;margin:0">
          <input class="form-input" id="feedbackSearch" placeholder="Search by name, contact, category, or ticket ID">
        </div>
        <select class="form-select" id="feedbackStatus">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select class="form-select" id="feedbackCategory">
          <option value="">All Categories</option>
          <option value="clinic_request">Clinic Registration Request</option>
          <option value="feature_request">Feature Request</option>
          <option value="bug_report">Bug Report</option>
          <option value="general_feedback">General Feedback</option>
          <option value="Prescription">Prescription</option>
          <option value="Billing">Billing</option>
          <option value="Reception">Reception</option>
          <option value="Doctor Care">Doctor Care</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div id="feedbackTable" style="margin-top:16px"></div>
    </section>
  `);

  const update = () => {
    const term = (document.getElementById('feedbackSearch')?.value || '').toLowerCase().trim();
    const status = document.getElementById('feedbackStatus')?.value || '';
    const category = document.getElementById('feedbackCategory')?.value || '';

    const filtered = activeFeedbackTickets.filter(item => {
      const submitter = item.doctorName || item.name || item.metaDetails?.senderName || item.metaDetails?.name || '';
      const ticketId = item.ticketNo || item.ticketId || item._id || '';
      const phone = item.phone || item.email || item.metaDetails?.phone || item.metaDetails?.email || '';
      const message = item.message || item.feedback || item.subject || '';
      const clinicName = item.clinicName || '';

      const matchesTerm = `${ticketId} ${submitter} ${phone} ${message} ${clinicName}`.toLowerCase().includes(term);
      const matchesStatus = !status || item.status === status || (status === 'In Progress' && item.status === 'In-Progress');
      const matchesCat = !category || item.category === category || item.categoryLabel === category;
      return matchesTerm && matchesStatus && matchesCat;
    });

    document.getElementById('feedbackTable').innerHTML = table(
      ['Ticket ID', 'Submitted By', 'Category', 'Clinic', 'Subject & Message', 'Status', 'Action'],
      filtered.map(f => {
        const ticketId = f.ticketNo || f.ticketId || (f._id ? f._id.slice(-6) : 'TKT');
        const submitterName = f.doctorName || f.name || f.metaDetails?.senderName || f.metaDetails?.name || (f.clinicName === 'Landing Page Visitor' ? 'Landing Visitor' : 'Dr. / Staff User');
        const submitterContact = f.metaDetails?.phone || f.phone || f.metaDetails?.email || f.email || (f.doctorId && f.doctorId !== 'demo-doc' ? `ID: ${f.doctorId}` : 'N/A');
        const isLandingVisitor = (f.clinicName === 'Landing Page Visitor') || (f.metaDetails?.source && String(f.metaDetails.source).toLowerCase().includes('landing')) || (f.doctorName === 'Landing Page Visitor') || (f.doctorName === 'Website Visitor');
        const dateStr = new Date(f.createdAt || Date.now()).toLocaleDateString('en-IN');
        const statusBadgeClass = f.status === 'Resolved' ? '' : (f.status === 'In Progress' || f.status === 'In-Progress') ? 'paused' : 'account-status-suspended';
        const fid = f._id || f.ticketNo || f.ticketId;

        return `
        <tr data-feedback-id="${fid}">
          <td><strong>${ticketId}</strong><br><small style="color:var(--text-muted)">${dateStr}</small></td>
          <td><strong>${escapeFeedbackHtml(submitterName)}</strong><br><small style="color:var(--text-muted)">${escapeFeedbackHtml(submitterContact)}</small></td>
          <td><span class="role-badge role-badge-doctor">${escapeFeedbackHtml(f.categoryLabel || f.category || 'General')}</span></td>
          <td>${escapeFeedbackHtml(f.clinicName || 'Dhyey Main Clinic')}</td>
          <td>
            <strong>${escapeFeedbackHtml(f.subject || 'Inquiry / Feedback')}</strong><br>
            <small style="max-width:240px;display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-muted)">${escapeFeedbackHtml(f.message || f.feedback || '')}</small>
          </td>
          <td><span class="status-pill ${statusBadgeClass}">${f.status || 'Pending'}</span></td>
          <td>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="btn-secondary" data-action="view-feedback" data-feedback-id="${fid}" style="padding:4px 8px;font-size:11px"><i class="fa-solid fa-eye"></i> View</button>
              ${!isLandingVisitor ? `<button class="btn-primary" data-action="reply-feedback" data-feedback-id="${fid}" style="padding:4px 8px;font-size:11px"><i class="fa-solid fa-reply"></i> Give Response</button>` : ''}
            </div>
          </td>
        </tr>
      `;
      }).join(''),
      'No complaints or feedback found.'
    );
  };

  document.getElementById('feedbackSearch')?.addEventListener('input', update);
  document.getElementById('feedbackStatus')?.addEventListener('change', update);
  document.getElementById('feedbackCategory')?.addEventListener('change', update);
  update();
}

function openFeedbackViewModal(feedbackId) {
  const f = activeFeedbackTickets.find(item => item._id === feedbackId || item.ticketNo === feedbackId || item.ticketId === feedbackId);
  if (!f) {
    showToast('Feedback ticket not found.', 'error');
    return;
  }
  const modal = document.getElementById('detailsModal');
  const ticketId = f.ticketNo || f.ticketId || (f._id ? f._id.slice(-6) : 'TKT');
  const submitterName = f.doctorName || f.name || f.metaDetails?.senderName || f.metaDetails?.name || (f.clinicName === 'Landing Page Visitor' ? 'Landing Visitor' : 'Dr. / Staff User');
  const submitterContact = f.metaDetails?.phone || f.phone || f.metaDetails?.email || f.email || (f.doctorId && f.doctorId !== 'demo-doc' ? `ID: ${f.doctorId}` : 'N/A');
  const isLandingVisitor = (f.clinicName === 'Landing Page Visitor') || (f.metaDetails?.source && String(f.metaDetails.source).toLowerCase().includes('landing')) || (f.doctorName === 'Landing Page Visitor') || (f.doctorName === 'Website Visitor');
  const dateStr = new Date(f.createdAt || Date.now()).toLocaleString('en-IN');
  const statusBadgeClass = f.status === 'Resolved' ? '' : (f.status === 'In Progress' || f.status === 'In-Progress') ? 'paused' : 'account-status-suspended';
  const replies = Array.isArray(f.replies) ? f.replies : [];

  modal.innerHTML = `
    <div class="detail-modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title" style="margin-bottom:4px"><i class="fa-solid fa-comments"></i> Support Ticket: ${ticketId}</h2>
          <span style="font-size:12px;color:var(--text-muted)">Submitted on ${dateStr}</span>
        </div>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>

      <div class="detail-section">
        <div class="detail-grid">
          <div class="detail-item"><small>Submitted By</small><strong>${escapeFeedbackHtml(submitterName)}</strong></div>
          <div class="detail-item"><small>Contact / Email</small><strong>${escapeFeedbackHtml(submitterContact)}</strong></div>
          <div class="detail-item"><small>Clinic</small><strong>${escapeFeedbackHtml(f.clinicName || 'Dhyey Main Clinic')}</strong></div>
          <div class="detail-item"><small>Category</small><strong>${escapeFeedbackHtml(f.categoryLabel || f.category || 'General Feedback')}</strong></div>
          <div class="detail-item"><small>Priority</small><strong><span class="status-pill">${f.priority || 'Normal'}</span></strong></div>
          <div class="detail-item"><small>Current Status</small><strong><span class="status-pill ${statusBadgeClass}">${f.status || 'Pending'}</span></strong></div>
        </div>
      </div>

      <div class="detail-section">
        <h3><i class="fa-solid fa-envelope-open-text"></i> ${escapeFeedbackHtml(f.subject || 'Ticket Message')}</h3>
        <div style="background:var(--bg-page,#f8fafc);border:1px solid var(--border-color,#e2e8f0);padding:14px;border-radius:var(--radius-md,8px);line-height:1.6;font-size:13px;white-space:pre-wrap;">${escapeFeedbackHtml(f.message || f.feedback || 'No description provided.')}</div>
      </div>

      ${replies.length > 0 ? `
        <div class="detail-section">
          <h3><i class="fa-solid fa-reply-all"></i> Conversation & Admin Responses (${replies.length})</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${replies.map(r => `
              <div style="background:${r.senderRole === 'admin' ? 'rgba(9,92,84,0.06)' : '#fff'};border:1px solid ${r.senderRole === 'admin' ? 'var(--primary-teal-border,#095c5433)' : 'var(--border-color,#e2e8f0)'};border-radius:8px;padding:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <strong style="font-size:12px;color:${r.senderRole === 'admin' ? 'var(--primary-teal,#095c54)' : '#334155'}">
                    <i class="fa-solid ${r.senderRole === 'admin' ? 'fa-user-shield' : 'fa-user-doctor'}"></i> ${escapeFeedbackHtml(r.senderName || (r.senderRole === 'admin' ? 'System Administrator' : 'Doctor'))}
                  </strong>
                  <small style="color:var(--text-muted);font-size:11px">${new Date(r.createdAt || Date.now()).toLocaleString('en-IN')}</small>
                </div>
                <div style="font-size:13px;line-height:1.5;white-space:pre-wrap">${escapeFeedbackHtml(r.message)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${!isLandingVisitor ? `
        <div class="detail-section">
          <h3><i class="fa-solid fa-reply"></i> Send Response to Doctor / Clinic</h3>
          <form id="feedbackModalReplyForm" style="display:flex;flex-direction:column;gap:10px">
            <textarea class="form-textarea" id="modalReplyMsg" required rows="3" placeholder="Type administrative reply / resolution message to this doctor..."></textarea>
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Update Status:</label>
                <select class="form-select" id="modalReplyStatus" style="padding:4px 8px;font-size:12px">
                  <option value="Resolved" ${f.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                  <option value="In Progress" ${f.status === 'In Progress' || f.status === 'In-Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Closed" ${f.status === 'Closed' ? 'selected' : ''}>Closed</option>
                  <option value="Pending" ${f.status === 'Pending' ? 'selected' : ''}>Pending</option>
                </select>
              </div>
              <button class="btn-primary" type="submit" style="padding:6px 14px;font-size:12px"><i class="fa-solid fa-paper-plane"></i> Send Reply</button>
            </div>
          </form>
        </div>
      ` : `
        <div class="detail-section">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px">
              <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Update Status:</label>
              <select class="form-select" id="visitorStatusSelect" style="padding:4px 8px;font-size:12px">
                <option value="Pending" ${f.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="In Progress" ${f.status === 'In Progress' || f.status === 'In-Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Resolved" ${f.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                <option value="Closed" ${f.status === 'Closed' ? 'selected' : ''}>Closed</option>
              </select>
            </div>
            <button class="btn-secondary" id="saveVisitorStatusBtn" style="padding:6px 14px;font-size:12px"><i class="fa-solid fa-check"></i> Update Status</button>
          </div>
        </div>
      `}

      <div class="modal-footer">
        <button class="btn-secondary" data-action="close-details">Close</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  if (!isLandingVisitor) {
    document.getElementById('feedbackModalReplyForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const replyMsg = document.getElementById('modalReplyMsg')?.value?.trim();
      const newStatus = document.getElementById('modalReplyStatus')?.value || 'Resolved';
      if (!replyMsg) {
        showToast('Please enter a reply message.', 'error');
        return;
      }
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const fid = f._id || f.ticketNo || f.ticketId;
        const res = await fetch(`${API_BASE_URL}/api/feedback/${fid}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ message: replyMsg, status: newStatus })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to send reply.');
        await fetchFeedbackFromDB();
        await logActivity('Responded to feedback ticket', 'Feedback', ticketId, 'Success', `Status: ${newStatus}`);
        showToast(`Response sent to doctor and ticket marked as ${newStatus}!`);
        closeDetails();
        renderFeedbackInbox();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  } else {
    document.getElementById('saveVisitorStatusBtn')?.addEventListener('click', async () => {
      const newStatus = document.getElementById('visitorStatusSelect')?.value;
      const fid = f._id || f.ticketNo || f.ticketId;
      try {
        const res = await fetch(`${API_BASE_URL}/api/feedback/${fid}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify({ status: newStatus })
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update status.');
        await fetchFeedbackFromDB();
        showToast(`Ticket status updated to ${newStatus}.`);
        closeDetails();
        renderFeedbackInbox();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

function openFeedbackReplyModal(feedbackId) {
  openFeedbackViewModal(feedbackId);
  setTimeout(() => {
    document.getElementById('modalReplyMsg')?.focus();
  }, 100);
}

// Analysis Views
function renderAnalysis(type) {
  const titles = {
    clinic: ['Clinic-wise Performance Analysis', 'Patient traffic, consultations, and revenue distribution by facility.'],
    doctor: ['Doctor-wise Clinical Performance', 'Consultation volumes, follow-ups, and patient ratings by doctor.'],
    patient: ['Patient Population & Demographics Analysis', 'Registered patient demographics, visit frequency, and loyalty records.']
  };

  const [title, subtitle] = titles[type] || titles.clinic;
  page(title, subtitle, '', `<button class="btn-primary" data-action="export"><i class="fa-solid fa-download"></i> Export CSV</button>`);

  if (type === 'doctor') {
    content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
      <section class="admin-card">
        ${table(
          ['Doctor Name', 'Clinic', 'Specialty', 'Patients Treated', 'Visits Logged', 'Quality Rating'],
          clinicDoctors.map(d => `
            <tr>
              <td><strong>${d.name}</strong><br><small>${d.registration || 'Reg on file'}</small></td>
              <td>${d.clinic}</td>
              <td>${d.specialty}</td>
              <td>${d.patients || 0}</td>
              <td>${d.visits || 0}</td>
              <td><span class="status-pill">${d.rating || 92}% Positive</span></td>
            </tr>
          `).join('')
        )}
      </section>
    `);
  } else if (type === 'patient') {
    content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
      <section class="admin-card">
        ${table(
          ['Patient ID', 'Full Name', 'Primary Clinic', 'Doctor', 'Visits', 'Contact', 'Status'],
          patients.map(p => `
            <tr data-patient-id="${p.id}">
              <td><strong>${p.id}</strong></td>
              <td><strong>${p.name}</strong></td>
              <td>${p.clinic}</td>
              <td>${p.doctor}</td>
              <td>${p.visits}</td>
              <td>${p.phone || 'N/A'}</td>
              <td><span class="status-pill">${p.status}</span></td>
            </tr>
          `).join(''),
          'No patient records found in database.'
        )}
      </section>
    `);
  } else {
    content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
      <section class="admin-card">
        ${table(
          ['Clinic Name', 'City', 'Services Active', 'Doctors', 'Patients', 'Visits', 'Status'],
          clinics.map(c => `
            <tr data-clinic-id="${c.id}">
              <td><strong>${c.name}</strong><br><small>${c.id}</small></td>
              <td>${c.city}</td>
              <td>${renderServiceTagsMini(c.services)}</td>
              <td>${c.doctors}</td>
              <td>${(c.patients || 0).toLocaleString()}</td>
              <td>${c.visits || 0}</td>
              <td><span class="status-pill ${c.status === 'Paused' ? 'paused' : c.status === 'Suspended' ? 'account-status-suspended' : ''}">${c.status}</span></td>
            </tr>
          `).join('')
        )}
      </section>
    `);
  }
}

// Modals: Add Clinic, Edit Clinic, Add Doctor, etc.
function doctorEntry(index) {
  return `
    <div class="doctor-entry">
      <div class="doctor-entry-header">
        <strong>Doctor ${index}</strong>
        <button type="button" class="remove-doctor">Remove</button>
      </div>
      <div class="clinic-form-grid">
        <div class="form-group"><label class="form-label">Full Name <span class="req">*</span></label><input class="form-input doctor-name" required placeholder="Dr. Full Name"></div>
        <div class="form-group"><label class="form-label">Specialization <span class="req">*</span></label><input class="form-input doctor-specialty" required placeholder="e.g. General Medicine, Cardiology"></div>
        <div class="form-group"><label class="form-label">Registration Number</label><input class="form-input doctor-reg" placeholder="GMC-2026-XXXX"></div>
        <div class="form-group"><label class="form-label">Doctor Email <span class="req">*</span></label><input class="form-input doctor-email" type="email" required placeholder="doctor@example.com"></div>
        <div class="form-group"><label class="form-label">Initial Login Password <span class="req">*</span></label><input class="form-input doctor-password" type="password" minlength="6" required value="Password@123" placeholder="At least 6 characters"></div>
      </div>
    </div>
  `;
}

function openClinicModal() {
  const modal = document.getElementById('clinicModal');
  modal.innerHTML = `
    <div class="clinic-modal-card">
      <div class="modal-header">
        <h2 class="modal-title">Register a Clinic & Configure Services</h2>
        <button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>
      </div>
      <form id="clinicForm">
        <div class="modal-body">
          
          <!-- Clinic Identity -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-hospital"></i> Clinic Identity and Contact</h3>
            <div class="clinic-form-grid">
              <div class="form-group"><label class="form-label">Legal Clinic Name <span class="req">*</span></label><input class="form-input" name="name" required placeholder="Registered clinic name"></div>
              <div class="form-group"><label class="form-label">Registration Number</label><input class="form-input" name="registration" placeholder="e.g. REG-2026-AHM-01"></div>
              <div class="form-group"><label class="form-label">Phone Number <span class="req">*</span></label><input class="form-input" name="phone" required type="tel" placeholder="10-digit mobile or landline"></div>
              <div class="form-group"><label class="form-label">Email Address <span class="req">*</span></label><input class="form-input" name="email" required type="email" placeholder="clinic@example.com"></div>
              <div class="form-group full-width"><label class="form-label">Complete Address <span class="req">*</span></label><textarea class="form-textarea" name="address" required rows="2" placeholder="Building, street, area, city, state and PIN code"></textarea></div>
              <div class="form-group"><label class="form-label">Operating Days <span class="req">*</span></label><input class="form-input" name="days" required value="Monday - Saturday" placeholder="Monday - Saturday"></div>
              <div class="form-group"><label class="form-label">Working Hours <span class="req">*</span></label><input class="form-input" name="hours" required value="09:00 - 20:00" placeholder="09:00 - 20:00"></div>
            </div>
          </div>

          <!-- Services Selection -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-cubes"></i> Clinic Services & Feature Modules</h3>
            <p class="clinic-form-help" style="margin-bottom:10px">Select which services this clinic provides. If Receptionist Service is OFF, Patient Queue is disabled (Doctor-Only direct mode).</p>
            
            <div class="services-selection-grid">
              <label class="service-select-item is-selected" id="item_receptionist">
                <input type="checkbox" name="services" value="receptionist" id="svc_receptionist" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-user-nurse" style="color:#0f766e"></i> Receptionist Service (Front Desk)</strong>
                  <small>Dual login: Receptionist registers family heads, adds members, or finds patients & pushes to doctor queue.</small>
                </div>
              </label>

              <label class="service-select-item is-selected" id="item_appointment">
                <input type="checkbox" name="services" value="appointment" id="svc_appointment" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-users-line" style="color:#0284c7"></i> Patient Consultation Queue</strong>
                  <small id="apptHelpText">Queue dispatch: Doctor takes arriving patients from queue directly without searching.</small>
                </div>
              </label>

              <label class="service-select-item is-selected" id="item_prescription">
                <input type="checkbox" name="services" value="digitalPrescription" id="svc_prescription" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-file-prescription" style="color:#2563eb"></i> Digital Multi-Language Prescription</strong>
                  <small>Regional language dosage labels (Gujarati/Hindi/English), meal timing (AF/BF), and templates.</small>
                </div>
              </label>

              <label class="service-select-item is-selected" id="item_certificates">
                <input type="checkbox" name="services" value="certificates" id="svc_certificates" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-certificate" style="color:#d97706"></i> Medical Certificates & Verification</strong>
                  <small>Generate fitness/sickness certificates with unique auto-generated certificate IDs.</small>
                </div>
              </label>

              <label class="service-select-item is-selected full-width" id="item_billing">
                <input type="checkbox" name="services" value="billing" id="svc_billing" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-file-invoice-dollar" style="color:#16a34a"></i> Billing, Invoices & Receipts</strong>
                  <small>Itemized clinical consultation invoices, payment status (Paid/Partial/Due), and receipt printouts.</small>
                </div>
              </label>
            </div>

            <!-- Dynamic Receptionist Staff Account Form -->
            <div class="receptionist-form-container" id="receptionistStaffSection">
              <div class="receptionist-form-header">
                <i class="fa-solid fa-user-nurse"></i> Receptionist Staff Account Details
              </div>
              <div class="receptionist-notice-box">
                <i class="fa-solid fa-circle-info"></i>
                <div>
                  <strong>Dual-Login Mode Enabled:</strong> The receptionist registers family heads, adds members, and pushes patients into the doctor's queue.
                </div>
              </div>
              <div class="clinic-form-grid">
                <div class="form-group">
                  <label class="form-label">Receptionist Full Name <span class="req">*</span></label>
                  <input class="form-input" id="rec_name" name="receptionistName" required placeholder="e.g. Pooja Sharma">
                </div>
                <div class="form-group">
                  <label class="form-label">Receptionist Email / Login <span class="req">*</span></label>
                  <input class="form-input" id="rec_email" name="receptionistEmail" type="email" required placeholder="receptionist@clinic.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Contact Phone</label>
                  <input class="form-input" id="rec_phone" name="receptionistPhone" type="tel" placeholder="10-digit number">
                </div>
                <div class="form-group">
                  <label class="form-label">Duty Shift / Hours</label>
                  <input class="form-input" id="rec_shift" name="receptionistShift" value="General Shift (08:30 AM - 08:30 PM)">
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Initial Login Password <span class="req">*</span></label>
                  <input class="form-input" id="rec_pwd" name="receptionistPassword" type="password" minlength="3" required value="123" placeholder="Default: 123">
                </div>
              </div>
            </div>

            <div class="receptionist-form-container" id="doctorOnlyNoticeSection" style="display:none; background:#f8fafc; border-color:#cbd5e1;">
              <div class="receptionist-form-header" style="color:#334155">
                <i class="fa-solid fa-user-doctor"></i> Doctor-Only Mode (Direct Workflow)
              </div>
              <div class="receptionist-notice-box" style="background:#ffffff; border-color:#e2e8f0; color:#475569;">
                <i class="fa-solid fa-info-circle"></i>
                <div>
                  <strong>Single Doctor Login Mode:</strong> Receptionist service and appointment queue are turned OFF. The doctor handles registration and visits directly.
                </div>
              </div>
            </div>
          </div>

          <!-- Specialties & Facilities -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-stethoscope"></i> Clinical Specialties and Facilities</h3>
            <div class="clinic-form-grid">
              <div class="form-group full-width">
                <label class="form-label">Specialties Provided <span class="req">*</span></label>
                <input class="form-input" name="specialties" required placeholder="e.g. General Medicine, Cardiology, Pediatrics">
              </div>
              <div class="form-group full-width">
                <label class="form-label">Facilities</label>
                <input class="form-input" name="facilities" placeholder="Pharmacy, Pathology Lab, Ultrasound, ECG">
              </div>
            </div>
          </div>

          <!-- Doctors and Credentials -->
          <div class="clinic-form-section">
            <div class="doctor-entry-header">
              <h3><i class="fa-solid fa-user-doctor"></i> Doctors and Credentials</h3>
              <button type="button" class="btn-secondary" id="addDoctor"><i class="fa-solid fa-plus"></i> Add Doctor</button>
            </div>
            <div id="doctorEntries">${doctorEntry(1)}</div>
          </div>

        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-shield-check"></i> Register Clinic in Database</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  const recCheckbox = document.getElementById('svc_receptionist');
  const apptCheckbox = document.getElementById('svc_appointment');
  const itemAppt = document.getElementById('item_appointment');
  const apptHelp = document.getElementById('apptHelpText');
  const recSection = document.getElementById('receptionistStaffSection');
  const docOnlySection = document.getElementById('doctorOnlyNoticeSection');
  const recFields = ['rec_name', 'rec_email', 'rec_pwd'].map(id => document.getElementById(id));

  function updateServiceDependencies() {
    const isRecOn = recCheckbox.checked;
    if (isRecOn) {
      apptCheckbox.disabled = false;
      apptCheckbox.checked = true;
      itemAppt.classList.remove('is-disabled');
      itemAppt.classList.add('is-selected');
      apptHelp.innerHTML = `Queue dispatch: Doctor takes arriving patients from queue directly without searching.`;
      recSection.style.display = 'block';
      docOnlySection.style.display = 'none';
      recFields.forEach(f => f && f.setAttribute('required', 'true'));
    } else {
      apptCheckbox.checked = false;
      apptCheckbox.disabled = true;
      itemAppt.classList.add('is-disabled');
      itemAppt.classList.remove('is-selected');
      apptHelp.innerHTML = `<span style="color:#b91c1c; font-weight:600"><i class="fa-solid fa-ban"></i> Disabled in Doctor-Only Mode</span>`;
      recSection.style.display = 'none';
      docOnlySection.style.display = 'block';
      recFields.forEach(f => f && f.removeAttribute('required'));
    }
  }

  modal.querySelectorAll('.service-select-item').forEach(item => {
    const cb = item.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', () => {
      if (cb === recCheckbox) {
        item.classList.toggle('is-selected', cb.checked);
        updateServiceDependencies();
      } else if (!cb.disabled) {
        item.classList.toggle('is-selected', cb.checked);
      }
    });
  });

  const entries = document.getElementById('doctorEntries');
  document.getElementById('addDoctor').addEventListener('click', () => {
    entries.insertAdjacentHTML('beforeend', doctorEntry(entries.children.length + 1));
  });

  entries.addEventListener('click', event => {
    if (event.target.closest('.remove-doctor') && entries.children.length > 1) {
      event.target.closest('.doctor-entry').remove();
    }
  });

  document.getElementById('clinicForm').addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const phone = String(data.get('phone')).replace(/\D/g, '');
    const registration = String(data.get('registration') || '').trim();
    const email = String(data.get('email')).trim();
    const address = String(data.get('address')).trim();
    const clinicName = data.get('name').trim();

    if (clinicName.length < 2) { showToast('Clinic name must contain at least 2 characters.'); return; }
    if (!email.includes('@')) { showToast('Enter a valid clinic email address.'); return; }

    const isRecSelected = recCheckbox.checked;
    const selectedServices = Array.from(event.target.querySelectorAll('input[name="services"]:checked'))
      .map(cb => cb.value);

    const finalServices = isRecSelected ? selectedServices : selectedServices.filter(s => s !== 'appointment');

    let receptionistData = null;
    if (isRecSelected) {
      const recName = data.get('receptionistName')?.trim();
      const recEmail = data.get('receptionistEmail')?.trim();
      const recPhone = String(data.get('receptionistPhone') || '').replace(/\D/g, '');
      const recShift = data.get('receptionistShift')?.trim();
      const recPwd = data.get('receptionistPassword');

      if (!recName || recName.length < 2) { showToast('Enter receptionist full name.'); return; }
      if (!recEmail || !recEmail.includes('@')) { showToast('Enter a valid receptionist email.'); return; }

      receptionistData = {
        name: recName,
        email: recEmail,
        phone: recPhone || phone,
        shift: recShift || 'General Shift',
        password: recPwd || '123',
        status: 'Active'
      };
    }

    const newDoctors = [...entries.querySelectorAll('.doctor-entry')].map(entry => ({
      name: entry.querySelector('.doctor-name').value.trim(),
      specialty: entry.querySelector('.doctor-specialty').value.trim(),
      registration: entry.querySelector('.doctor-reg').value.trim(),
      email: entry.querySelector('.doctor-email').value.trim(),
      password: entry.querySelector('.doctor-password').value || 'Password@123',
      status: 'Active'
    }));

    // Check duplicate doctor emails only within the current form
    const formEmails = newDoctors.map(d => d.email.toLowerCase());
    if (new Set(formEmails).size !== formEmails.length) {
      showToast('Each doctor email in this form must be unique.');
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/clinics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          name: clinicName,
          city: address.split(',').pop().trim() || 'Ahmedabad',
          phone,
          email,
          registration,
          address,
          days: data.get('days'),
          hours: data.get('hours'),
          specialties: data.get('specialties'),
          facilities: data.get('facilities'),
          services: finalServices,
          receptionist: receptionistData,
          doctors: newDoctors
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create clinic in database.');
      }

      await reloadAllAdminData();
      await logActivity('Registered new clinic', 'Clinic', clinicName, 'Success', `Services: ${finalServices.join(', ')}`);
      closeModal();
      showToast(`Clinic "${clinicName}" registered successfully in MongoDB!`);
      if (location.hash === '#services') renderServices();
      else renderClinics();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Open Edit Clinic Modal with Live Services Controls & UI Adaptation
function openEditClinicModal(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId || c.clinicId === clinicId);
  if (!clinic) return;
  closeDetails();

  const services = clinic.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'];
  const isRec = services.includes('receptionist');
  const isAppt = services.includes('appointment');
  const isRx = services.includes('digitalPrescription');
  const isCert = services.includes('certificates');
  const isBill = services.includes('billing');
  const existingRec = clinic.receptionist || {};

  const modal = document.getElementById('clinicModal');
  modal.innerHTML = `
    <div class="clinic-modal-card">
      <div class="modal-header">
        <h2 class="modal-title"><i class="fa-solid fa-pen"></i> Edit Clinic & Configure Services · ${clinic.name}</h2>
        <button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>
      </div>
      <form id="editClinicForm">
        <div class="modal-body">
          
          <!-- Clinic Identity -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-hospital"></i> Clinic Identity & Contact</h3>
            <div class="clinic-form-grid">
              <div class="form-group">
                <label class="form-label">Legal Clinic Name <span class="req">*</span></label>
                <input class="form-input" name="name" required value="${clinic.name || ''}" placeholder="Clinic name">
              </div>
              <div class="form-group">
                <label class="form-label">Registration Number</label>
                <input class="form-input" name="registration" value="${clinic.registration || ''}" placeholder="REG-XXXX">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number <span class="req">*</span></label>
                <input class="form-input" name="phone" type="tel" required value="${clinic.phone || ''}" placeholder="10-digit number">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address <span class="req">*</span></label>
                <input class="form-input" name="email" type="email" required value="${clinic.email || ''}" placeholder="clinic@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Operating Days <span class="req">*</span></label>
                <input class="form-input" name="days" required value="${clinic.days || 'Monday - Saturday'}" placeholder="Mon - Sat">
              </div>
              <div class="form-group">
                <label class="form-label">Working Hours <span class="req">*</span></label>
                <input class="form-input" name="hours" required value="${clinic.hours || '09:00 - 20:00'}" placeholder="09:00 - 20:00">
              </div>
              <div class="form-group">
                <label class="form-label">Specialties</label>
                <input class="form-input" name="specialties" value="${clinic.specialties || ''}" placeholder="General Medicine, Cardiology">
              </div>
              <div class="form-group">
                <label class="form-label">Facilities</label>
                <input class="form-input" name="facilities" value="${clinic.facilities || ''}" placeholder="Pharmacy, Lab">
              </div>
              <div class="form-group full-width">
                <label class="form-label">Complete Address <span class="req">*</span></label>
                <textarea class="form-textarea" name="address" required rows="2" placeholder="Full address">${clinic.address || ''}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Clinic Status</label>
                <select class="form-select" name="status">
                  <option value="Active" ${clinic.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Paused" ${clinic.status === 'Paused' ? 'selected' : ''}>Paused</option>
                  <option value="Suspended" ${clinic.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Services & Feature Modules Configuration -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-cubes"></i> Clinic Services & Feature Modules</h3>
            <p class="clinic-form-help" style="margin-bottom:10px">Toggle services for this clinic. Changes will update this clinic's Doctor and Receptionist dashboard UI in real time.</p>
            
            <div class="services-selection-grid">
              <label class="service-select-item ${isRec ? 'is-selected' : ''}" id="edit_item_receptionist">
                <input type="checkbox" name="services" value="receptionist" id="edit_svc_receptionist" ${isRec ? 'checked' : ''}>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-user-nurse" style="color:#0f766e"></i> Receptionist Service (Front Desk)</strong>
                  <small>Dual login: Receptionist registers family heads, adds members, or finds patients & pushes to doctor queue.</small>
                </div>
              </label>

              <label class="service-select-item ${isAppt ? 'is-selected' : ''} ${!isRec ? 'is-disabled' : ''}" id="edit_item_appointment">
                <input type="checkbox" name="services" value="appointment" id="edit_svc_appointment" ${isAppt ? 'checked' : ''} ${!isRec ? 'disabled' : ''}>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-users-line" style="color:#0284c7"></i> Patient Consultation Queue</strong>
                  <small id="editApptHelpText">Queue dispatch: Doctor takes arriving patients from queue directly without searching.</small>
                </div>
              </label>

              <label class="service-select-item ${isRx ? 'is-selected' : ''}" id="edit_item_prescription">
                <input type="checkbox" name="services" value="digitalPrescription" id="edit_svc_prescription" ${isRx ? 'checked' : ''}>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-file-prescription" style="color:#2563eb"></i> Digital Multi-Language Prescription</strong>
                  <small>Regional language dosage labels (Gujarati/Hindi/English), meal timing (AF/BF), and quick templates.</small>
                </div>
              </label>

              <label class="service-select-item ${isCert ? 'is-selected' : ''}" id="edit_item_certificates">
                <input type="checkbox" name="services" value="certificates" id="edit_svc_certificates" ${isCert ? 'checked' : ''}>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-certificate" style="color:#d97706"></i> Medical Certificates & Verification</strong>
                  <small>Generate fitness/sickness certificates with unique auto-generated certificate IDs.</small>
                </div>
              </label>

              <label class="service-select-item ${isBill ? 'is-selected' : ''} full-width" id="edit_item_billing">
                <input type="checkbox" name="services" value="billing" id="edit_svc_billing" ${isBill ? 'checked' : ''}>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-file-invoice-dollar" style="color:#16a34a"></i> Billing, Invoices & Receipts</strong>
                  <small>Itemized clinical consultation invoices, payment status (Paid/Partial/Due), and receipt printouts.</small>
                </div>
              </label>
            </div>

            <!-- Receptionist Staff Account Form (Shown when Receptionist Service is ON) -->
            <div class="receptionist-form-container" id="editReceptionistSection" style="${isRec ? 'display:block;' : 'display:none;'}">
              <div class="receptionist-form-header">
                <i class="fa-solid fa-user-nurse"></i> Receptionist Staff Account
              </div>
              <div class="clinic-form-grid">
                <div class="form-group">
                  <label class="form-label">Receptionist Name <span class="req">*</span></label>
                  <input class="form-input" id="edit_rec_name" name="receptionistName" value="${existingRec.name || (clinic.name + ' Front Desk')}" placeholder="Staff Name">
                </div>
                <div class="form-group">
                  <label class="form-label">Email / Login Username <span class="req">*</span></label>
                  <input class="form-input" id="edit_rec_email" name="receptionistEmail" type="email" value="${existingRec.email || ''}" placeholder="receptionist@clinic.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Contact Phone</label>
                  <input class="form-input" id="edit_rec_phone" name="receptionistPhone" type="tel" value="${existingRec.phone || clinic.phone || ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">Duty Shift</label>
                  <input class="form-input" id="edit_rec_shift" name="receptionistShift" value="${existingRec.shift || 'General Shift (08:30 AM - 08:30 PM)'}">
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Receptionist Login Password <span class="req">*</span></label>
                  <input class="form-input" id="edit_rec_pwd" name="receptionistPassword" type="password" minlength="3" placeholder="Enter password (e.g. 123)">
                  <small class="clinic-form-help">Set or reset login password for this clinic's Reception Desk account.</small>
                </div>
              </div>
            </div>

            <div class="receptionist-form-container" id="editDoctorOnlyNotice" style="${!isRec ? 'display:block;' : 'display:none;'} background:#f8fafc; border-color:#cbd5e1;">
              <div class="receptionist-form-header" style="color:#334155">
                <i class="fa-solid fa-user-doctor"></i> Doctor-Only Mode (Direct Workflow)
              </div>
              <div class="receptionist-notice-box" style="background:#ffffff; border-color:#e2e8f0; color:#475569;">
                <i class="fa-solid fa-info-circle"></i>
                <div>
                  <strong>Doctor-Only Direct Mode:</strong> Receptionist service is turned OFF. The doctor handles patient search and visits directly.
                </div>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Save Changes to Database</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  const recCb = document.getElementById('edit_svc_receptionist');
  const apptCb = document.getElementById('edit_svc_appointment');
  const itemAppt = document.getElementById('edit_item_appointment');
  const recSec = document.getElementById('editReceptionistSection');
  const docOnlySec = document.getElementById('editDoctorOnlyNotice');

  function updateEditDependencies() {
    const on = recCb.checked;
    if (on) {
      apptCb.disabled = false;
      apptCb.checked = true;
      itemAppt.classList.remove('is-disabled');
      itemAppt.classList.add('is-selected');
      recSec.style.display = 'block';
      docOnlySec.style.display = 'none';
    } else {
      apptCb.checked = false;
      apptCb.disabled = true;
      itemAppt.classList.add('is-disabled');
      itemAppt.classList.remove('is-selected');
      recSec.style.display = 'none';
      docOnlySec.style.display = 'block';
    }
  }

  modal.querySelectorAll('.service-select-item').forEach(item => {
    const cb = item.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', () => {
      if (cb === recCb) {
        item.classList.toggle('is-selected', cb.checked);
        updateEditDependencies();
      } else if (!cb.disabled) {
        item.classList.toggle('is-selected', cb.checked);
      }
    });
  });

  document.getElementById('editClinicForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get('name').trim();
    const phone = String(data.get('phone')).replace(/\D/g, '');
    const email = data.get('email').trim();
    const registration = data.get('registration').trim();
    const address = data.get('address').trim();
    const status = data.get('status');

    if (name.length < 2) { showToast('Clinic name must be at least 2 characters.'); return; }
    if (!email.includes('@')) { showToast('Enter a valid email address.'); return; }

    const isRecSelected = recCb.checked;
    const selectedServices = Array.from(e.target.querySelectorAll('input[name="services"]:checked'))
      .map(cb => cb.value);
    const finalServices = isRecSelected ? selectedServices : selectedServices.filter(s => s !== 'appointment');

    let receptionistData = null;
    if (isRecSelected) {
      const recPwd = data.get('receptionistPassword')?.trim();
      receptionistData = {
        name: data.get('receptionistName')?.trim() || `${name} Front Desk`,
        email: data.get('receptionistEmail')?.trim() || existingRec.email,
        phone: String(data.get('receptionistPhone') || phone).replace(/\D/g, ''),
        shift: data.get('receptionistShift')?.trim() || 'General Shift',
        password: recPwd || undefined,
        status: 'Active'
      };
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/clinics/${clinic.id || clinic.clinicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          name,
          phone,
          email,
          registration,
          address,
          days: data.get('days'),
          hours: data.get('hours'),
          specialties: data.get('specialties'),
          facilities: data.get('facilities'),
          status,
          services: finalServices,
          receptionist: receptionistData
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update clinic in database.');
      }

      await reloadAllAdminData();
      await logActivity('Updated clinic & services', 'Clinic', name, 'Success', `Services: ${finalServices.join(', ')}`);
      closeModal();
      showToast(`Clinic "${name}" details and services updated successfully!`);
      if (location.hash === '#services') renderServices();
      else renderClinics();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Toggle Individual Service Direct from Services Matrix
async function toggleClinicService(clinicId, serviceId) {
  const clinic = clinics.find(c => c.id === clinicId || c.clinicId === clinicId);
  if (!clinic) return;

  const services = clinic.services || [];
  const isOn = services.includes(serviceId);

  let newServices = [];
  if (isOn) {
    newServices = services.filter(s => s !== serviceId);
    if (serviceId === 'receptionist') {
      newServices = newServices.filter(s => s !== 'appointment');
    }
  } else {
    if (serviceId === 'appointment' && !services.includes('receptionist')) {
      showToast('Appointment Queue requires Receptionist Service to be enabled first.', 'error');
      return;
    }
    newServices = [...services, serviceId];
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/clinics/${clinic.id || clinic.clinicId}/services`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ services: newServices })
    });

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update services.');

    await reloadAllAdminData();
    await logActivity(`${isOn ? 'Disabled' : 'Enabled'} service`, 'Service', `${clinic.name}:${serviceId}`);
    showToast(`${isOn ? 'Disabled' : 'Enabled'} "${serviceId}" for ${clinic.name}.`);

    if (location.hash === '#services') renderServices();
    else if (location.hash === '#clinics') renderClinics();
    else renderOverview();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Delete Clinic
async function deleteClinic(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId || c.clinicId === clinicId);
  if (!clinic) return;

  confirmAction(
    `Are you sure you want to permanently delete <strong>${clinic.name}</strong> from MongoDB database?<br>All associated doctor mappings will also be unlinked.`,
    async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/clinics/${clinic.id || clinic.clinicId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete clinic.');

        await reloadAllAdminData();
        await logActivity('Deleted clinic from database', 'Clinic', clinic.name);
        closeDetails();
        showToast(`Clinic "${clinic.name}" deleted successfully.`);
        if (location.hash === '#services') renderServices();
        else renderClinics();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

// Add Doctor Modal & Save to Database
function openAddDoctorModal(clinicId = null) {
  const clinic = clinicId ? clinics.find(c => c.id === clinicId || c.clinicId === clinicId) : null;
  const modal = document.getElementById('clinicModal');

  modal.innerHTML = `
    <div class="clinic-modal-card">
      <div class="modal-header">
        <h2 class="modal-title"><i class="fa-solid fa-user-doctor"></i> ${clinic ? `Add Doctor to ${clinic.name}` : 'Add New Doctor Account'}</h2>
        <button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>
      </div>
      <form id="addDoctorForm">
        <div class="modal-body">
          ${clinic ? `
            <input type="hidden" name="clinicId" value="${clinic.id || clinic.clinicId}">
          ` : `
            <div class="form-group" style="margin-bottom:14px">
              <label class="form-label">Assign to Clinic <span class="req">*</span></label>
              <select class="form-select" name="clinicId" required>
                ${clinics.map(c => `<option value="${c.id || c.clinicId}">${c.name} (${c.city})</option>`).join('')}
              </select>
            </div>
          `}

          <div class="clinic-form-section" style="border-top:0;padding-top:0">
            <h3><i class="fa-solid fa-id-card-clip"></i> Doctor Profile Information</h3>
            <div class="clinic-form-grid">
              <div class="form-group">
                <label class="form-label">Doctor Name <span class="req">*</span></label>
                <input class="form-input" name="doctorName" required placeholder="e.g. Dr. Rajesh Patel">
              </div>
              <div class="form-group">
                <label class="form-label">Specialization <span class="req">*</span></label>
                <input class="form-input" name="specialty" required placeholder="e.g. General Medicine, Cardiology">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address (Login Username) <span class="req">*</span></label>
                <input class="form-input" name="email" type="email" required placeholder="doctor@clinic.com">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input class="form-input" name="phone" type="tel" placeholder="10-digit mobile number">
              </div>
              <div class="form-group">
                <label class="form-label">Medical Registration No.</label>
                <input class="form-input" name="registration" placeholder="e.g. GMC-2026-01">
              </div>
              <div class="form-group">
                <label class="form-label">Login Password</label>
                <input class="form-input" name="password" type="text" value="Password@123" placeholder="Default: Password@123">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-user-plus"></i> Save Doctor in MongoDB</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  document.getElementById('addDoctorForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const targetClinicId = clinicId || data.get('clinicId');
    const targetClinic = clinics.find(c => c.id === targetClinicId || c.clinicId === targetClinicId);
    
    let rawName = (data.get('doctorName') || '').trim();
    const docName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
    const email = (data.get('email') || '').trim().toLowerCase();
    const specialty = (data.get('specialty') || '').trim() || 'General Medicine';
    const phone = String(data.get('phone') || '').replace(/\D/g, '');
    const registration = (data.get('registration') || '').trim();
    const password = (data.get('password') || '').trim() || 'Password@123';

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          name: docName,
          email,
          username: email,
          specialty,
          phone,
          registration,
          password,
          clinicId: targetClinicId,
          clinicName: targetClinic?.name || 'Dhyey Main Clinic'
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save doctor.');
      }

      await reloadAllAdminData();
      await logActivity('Added doctor account', 'Doctor', docName, 'Success', targetClinic?.name || '');
      closeModal();
      showToast(`Doctor ${docName} successfully added to database!`);
      if (location.hash === '#clinics') renderClinics();
      else renderOverview();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Request Approval / Rejection in MongoDB
async function approveClinicRequest(reqId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinics/requests/${reqId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status: 'Approved' })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Approval failed.');
    await reloadAllAdminData();
    await logActivity('Approved clinic application', 'Application', reqId);
    showToast('Clinic application approved and provisioned into MongoDB network!');
    renderClinics('requests');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function rejectClinicRequest(reqId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clinics/requests/${reqId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status: 'Rejected' })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Rejection failed.');
    await reloadAllAdminData();
    await logActivity('Rejected clinic application', 'Application', reqId);
    showToast('Clinic application rejected.');
    renderClinics('requests');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Helper confirmation dialog
function confirmAction(message, onConfirm) {
  const existing = document.getElementById('adminConfirmDialog');
  if (existing) existing.remove();
  const dlg = document.createElement('div');
  dlg.id = 'adminConfirmDialog';
  dlg.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);';
  dlg.innerHTML = `
    <div style="background:var(--surface,#fff);border-radius:14px;padding:28px 30px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.25);">
      <h3 style="margin:0 0 12px;font-size:16px"><i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;margin-right:8px"></i>Confirm Action</h3>
      <p style="margin:0 0 20px;font-size:14px;color:var(--text-muted,#64748b);line-height:1.5">${message}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="adminConfirmNo" style="padding:8px 18px;border-radius:8px;border:1px solid var(--border,#e2e8f0);background:transparent;cursor:pointer;font-size:13px">Cancel</button>
        <button id="adminConfirmYes" style="padding:8px 18px;border-radius:8px;background:#dc2626;color:#fff;border:none;cursor:pointer;font-size:13px;font-weight:600">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(dlg);
  dlg.querySelector('#adminConfirmYes').addEventListener('click', () => { dlg.remove(); onConfirm(); });
  dlg.querySelector('#adminConfirmNo').addEventListener('click', () => dlg.remove());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.remove(); });
}

function closeModal() {
  const modal = document.getElementById('clinicModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function closeDetails() {
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function openClinicDetails(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId || c.clinicId === clinicId);
  if (!clinic) return;
  const modal = document.getElementById('detailsModal');
  const assignedDoctors = clinicDoctors.filter(d => d.clinicId === clinic.id || d.clinic === clinic.name);

  modal.innerHTML = `
    <div class="detail-modal-card">
      <div class="modal-header">
        <h2 class="modal-title">${clinic.name}</h2>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>
      
      <div class="detail-section">
        <h3><i class="fa-solid fa-cubes"></i> Active Services & Role</h3>
        <div style="margin-bottom:10px">${renderServiceTagsMini(clinic.services)}</div>
        <p style="font-size:12.5px;color:var(--text-muted);margin:0">
          ${(clinic.services || []).includes('receptionist') 
            ? '<strong>Dual-Role Enabled:</strong> Dedicated receptionist desk + doctor consultation queue.' 
            : '<strong>Doctor-Only Direct Mode:</strong> Single login where doctor handles patient registration directly.'}
        </p>
      </div>

      <div class="detail-section">
        <h3><i class="fa-solid fa-hospital"></i> Clinic Information</h3>
        <div class="detail-grid">
          <div class="detail-item"><small>Clinic ID</small><strong>${clinic.id || clinic.clinicId}</strong></div>
          <div class="detail-item"><small>Registration</small><strong>${clinic.registration || 'N/A'}</strong></div>
          <div class="detail-item"><small>Status</small><strong><span class="status-pill ${clinic.status === 'Suspended' ? 'account-status-suspended' : ''}">${clinic.status}</span></strong></div>
          <div class="detail-item"><small>City</small><strong>${clinic.city}</strong></div>
          <div class="detail-item"><small>Phone</small><strong>${clinic.phone || 'N/A'}</strong></div>
          <div class="detail-item"><small>Email</small><strong>${clinic.email || 'N/A'}</strong></div>
          <div class="detail-item"><small>Operating Days</small><strong>${clinic.days || 'N/A'}</strong></div>
          <div class="detail-item"><small>Working Hours</small><strong>${clinic.hours || 'N/A'}</strong></div>
        </div>
        <div style="margin-top:8px"><small style="color:var(--text-muted)">Address:</small><br><strong>${clinic.address || 'N/A'}</strong></div>
      </div>

      <div class="detail-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <h3 style="margin-bottom:0;display:flex;align-items:center;gap:8px">
            <i class="fa-solid fa-user-doctor"></i> Doctors Mapped to This Clinic
          </h3>
          <button class="btn-primary" data-action="open-add-doctor" data-clinic="${clinic.id}" style="padding:5px 12px;font-size:12px;display:inline-flex;align-items:center;gap:6px">
            <i class="fa-solid fa-user-plus"></i> Add Doctor
          </button>
        </div>
        ${assignedDoctors.length ? table(
          ['Doctor', 'Specialty', 'Status', 'Suspend', 'Action'],
          assignedDoctors.map(doctor => `
            <tr data-doctor-name="${doctor.name}">
              <td><strong>${doctor.name}</strong><br><small>${doctor.email || ''}</small></td>
              <td>${doctor.specialty}</td>
              <td><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></td>
              <td><button class="btn-secondary suspend-button" style="font-size:11px;padding:4px 8px" data-action="toggle-doctor" data-doctor="${doctor.name}" data-clinic="${clinic.id}">${doctor.status === 'Suspended' ? 'Restore' : 'Suspend'}</button></td>
              <td><button class="btn-secondary" style="font-size:11px;padding:4px 8px;color:#dc2626;border-color:#dc2626" data-action="delete-doctor" data-doctor-id="${doctor._id || doctor.id || doctor.name}"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
          `).join('')
        ) : `
          <div class="empty-results" style="padding:16px;text-align:center">
            <p style="margin-bottom:10px;color:var(--text-muted)">No doctor accounts mapped yet.</p>
          </div>
        `}
      </div>

      <div class="modal-footer" style="gap:8px;flex-wrap:wrap">
        <button class="btn-secondary" data-action="close-details">Close</button>
        <button class="btn-secondary" data-action="edit-clinic" data-clinic="${clinic.id}" style="color:#2563eb;border-color:#2563eb"><i class="fa-solid fa-pen"></i> Edit Details & Services</button>
        <button class="btn-secondary" data-action="delete-clinic" data-clinic="${clinic.id}" style="color:#dc2626;border-color:#dc2626"><i class="fa-solid fa-trash"></i> Delete Clinic</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function openDoctorDetails(name) {
  const doctor = clinicDoctors.find(item => item.name === name);
  if (!doctor) return;
  const clinic = clinics.find(c => c.name === doctor.clinic || c.id === doctor.clinicId);
  const modal = document.getElementById('detailsModal');
  
  modal.innerHTML = `
    <div class="detail-modal-card">
      <div class="modal-header">
        <h2 class="modal-title">${doctor.name}</h2>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>
      <div class="detail-section">
        <div class="detail-grid">
          <div class="detail-item"><small>Status</small><strong><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></strong></div>
          <div class="detail-item"><small>Mapped Clinic</small><strong>${doctor.clinic}</strong></div>
          <div class="detail-item"><small>Specialization</small><strong>${doctor.specialty}</strong></div>
          <div class="detail-item"><small>Email</small><strong>${doctor.email || 'Not provided'}</strong></div>
          <div class="detail-item"><small>Registration</small><strong>${doctor.registration || 'Not provided'}</strong></div>
        </div>
      </div>
      <div class="detail-section">
        <h3><i class="fa-solid fa-cubes"></i> Active Services</h3>
        <div>${renderServiceTagsMini(clinic?.services || [])}</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" data-action="close-details">Close</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function openPatientDetails(id) {
  const patient = patients.find(item => item.id === id);
  if (!patient) return;
  const modal = document.getElementById('detailsModal');
  modal.innerHTML = `
    <div class="detail-modal-card">
      <div class="modal-header">
        <h2 class="modal-title">${patient.name}</h2>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>
      <div class="detail-section">
        <div class="detail-grid">
          <div class="detail-item"><small>Patient ID</small><strong>${patient.id}</strong></div>
          <div class="detail-item"><small>Clinic</small><strong>${patient.clinic}</strong></div>
          <div class="detail-item"><small>Primary Doctor</small><strong>${patient.doctor}</strong></div>
          <div class="detail-item"><small>Total Visits</small><strong>${patient.visits}</strong></div>
          <div class="detail-item"><small>Contact</small><strong>${patient.phone || 'Not provided'}</strong></div>
          <div class="detail-item"><small>Blood Group</small><strong>${patient.bloodGroup || 'Not recorded'}</strong></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" data-action="close-details">Close</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function openRequestDetailsModal(reqId) {
  const request = clinicRequests.find(r => r.id === reqId || r.clinicId === reqId);
  if (!request) return;
  const modal = document.getElementById('detailsModal');
  modal.innerHTML = `
    <div class="detail-modal-card">
      <div class="modal-header">
        <h2 class="modal-title">${request.name}</h2>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>
      <div class="detail-section">
        <div class="detail-grid">
          <div class="detail-item"><small>Request ID</small><strong>${request.id || request.clinicId}</strong></div>
          <div class="detail-item"><small>Applicant</small><strong>${request.applicantName || 'Applicant'} (${request.applicantRole || 'Owner'})</strong></div>
          <div class="detail-item"><small>Status</small><strong>${request.status}</strong></div>
          <div class="detail-item"><small>City</small><strong>${request.city}</strong></div>
          <div class="detail-item"><small>Contact Phone</small><strong>${request.phone}</strong></div>
          <div class="detail-item"><small>Email</small><strong>${request.email}</strong></div>
        </div>
        <div style="margin-top:8px"><small style="color:var(--text-muted)">Address:</small><br><strong>${request.address || 'N/A'}</strong></div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" data-action="close-details">Close</button>
        ${request.status === 'Pending' ? `
          <button class="btn-action-approve" data-action="approve-request" data-req-id="${request.id || request.clinicId}"><i class="fa-solid fa-check"></i> Approve & Provision</button>
          <button class="btn-action-reject" data-action="reject-request" data-req-id="${request.id || request.clinicId}"><i class="fa-solid fa-xmark"></i> Reject</button>
        ` : ''}
      </div>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function exportVisibleTable() {
  const table = document.querySelector('.admin-table');
  if (!table) { showToast('There is no analysis to export.'); return; }
  const rows = [...table.querySelectorAll('tr')].map(row => [...row.children].map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`).join(','));
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
  link.download = `dhyey-${location.hash.slice(1) || 'overview'}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Analysis CSV downloaded.');
}

function navigate(view = location.hash.slice(1) || 'overview') {
  document.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  document.querySelectorAll('.admin-subnav-link').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  
  if (view === 'overview') renderOverview();
  else if (view === 'clinics') renderClinics();
  else if (view === 'services') renderServices();
  else if (view === 'logs') renderLogs();
  else if (view === 'admins') renderAdmins();
  else if (view === 'feedback') renderFeedbackInbox();
  else if (view.startsWith('analysis-')) renderAnalysis(view.replace('analysis-', ''));
  else renderOverview();
}

// Global Event Listeners
document.addEventListener('click', async event => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) {
    event.preventDefault();
    location.hash = viewLink.dataset.view;
    navigate(viewLink.dataset.view);
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'add-clinic') openClinicModal();
  if (action === 'close-modal') closeModal();
  if (action === 'close-details') closeDetails();
  if (action === 'export') exportVisibleTable();
  
  if (action === 'toggle-doctor') {
    const doctorName = event.target.closest('[data-doctor]')?.dataset.doctor;
    const doctor = clinicDoctors.find(d => d.name === doctorName);
    if (doctor) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/doctors/${doctor._id || doctor.id || doctor.name}/status`, {
          method: 'PATCH',
          headers: getAuthHeader()
        });
        const json = await res.json();
        await reloadAllAdminData();
        showToast(`Doctor account status updated.`);
        const detailsModal = document.getElementById('detailsModal');
        if (detailsModal.classList.contains('active')) {
          closeDetails();
        }
        if (location.hash === '#clinics') renderClinics();
        else renderOverview();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  if (action === 'delete-doctor') {
    const doctorId = event.target.closest('[data-doctor-id]')?.dataset.doctorId;
    if (doctorId && confirm('Delete this doctor account from database?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/doctors/${doctorId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });
        await reloadAllAdminData();
        showToast('Doctor account deleted from database.');
        closeDetails();
        if (location.hash === '#clinics') renderClinics();
        else renderOverview();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  if (action === 'delete-admin') {
    const adminId = event.target.closest('[data-admin-id]')?.dataset.adminId;
    if (adminId && confirm('Delete this administrator account?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/admins/${adminId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to delete admin.');
        await fetchAdminsFromDB();
        renderAdmins();
        showToast('Administrator account deleted.');
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  if (action === 'switch-clinic-tab') {
    renderClinics(event.target.closest('[data-tab]')?.dataset.tab || 'active');
  }
  if (action === 'view-requests-tab') {
    renderClinics('requests');
  }
  if (action === 'view-request') {
    openRequestDetailsModal(event.target.closest('[data-req-id]')?.dataset.reqId);
  }
  if (action === 'approve-request') {
    if (confirm('Approve this clinic application and add it to the active MongoDB network?')) {
      approveClinicRequest(event.target.closest('[data-req-id]')?.dataset.reqId);
    }
  }
  if (action === 'reject-request') {
    if (confirm('Reject this clinic application?')) {
      rejectClinicRequest(event.target.closest('[data-req-id]')?.dataset.reqId);
    }
  }

  if (action === 'toggle-service') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    const serviceId = event.target.closest('[data-service]')?.dataset.service;
    if (clinicId && serviceId) toggleClinicService(clinicId, serviceId);
  }

  if (action === 'open-add-doctor') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId) openAddDoctorModal(clinicId);
  }

  if (action === 'open-add-doctor-global') {
    openAddDoctorModal();
  }

  if (action === 'edit-clinic') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId) openEditClinicModal(clinicId);
  }

  if (action === 'view-feedback') {
    const fid = event.target.closest('[data-feedback-id]')?.dataset.feedbackId;
    if (fid) openFeedbackViewModal(fid);
  }

  if (action === 'reply-feedback') {
    const fid = event.target.closest('[data-feedback-id]')?.dataset.feedbackId;
    if (fid) openFeedbackReplyModal(fid);
  }

  if (action === 'account-info') showToast('Administrator account · MongoDB connected');
  if (action === 'logout') {
    localStorage.removeItem('clinic-auth-session');
    sessionStorage.clear();
    showToast('Signed out from Admin Workspace');
    setTimeout(() => {
      window.location.replace('../login.html?logout=true');
    }, 200);
  }
  if (!event.target.closest('.admin-account')) closeAccountMenu();
});

function handleAdminLogout() {
  localStorage.removeItem('clinic-auth-session');
  sessionStorage.clear();
  window.location.replace('../login.html?logout=true');
}
window.handleAdminLogout = handleAdminLogout;

function closeAccountMenu() {
  const menu = document.getElementById('accountMenu');
  if (!menu) return;
  menu.hidden = true;
  document.getElementById('accountToggle')?.setAttribute('aria-expanded', 'false');
}

document.getElementById('accountToggle')?.addEventListener('click', event => {
  event.stopPropagation();
  const menu = document.getElementById('accountMenu');
  if (!menu) return;
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!menu.hidden));
});

const savedTheme = localStorage.getItem('dhyey-admin-theme');
if (savedTheme === 'dark') document.body.dataset.theme = 'dark';

document.getElementById('themeToggle')?.addEventListener('click', event => {
  const dark = document.body.dataset.theme !== 'dark';
  document.body.dataset.theme = dark ? 'dark' : '';
  localStorage.setItem('dhyey-admin-theme', dark ? 'dark' : 'light');
  event.currentTarget.innerHTML = `<i class="fa-solid fa-${dark ? 'sun' : 'moon'}"></i>`;
});

document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.querySelector('.sidebar')?.classList.toggle('is-collapsed');
});

document.addEventListener('click', event => {
  const requestRow = event.target.closest('[data-request-id]');
  if (requestRow && !event.target.closest('button')) openRequestDetailsModal(requestRow.dataset.requestId);

  const clinicRow = event.target.closest('[data-clinic-id]');
  if (clinicRow && !event.target.closest('button')) openClinicDetails(clinicRow.dataset.clinicId);
  
  const doctorRow = event.target.closest('[data-doctor-name]');
  if (doctorRow && !event.target.closest('button')) openDoctorDetails(doctorRow.dataset.doctorName);
  
  const patientRow = event.target.closest('[data-patient-id]');
  if (patientRow && !event.target.closest('button')) openPatientDetails(patientRow.dataset.patientId);
});

document.addEventListener('keydown', event => {
  if (event.key === 'F1') { event.preventDefault(); location.hash = 'overview'; navigate('overview'); }
  if (event.key === 'F2') { event.preventDefault(); location.hash = 'clinics'; navigate('clinics'); }
  if (event.key === 'F3') { event.preventDefault(); location.hash = 'analysis-clinic'; navigate('analysis-clinic'); }
  if (event.key === 'F4') { event.preventDefault(); location.hash = 'services'; navigate('services'); }
  if (event.key === 'F5') { event.preventDefault(); location.hash = 'logs'; navigate('logs'); }
  if (event.key === 'F6') { event.preventDefault(); location.hash = 'admins'; navigate('admins'); }
  if (event.key === 'F7') { event.preventDefault(); location.hash = 'feedback'; navigate('feedback'); }
  if (event.key === 'Escape') { closeModal(); closeDetails(); closeAccountMenu(); }
});

const todayEl = document.getElementById('todayLabel');
if (todayEl) todayEl.textContent = new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date());

function updateDoctorClock() {
  const clock = document.getElementById('docClock');
  if (!clock) return;
  const now = new Date();
  clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
updateDoctorClock();
setInterval(updateDoctorClock, 1000);

window.addEventListener('hashchange', () => navigate());
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) themeBtn.innerHTML = `<i class="fa-solid fa-${savedTheme === 'dark' ? 'sun' : 'moon'}"></i>`;

// Initial load from MongoDB database
reloadAllAdminData().then(() => {
  navigate();
});
