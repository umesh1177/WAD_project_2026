const STORAGE_KEY = 'dhyey-admin-clinics';

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

const defaultClinics = [
  {
    id: 'CLN-001',
    name: 'Dhyey Main Clinic',
    city: 'Ahmedabad',
    doctors: 12,
    patients: 1840,
    visits: 428,
    status: 'Active',
    updated: 'Today',
    services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
    receptionist: {
      name: 'Pooja Sharma',
      email: 'pooja.reception@dhyeyclinic.com',
      phone: '9876543210',
      shift: 'Morning Shift (08:00 AM - 03:00 PM)',
      status: 'Active'
    },
    specialties: 'General Medicine, Cardiology, Pediatrics',
    facilities: 'Pharmacy, Pathology Lab, ECG, Emergency Care',
    phone: '9876543210',
    email: 'contact@dhyeyclinic.com',
    registration: 'GUJ-MED-2026-001',
    address: '101, Medical Enclave, CG Road, Navrangpura, Ahmedabad, Gujarat - 380009',
    days: 'Monday - Saturday',
    hours: '08:30 AM - 08:30 PM',
    verifiedDocuments: 13
  },
  {
    id: 'CLN-002',
    name: 'Satellite Wellness Centre',
    city: 'Ahmedabad',
    doctors: 7,
    patients: 920,
    visits: 216,
    status: 'Active',
    updated: 'Yesterday',
    services: ['receptionist', 'appointment', 'digitalPrescription', 'billing'],
    receptionist: {
      name: 'Kavita Dave',
      email: 'kavita.reception@satelliteclinic.com',
      phone: '9876543222',
      shift: 'Full Day (09:00 AM - 07:00 PM)',
      status: 'Active'
    },
    specialties: 'Dermatology, Cosmetology, Trichology',
    facilities: 'Laser Suite, Minor Procedure Room',
    phone: '9876543222',
    email: 'help@satelliteclinic.com',
    registration: 'GUJ-MED-2026-002',
    address: '304, Titanium City Centre, Anandnagar Road, Satellite, Ahmedabad, Gujarat - 380015',
    days: 'Monday - Saturday',
    hours: '09:00 AM - 08:00 PM',
    verifiedDocuments: 8
  },
  {
    id: 'CLN-003',
    name: 'Riverside Family Care',
    city: 'Gandhinagar',
    doctors: 4,
    patients: 380,
    visits: 92,
    status: 'Paused',
    updated: '28 Sep 2026',
    services: ['digitalPrescription', 'billing'], // Doctor-only direct access mode
    receptionist: null,
    specialties: 'Family Medicine, Gynecology, Geriatrics',
    facilities: 'Vaccination Centre, Ultrasound',
    phone: '9876543233',
    email: 'info@riversidecare.com',
    registration: 'GUJ-MED-2026-003',
    address: '12, Riverside Arcades, Sector 11, Gandhinagar, Gujarat - 382010',
    days: 'Monday - Friday',
    hours: '10:00 AM - 06:00 PM',
    verifiedDocuments: 5
  }
];

const doctors = [
  { name: 'Dr. Mehul Shah', specialty: 'General Medicine', clinic: 'Dhyey Main Clinic', patients: 218, visits: 86, rating: 94 },
  { name: 'Dr. Riya Patel', specialty: 'Dermatology', clinic: 'Satellite Wellness Centre', patients: 164, visits: 71, rating: 91 },
  { name: 'Dr. Harsh Trivedi', specialty: 'Pediatrics', clinic: 'Dhyey Main Clinic', patients: 143, visits: 63, rating: 88 },
  { name: 'Dr. Neha Desai', specialty: 'Gynecology', clinic: 'Riverside Family Care', patients: 98, visits: 42, rating: 86 }
];

const patients = [
  { name: 'Aarav Mehta', id: 'PAT-1042', clinic: 'Dhyey Main Clinic', doctor: 'Dr. Mehul Shah', visits: 8, lastVisit: '01 Oct 2026', status: 'Active' },
  { name: 'Kavya Shah', id: 'PAT-1038', clinic: 'Satellite Wellness Centre', doctor: 'Dr. Riya Patel', visits: 5, lastVisit: '30 Sep 2026', status: 'Active' },
  { name: 'Ishaan Patel', id: 'PAT-1024', clinic: 'Dhyey Main Clinic', doctor: 'Dr. Harsh Trivedi', visits: 3, lastVisit: '29 Sep 2026', status: 'Follow-up' },
  { name: 'Mira Joshi', id: 'PAT-1019', clinic: 'Riverside Family Care', doctor: 'Dr. Neha Desai', visits: 6, lastVisit: '25 Sep 2026', status: 'Active' }
];

let clinics = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultClinics;
// Ensure older cached data removes reports and enforces consistency
clinics.forEach(c => {
  if (Array.isArray(c.services)) {
    c.services = c.services.filter(s => s !== 'reports');
    // If receptionist is off, ensure appointment queue is off
    if (!c.services.includes('receptionist')) {
      c.services = c.services.filter(s => s !== 'appointment');
    }
  } else {
    c.services = ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'];
  }
});

let clinicDoctors = JSON.parse(localStorage.getItem('dhyey-admin-doctors') || 'null') || doctors.map(doctor => ({
  ...doctor,
  email: `${doctor.name.toLowerCase().replace(/[^a-z]+/g, '.')}@dhyeyclinic.com`,
  status: 'Active'
}));

const STORAGE_KEY_REQUESTS = 'dhyey-clinic-requests';
const defaultClinicRequests = [
  {
    id: 'REQ-101',
    clinicId: 'CLN-004',
    name: 'Apollo City Clinic & Diagnostics',
    city: 'Ahmedabad',
    registrationNumber: 'REG-GJ-2026-9021',
    registration: 'REG-GJ-2026-9021',
    phone: '+91 98250 12345',
    email: 'info@apollocityclinic.com',
    address: 'GF-04, Shivalik Plaza, IIM Road, Panjrapole, Ahmedabad - 380015',
    days: 'Monday - Saturday',
    hours: '09:00 - 21:00',
    specialties: 'General Medicine, Cardiology, Orthopedics',
    facilities: 'Pharmacy, Path Lab, Minor OT, ECG',
    applicantName: 'Dr. Ramesh S. Parikh',
    applicantRole: 'Medical Director',
    doctorsCount: 2,
    doctors: [
      { name: 'Dr. Ramesh S. Parikh', specialty: 'Cardiology', registration: 'MCI-88291', email: 'ramesh.parikh@apollocityclinic.com', phone: '+91 98250 12345' },
      { name: 'Dr. Sunita K. Sharma', specialty: 'General Medicine', registration: 'MCI-91024', email: 'sunita.sharma@apollocityclinic.com', phone: '+91 98250 54321' }
    ],
    status: 'Pending',
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    formattedDate: 'Today, 09:30 AM',
    submittedFrom: 'Landing Page'
  },
  {
    id: 'REQ-102',
    clinicId: 'CLN-005',
    name: 'Aura Health & Skin Clinic',
    city: 'Ahmedabad',
    registrationNumber: 'REG-GJ-2026-7841',
    registration: 'REG-GJ-2026-7841',
    phone: '+91 98790 54321',
    email: 'contact@auraskinclinic.com',
    address: '2nd Floor, Safal Pegasuss, Prahlad Nagar, Ahmedabad',
    days: 'Monday - Saturday',
    hours: '10:00 - 19:00',
    specialties: 'Dermatology, Cosmetology',
    facilities: 'Laser Treatment, Minor OT',
    applicantName: 'Dr. Ananya Roy',
    applicantRole: 'Clinic Owner',
    doctorsCount: 1,
    doctors: [
      { name: 'Dr. Ananya Roy', specialty: 'Dermatology', registration: 'MCI-76543', email: 'ananya.roy@auraskinclinic.com', phone: '+91 98790 54321' }
    ],
    status: 'Approved',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    formattedDate: 'Yesterday, 04:15 PM',
    submittedFrom: 'Landing Page'
  }
];

let clinicRequests = JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || 'null') || defaultClinicRequests;
let currentClinicTab = 'active';
const STORAGE_KEY_LOGS = 'dhyey-admin-activity-logs';
let activityLogs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
const STORAGE_KEY_ADMINS = 'dhyey-admin-accounts';
let adminAccounts = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]');

function saveClinicRequests() {
  localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(clinicRequests));
}

function saveActivityLogs() {
  localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs.slice(0, 500)));
}

function logActivity(action, entity, entityId, result = 'Success', details = '') {
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
  saveActivityLogs();
}

async function syncClinicRequestsFromAPI() {
  try {
    const res = await fetch('/api/clinics/requests');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const localMap = new Map(clinicRequests.map(r => [r.id, r]));
        json.data.forEach(apiReq => {
          if (!localMap.has(apiReq.id)) {
            clinicRequests.unshift(apiReq);
          } else {
            const existing = localMap.get(apiReq.id);
            if (existing.status !== 'Pending') {
              apiReq.status = existing.status;
            }
          }
        });
        saveClinicRequests();
      }
    }
  } catch (err) {
    // API server fallback to local storage
  }
}
syncClinicRequestsFromAPI();

const content = document.getElementById('adminContent');

function money(value) { return `₹${value.toLocaleString('en-IN')}`; }
function saveClinics() { localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics)); }
function saveDoctors() { localStorage.setItem('dhyey-admin-doctors', JSON.stringify(clinicDoctors)); }
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
    <div class="admin-stat"><div class="admin-stat-top"><span>Visits this month</span><span class="admin-stat-icon"><i class="fa-solid fa-calendar-check"></i></span></div><strong>${clinics.reduce((s, c) => s + (c.visits || 0), 0).toLocaleString()}</strong><small>+12.2% growth</small></div>
  </div>`;
}

function renderOverview() {
  const pendingRequests = clinicRequests.filter(r => r.status === 'Pending');
  const rows = clinics.map(c => `
    <tr data-clinic-id="${c.id}">
      <td><strong>${c.name}</strong><br><small>${c.id} · ${c.city}</small></td>
      <td>${c.doctors}</td>
      <td>${c.patients.toLocaleString()}</td>
      <td>${c.visits}</td>
      <td>${(c.services || []).includes('receptionist') ? '<span class="role-badge role-badge-receptionist"><i class="fa-solid fa-user-nurse"></i> Doctor + Receptionist</span>' : '<span class="role-badge role-badge-doctor"><i class="fa-solid fa-user-doctor"></i> Doctor Only (Direct)</span>'}</td>
      <td><span class="status-pill ${c.status === 'Paused' ? 'paused' : ''}">${c.status}</span></td>
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
              <button class="btn-action-approve" data-action="approve-request" data-req-id="${r.id}" title="Approve and add clinic to network"><i class="fa-solid fa-check"></i> Approve</button>
              <button class="btn-action-reject" data-action="reject-request" data-req-id="${r.id}" title="Reject application"><i class="fa-solid fa-xmark"></i> Reject</button>
              <button class="btn-action-details" data-action="view-request" data-req-id="${r.id}" title="Review complete application packet"><i class="fa-solid fa-eye"></i> Details</button>
            </div>
          `;
        } else if (r.status === 'Approved') {
          actionBtns = `
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn-action-details" data-action="view-request" data-req-id="${r.id}"><i class="fa-solid fa-eye"></i> View</button>
              <span style="font-size:11px;color:#059669;font-weight:600"><i class="fa-solid fa-check-double"></i> In Network</span>
            </div>
          `;
        } else {
          actionBtns = `
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn-action-details" data-action="view-request" data-req-id="${r.id}"><i class="fa-solid fa-eye"></i> View</button>
              <button class="btn-action-approve" style="background:#64748b;border-color:#64748b" data-action="approve-request" data-req-id="${r.id}" title="Re-evaluate & approve"><i class="fa-solid fa-rotate-left"></i> Re-Approve</button>
            </div>
          `;
        }

        const docCount = (r.doctors && r.doctors.length) ? r.doctors.length : Number(r.doctorsCount || 1);

        return `
          <tr data-request-id="${r.id}">
            <td><strong>${r.id}</strong><br><small style="color:var(--text-muted)">${r.formattedDate || r.submittedAt?.slice(0, 10) || 'Recent'}</small></td>
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
          <td>${c.patients.toLocaleString()}</td>
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
        <div><h2>Doctor management</h2><span>Every doctor account is mapped to a registered clinic and tailored service dashboard.</span></div>
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
          <td><button class="btn-secondary suspend-button" data-action="toggle-doctor" data-doctor="${doctor.name}">${doctor.status === 'Suspended' ? 'Restore account' : 'Suspend account'}</button></td>
        </tr>
      `).join(''))}
    </section>
  `);
}

function openRequestDetailsModal(reqId) {
  const req = clinicRequests.find(r => r.id === reqId);
  if (!req) return;

  const modal = document.getElementById('detailsModal');
  const docs = Array.isArray(req.doctors) ? req.doctors : [];

  let statusBadge = '';
  if (req.status === 'Pending') {
    statusBadge = `<span class="status-pill status-pending"><i class="fa-solid fa-clock"></i> Pending Review</span>`;
  } else if (req.status === 'Approved') {
    statusBadge = `<span class="status-pill" style="background:#ecfdf5;color:#059669;border:1px solid #a7f3d0"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
  } else {
    statusBadge = `<span class="status-pill" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>`;
  }

  const doctorsListHtml = docs.length ? table(
    ['Doctor Name', 'Specialty', 'MCI / Registration', 'Email', 'Phone'],
    docs.map(d => `
      <tr>
        <td><strong>${d.name || 'Doctor'}</strong></td>
        <td>${d.specialty || 'General Medicine'}</td>
        <td>${d.registration || 'Document verified'}</td>
        <td>${d.email || req.email || 'N/A'}</td>
        <td>${d.phone || req.phone || 'N/A'}</td>
      </tr>
    `).join('')
  ) : '<div class="empty-results">No individual doctor entries were attached with this application.</div>';

  modal.innerHTML = `
    <div class="detail-modal-card" style="max-width:760px">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">${req.name}</h2>
          <small style="color:var(--text-muted)">Application: <strong>${req.id}</strong> · Submitted: ${req.formattedDate || req.submittedAt?.slice(0, 10) || 'Recent'}</small>
        </div>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>

      <div class="detail-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 style="margin:0"><i class="fa-solid fa-hospital"></i> Clinic Application Packet</h3>
          <div>${statusBadge}</div>
        </div>

        <div class="request-detail-grid">
          <div class="request-detail-item"><small>Legal Clinic Name</small><strong>${req.name}</strong></div>
          <div class="request-detail-item"><small>Registration Number</small><strong>${req.registration || req.registrationNumber || 'Pending verification'}</strong></div>
          <div class="request-detail-item"><small>City / District</small><strong>${req.city || 'Ahmedabad'}</strong></div>
          <div class="request-detail-item"><small>Applicant Name & Role</small><strong>${req.applicantName || 'Applicant'} (${req.applicantRole || 'Director'})</strong></div>
          <div class="request-detail-item"><small>Official Phone</small><strong>${req.phone || 'N/A'}</strong></div>
          <div class="request-detail-item"><small>Official Email</small><strong>${req.email || 'N/A'}</strong></div>
          <div class="request-detail-item"><small>Operating Days</small><strong>${req.days || req.operatingDays || 'Monday - Saturday'}</strong></div>
          <div class="request-detail-item"><small>Working Hours</small><strong>${req.hours || req.workingHours || '09:00 - 20:00'}</strong></div>
        </div>

        <div class="request-detail-item" style="margin-bottom:12px">
          <small>Premises Address</small>
          <strong>${req.address || 'Address on record'}</strong>
        </div>

        <div class="request-detail-grid">
          <div class="request-detail-item"><small>Specialties Offered</small><strong>${req.specialties || 'General Medicine'}</strong></div>
          <div class="request-detail-item"><small>Available Facilities</small><strong>${req.facilities || 'Consultation, Pharmacy, Diagnostics'}</strong></div>
        </div>
      </div>

      <div class="detail-section">
        <h3><i class="fa-solid fa-user-doctor"></i> Registered Doctors (${docs.length || req.doctorsCount || 1})</h3>
        ${doctorsListHtml}
      </div>

      <div class="modal-footer" style="gap:8px;flex-wrap:wrap">
        <button class="btn-secondary" data-action="close-details">Close</button>
        ${req.status === 'Pending' ? `
          <button class="btn-action-reject" style="padding:7px 16px;font-size:13px" data-action="reject-request" data-req-id="${req.id}">
            <i class="fa-solid fa-ban"></i> Reject Request
          </button>
          <button class="btn-action-approve" style="padding:7px 16px;font-size:13px" data-action="approve-request" data-req-id="${req.id}">
            <i class="fa-solid fa-circle-check"></i> Approve & Activate Clinic
          </button>
        ` : req.status === 'Rejected' ? `
          <button class="btn-action-approve" style="padding:7px 16px;font-size:13px" data-action="approve-request" data-req-id="${req.id}">
            <i class="fa-solid fa-rotate-left"></i> Re-Approve Clinic
          </button>
        ` : `
          <button class="btn-primary" style="padding:7px 16px;font-size:13px" onclick="closeDetails(); renderClinics('active');">
            <i class="fa-solid fa-arrow-right"></i> View in Active Clinics
          </button>
        `}
      </div>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

async function approveClinicRequest(reqId) {
  const req = clinicRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = 'Approved';
  req.approvedAt = new Date().toISOString();
  saveClinicRequests();

  // Find or create clinic
  const existingClinic = clinics.find(c => c.name.toLowerCase() === req.name.toLowerCase() || (req.clinicId && c.id === req.clinicId));
  const newClinicId = req.clinicId || `CLN-${String(clinics.length + 1).padStart(3, '0')}`;
  const docCount = (req.doctors && req.doctors.length) ? req.doctors.length : Number(req.doctorsCount || 1);

  if (!existingClinic) {
    const newClinic = {
      id: newClinicId,
      name: req.name,
      city: req.city || 'Ahmedabad',
      doctors: docCount,
      patients: 0,
      visits: 0,
      status: 'Active',
      updated: 'Just now (Approved)',
      services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
      receptionist: {
        name: `${req.name.split(' ')[0]} Front Desk`,
        email: `reception.${req.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@dhyeyclinic.com`,
        phone: req.phone || '9876543210',
        shift: 'General Shift (08:30 AM - 08:30 PM)',
        status: 'Active'
      },
      specialties: req.specialties || 'General Medicine',
      facilities: req.facilities || 'Consultation, Pharmacy, Diagnostics',
      phone: req.phone || '',
      email: req.email || '',
      registration: req.registration || req.registrationNumber || 'REG-PENDING',
      address: req.address || '',
      days: req.days || req.operatingDays || 'Monday - Saturday',
      hours: req.hours || req.workingHours || '09:00 AM - 08:00 PM',
      verifiedDocuments: docCount + 1
    };
    clinics.unshift(newClinic);
    saveClinics();

    // Initialize clinic database
    const cleanClinicKey = `clinic-db-${newClinicId}`;
    if (!localStorage.getItem(cleanClinicKey)) {
      const cleanDB = {
        counters: { family: 0, patient: 0, visit: 0 },
        families: {},
        appointments: [],
        certificates: [],
        bills: [],
        feedbacks: [],
        dietary: {},
        clinicShortcuts: {
          medicines: {},
          complaints: {},
          investigations: {},
          allergies: {},
          relations: {},
          areas: {},
          societies: {},
        },
        _shortcutsCleanedV2: true,
        customShortcuts: [],
        masterMedicines: [],
        masterComplaints: [],
        masterInvestigations: [],
        masterAreas: [],
        masterSocieties: [],
        masterAllergies: [],
        masterRelations: []
      };
      localStorage.setItem(cleanClinicKey, JSON.stringify(cleanDB));
    }
  }

  // Add submitted doctors
  if (Array.isArray(req.doctors) && req.doctors.length) {
    req.doctors.forEach(doc => {
      const docName = doc.name ? (doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`) : 'Dr. Medical Officer';
      const exists = clinicDoctors.some(d => d.name.toLowerCase() === docName.toLowerCase() && d.clinic === req.name);
      if (!exists) {
        clinicDoctors.push({
          name: docName,
          specialty: doc.specialty || 'General Medicine',
          clinic: req.name,
          email: doc.email || `${docName.toLowerCase().replace(/[^a-z]+/g, '.')}@dhyeyclinic.com`,
          phone: doc.phone || req.phone || '',
          registration: doc.registration || 'MCI-PENDING',
          patients: 0,
          visits: 0,
          rating: 95,
          status: 'Active'
        });
      }
    });
    saveDoctors();
  }

  // Update backend API
  try {
    await fetch(`/api/clinics/requests/${encodeURIComponent(reqId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' })
    });
  } catch (err) {
    console.warn('Backend API update skipped:', err);
  }

  closeDetails();
  logActivity('Approved clinic application', 'Clinic application', req.id, 'Success', `${req.name} added to the clinic network.`);
  showToast(`Clinic "${req.name}" approved and activated into the network!`);
  renderClinics(currentClinicTab);
}

async function rejectClinicRequest(reqId) {
  const req = clinicRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = 'Rejected';
  req.rejectedAt = new Date().toISOString();
  saveClinicRequests();

  // Update backend API
  try {
    await fetch(`/api/clinics/requests/${encodeURIComponent(reqId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' })
    });
  } catch (err) {
    console.warn('Backend API update skipped:', err);
  }

  closeDetails();
  logActivity('Rejected clinic application', 'Clinic application', req.id, 'Warning', req.name);
  showToast(`Registration request for "${req.name}" rejected.`);
  renderClinics(currentClinicTab);
}

function renderServices() {
  const withReception = clinics.filter(c => (c.services || []).includes('receptionist')).length;
  const withPrescription = clinics.filter(c => (c.services || []).includes('digitalPrescription')).length;
  const doctorOnlyCount = clinics.filter(c => !(c.services || []).includes('receptionist')).length;

  const statsHtml = `
    <div class="admin-stats">
      <div class="admin-stat">
        <div class="admin-stat-top"><span>Available Modules</span><span class="admin-stat-icon"><i class="fa-solid fa-cubes"></i></span></div>
        <strong>${PLATFORM_SERVICES.length} Services</strong>
        <small>Modular clinic features</small>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-top"><span>Receptionist Desks</span><span class="admin-stat-icon"><i class="fa-solid fa-user-nurse"></i></span></div>
        <strong>${withReception} Clinics</strong>
        <small>Dual login: Reception + Doctor</small>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-top"><span>Doctor-Only Mode</span><span class="admin-stat-icon"><i class="fa-solid fa-user-doctor"></i></span></div>
        <strong>${doctorOnlyCount} Clinics</strong>
        <small>Single direct doctor workflow</small>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-top"><span>Digital Prescription</span><span class="admin-stat-icon"><i class="fa-solid fa-file-prescription"></i></span></div>
        <strong>${withPrescription} Clinics</strong>
        <small>Multi-language customized Rx</small>
      </div>
    </div>
  `;

  const catalogCards = PLATFORM_SERVICES.map(service => {
    const subscribedCount = clinics.filter(c => (c.services || []).includes(service.id)).length;
    return `
      <div class="service-catalog-card">
        <div>
          <div class="service-card-top">
            <div class="service-card-icon"><i class="${service.icon}"></i></div>
            <span class="service-badge-pill ${service.id === 'receptionist' ? 'primary' : ''}">${service.badge}</span>
          </div>
          <div class="service-card-body">
            <h3>${service.name}</h3>
            <p>${service.desc}</p>
            <ul class="service-feature-list">
              ${service.features.map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="service-card-footer">
          <span>Active Subscriptions:</span>
          <strong>${subscribedCount} / ${clinics.length} Clinics</strong>
        </div>
      </div>
    `;
  }).join('');

  const matrixRows = clinics.map(clinic => {
    const s = clinic.services || [];
    const hasReception = s.includes('receptionist');
    const hasPrescription = s.includes('digitalPrescription');
    const hasAppt = s.includes('appointment');
    const hasCert = s.includes('certificates');
    const hasBill = s.includes('billing');

    return `
      <tr data-clinic-id="${clinic.id}">
        <td><strong>${clinic.name}</strong><br><small>${clinic.id} · ${clinic.city}</small></td>
        <td>${hasReception ? '<span class="role-badge role-badge-receptionist"><i class="fa-solid fa-user-nurse"></i> Receptionist + Doctor</span>' : '<span class="role-badge role-badge-doctor"><i class="fa-solid fa-user-doctor"></i> Doctor Only (Direct)</span>'}</td>
        <td>${hasReception ? '<span class="status-pill"><i class="fa-solid fa-check"></i> Active</span>' : '<span class="status-pill paused">Off</span>'}</td>
        <td>${hasAppt ? '<span class="status-pill"><i class="fa-solid fa-check"></i> Active</span>' : '<span class="status-pill paused" title="Disabled in Doctor-Only Mode">Off (Auto)</span>'}</td>
        <td>${hasPrescription ? '<span class="status-pill"><i class="fa-solid fa-check"></i> Active</span>' : '<span class="status-pill paused">Off</span>'}</td>
        <td>${hasCert ? '<span class="status-pill"><i class="fa-solid fa-check"></i> Active</span>' : '<span class="status-pill paused">Off</span>'}</td>
        <td>${hasBill ? '<span class="status-pill"><i class="fa-solid fa-check"></i> Active</span>' : '<span class="status-pill paused">Off</span>'}</td>
        <td><button class="btn-secondary" style="padding:4px 9px; font-size:11px" onclick="event.stopPropagation(); openClinicDetails('${clinic.id}')"><i class="fa-solid fa-sliders"></i> Configure</button></td>
      </tr>
    `;
  }).join('');

  page(
    'Platform Services & Feature Catalog',
    'Manage modular services provisioned for each clinic. Clinics with Receptionist enabled use Queue Dispatch, while Doctor-Only clinics manage family registration and visits directly.',
    statsHtml,
    `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic with services</button>`
  );

  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    <section class="admin-card">
      <div class="admin-card-header">
        <div><h2>Available Service Modules</h2><span>Clinics can subscribe to any combination of these services</span></div>
      </div>
      <div class="services-catalog-grid">${catalogCards}</div>
    </section>

    <section class="admin-card" style="margin-top:16px">
      <div class="admin-card-header">
        <div><h2>Clinic Service Subscription Matrix</h2><span>Live breakdown of active modules across each registered clinic</span></div>
        <span>${clinics.length} locations</span>
      </div>
      ${table(['Clinic', 'Roles Provisioned', 'Receptionist Desk', 'Queue Dispatch', 'Digital Rx', 'Certificates', 'Billing', 'Action'], matrixRows)}
    </section>
  `);
}

function renderLogs() {
  page(
    'Log management',
    'Review administrator activity across clinic onboarding, services, accounts, and requests.',
    '',
    '<button class="btn-secondary" data-action="clear-logs"><i class="fa-solid fa-trash"></i> Clear logs</button>'
  );
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    <section class="admin-card">
      <div class="admin-filter-row">
        <input class="form-input" id="logSearch" placeholder="Search action, entity, ID, or details" style="flex:1;min-width:240px">
        <select class="form-select" id="logResult"><option value="">All results</option><option>Success</option><option>Info</option><option>Warning</option></select>
        <select class="form-select" id="logEntity"><option value="">All entities</option><option>Clinic</option><option>Clinic application</option><option>Doctor</option><option>Service</option><option>Account</option></select>
      </div>
      <div id="logTable" style="margin-top:16px"></div>
    </section>
  `);
  const update = () => {
    const term = document.getElementById('logSearch').value.toLowerCase().trim();
    const result = document.getElementById('logResult').value;
    const entity = document.getElementById('logEntity').value;
    const rows = activityLogs
      .filter((log) => (!result || log.result === result) && (!entity || log.entity === entity))
      .filter((log) => `${log.action} ${log.entity} ${log.entityId} ${log.admin} ${log.details}`.toLowerCase().includes(term))
      .map((log) => `<tr><td>${new Date(log.timestamp).toLocaleString('en-IN')}</td><td>${log.admin}</td><td><strong>${log.action}</strong></td><td>${log.entity}<br><small>${log.entityId}</small></td><td><span class="status-pill">${log.result}</span></td><td>${log.details || '—'}</td></tr>`)
      .join('');
    document.getElementById('logTable').innerHTML = table(['Timestamp', 'Admin', 'Action', 'Entity', 'Result', 'Details'], rows, 'No activity matches these filters.');
  };
  document.getElementById('logSearch').addEventListener('input', update);
  document.getElementById('logResult').addEventListener('change', update);
  document.getElementById('logEntity').addEventListener('change', update);
  update();
}

function renderAdmins() {
  page('Admin account management', 'Create verified administrator accounts with strong credentials and an auditable identity.', '', '');
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
    <div class="admin-grid">
      <section class="admin-card">
        <div class="admin-card-header"><div><h2>Add administrator</h2><span>New accounts are created on the authenticated server.</span></div><i class="fa-solid fa-user-shield"></i></div>
        <form id="adminForm" class="clinic-form-grid">
          <div class="form-group"><label class="form-label">Full name <span class="req">*</span></label><input class="form-input" name="name" required minlength="3" autocomplete="name"></div>
          <div class="form-group"><label class="form-label">Work email <span class="req">*</span></label><input class="form-input" name="email" type="email" required autocomplete="email"></div>
          <div class="form-group"><label class="form-label">Username <span class="req">*</span></label><input class="form-input" name="username" required pattern="[A-Za-z][A-Za-z0-9._-]{4,29}" minlength="5" maxlength="30" autocomplete="username"><small class="clinic-form-help">5-30 characters; letters, numbers, dots, underscores, or hyphens.</small></div>
          <div class="form-group"><label class="form-label">Employee ID <span class="req">*</span></label><input class="form-input" name="employeeId" required pattern="[A-Za-z]{2,6}-[0-9]{4,12}" placeholder="ADM-20260001"><small class="clinic-form-help">Format: ADM-20260001</small></div>
          <div class="form-group"><label class="form-label">Password <span class="req">*</span></label><input class="form-input" name="password" type="password" required minlength="12" autocomplete="new-password"><small class="clinic-form-help">At least 12 characters with uppercase, lowercase, number, and symbol.</small></div>
          <div class="form-group"><label class="form-label">Confirm password <span class="req">*</span></label><input class="form-input" name="confirmPassword" type="password" required minlength="12" autocomplete="new-password"></div>
          <div class="form-group full-width"><label class="form-check-label"><input type="checkbox" name="attestation" required> I confirm this person is an authorized administrator.</label></div>
          <div class="full-width"><button class="btn-primary" type="submit"><i class="fa-solid fa-user-plus"></i> Create admin account</button></div>
        </form>
      </section>
      <section class="admin-card">
        <div class="admin-card-header"><div><h2>Accounts created this session</h2><span>Passwords are never stored or displayed in this panel.</span></div></div>
        <div id="adminAccountsTable"></div>
      </section>
    </div>
  `);
  const accountTable = document.getElementById('adminAccountsTable');
  const renderAccountTable = () => {
    accountTable.innerHTML = table(['Name', 'Username', 'Email', 'Employee ID', 'Created'], adminAccounts.map((admin) => `<tr><td>${admin.name}</td><td>${admin.username}</td><td>${admin.email}</td><td>${admin.employeeId}</td><td>${new Date(admin.createdAt).toLocaleString('en-IN')}</td></tr>`).join(''), 'No new accounts created in this session.');
  };
  renderAccountTable();
  document.getElementById('adminForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('password'));
    if (password !== String(data.get('confirmPassword'))) return showToast('Passwords do not match.', 'error');
    if (!data.get('attestation')) return showToast('Confirm that the administrator is authorized.', 'error');
    const session = JSON.parse(localStorage.getItem('clinic-auth-session') || 'null');
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const response = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token || ''}` },
        body: JSON.stringify({ name: data.get('name'), email: data.get('email'), username: data.get('username'), employeeId: data.get('employeeId'), password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || 'The server could not create this administrator.');
      adminAccounts.unshift({ ...result.admin, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(adminAccounts));
      logActivity('Created administrator account', 'Account', result.admin.username, 'Success', result.admin.employeeId);
      form.reset();
      renderAccountTable();
      showToast('Administrator account created and validated successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submit.disabled = false;
    }

  });
}

function escapeFeedbackHtml(value) {
      return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
    }

    async function renderFeedbackInbox() {
      page('Complaints & feedback', 'Review landing-page messages and doctor support tickets, then reply and update their status.', '', '');
      content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `
        <section class="admin-card">
          <div class="admin-filter-row">
            <input class="form-input" id="feedbackSearch" placeholder="Search ticket, sender, clinic, subject, or message" style="flex:1;min-width:260px">
            <select class="form-select" id="feedbackStatus"><option value="">All statuses</option><option>Pending</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select>
            <select class="form-select" id="feedbackCategory"><option value="">All sources</option><option value="landing">Landing page</option><option value="doctor">Doctor panel</option></select>
          </div>
          <div id="feedbackTable" style="margin-top:16px"><div class="empty-results">Loading support requests...</div></div>
        </section>
      `);
      const session = JSON.parse(localStorage.getItem('clinic-auth-session') || 'null');
      let tickets = [];
      try {
        const response = await fetch('/api/feedback/admin/all', { headers: { Authorization: `Bearer ${session?.token || 'mock-admin-token'}` } });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load feedback.');
        tickets = result.data || [];
      } catch (error) {
        tickets = JSON.parse(localStorage.getItem('dhyey-public-feedback') || '[]');
        Object.keys(localStorage).filter((key) => key.startsWith('clinic-db-')).forEach((key) => {
          const clinicDb = JSON.parse(localStorage.getItem(key) || '{}');
          if (Array.isArray(clinicDb.feedbacks)) tickets.push(...clinicDb.feedbacks);
        });
        showToast('Showing locally saved support requests while the server is unavailable.', 'error');
      }
      const render = () => {
        const term = document.getElementById('feedbackSearch').value.toLowerCase().trim();
        const status = document.getElementById('feedbackStatus').value;
        const category = document.getElementById('feedbackCategory').value;
        const filtered = tickets.filter((ticket) => {
          const source = ticket.metaDetails?.source === 'Landing Page Contact' || ticket.doctorName === 'Landing Page Visitor' ? 'landing' : 'doctor';
          return (!status || ticket.status === status) && (!category || source === category) &&
            `${ticket.ticketNo} ${ticket.doctorName} ${ticket.clinicName} ${ticket.subject} ${ticket.message}`.toLowerCase().includes(term);
        });
        const rows = filtered.map((ticket) => {
          const source = ticket.metaDetails?.source === 'Landing Page Contact' || ticket.doctorName === 'Landing Page Visitor' ? 'Landing page' : 'Doctor panel';
          const replies = (ticket.replies || []).map((reply) => `<div class="feedback-reply"><strong>${escapeFeedbackHtml(reply.senderName)}</strong><small>${escapeFeedbackHtml(reply.message)}</small></div>`).join('');
          return `<tr><td><strong>${escapeFeedbackHtml(ticket.ticketNo || ticket.id)}</strong><br><small>${new Date(ticket.createdAt || Date.now()).toLocaleString('en-IN')}</small></td><td>${escapeFeedbackHtml(source)}<br><small>${escapeFeedbackHtml(ticket.doctorName || ticket.metaDetails?.email || '')}</small></td><td><strong>${escapeFeedbackHtml(ticket.subject)}</strong><br><span>${escapeFeedbackHtml(ticket.message)}</span></td><td><span class="status-pill">${escapeFeedbackHtml(ticket.status || 'Pending')}</span></td><td><select class="form-select feedback-status-select" data-feedback-id="${escapeFeedbackHtml(ticket.id || ticket._id || ticket.ticketNo)}"><option ${ticket.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option><option ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option><option ${ticket.status === 'Closed' ? 'selected' : ''}>Closed</option></select><textarea class="form-textarea feedback-reply-input" data-feedback-id="${escapeFeedbackHtml(ticket.id || ticket._id || ticket.ticketNo)}" placeholder="Write a clear, helpful reply..."></textarea><button class="btn-primary feedback-reply-button" data-feedback-id="${escapeFeedbackHtml(ticket.id || ticket._id || ticket.ticketNo)}"><i class="fa-solid fa-reply"></i> Reply</button>${replies}</td></tr>`;
        }).join('');
        document.getElementById('feedbackTable').innerHTML = table(['Ticket', 'Source', 'Message', 'Status', 'Reply / update'], rows, 'No complaints or feedback match these filters.');
      };
      ['feedbackSearch', 'feedbackStatus', 'feedbackCategory'].forEach((id) => document.getElementById(id).addEventListener(id === 'feedbackSearch' ? 'input' : 'change', render));
      content.querySelector('#feedbackTable').addEventListener('change', async (event) => {
        if (!event.target.matches('.feedback-status-select')) return;
        await updateFeedbackTicket(event.target.dataset.feedbackId, { status: event.target.value });
        const ticket = tickets.find((item) => (item.id || item._id || item.ticketNo) === event.target.dataset.feedbackId);
        if (ticket) ticket.status = event.target.value;
        render();
      });
      content.querySelector('#feedbackTable').addEventListener('click', async (event) => {
        const button = event.target.closest('.feedback-reply-button');
        if (!button) return;
        const input = [...content.querySelectorAll('.feedback-reply-input')].find((item) => item.dataset.feedbackId === button.dataset.feedbackId);
        const message = input?.value.trim();
        if (!message) return showToast('Write a reply before sending.', 'error');
        const result = await updateFeedbackTicket(button.dataset.feedbackId, { message, status: 'Resolved' });
        if (!result) return;
        const ticket = tickets.find((item) => (item.id || item._id || item.ticketNo) === button.dataset.feedbackId);
        if (ticket) {
          ticket.status = 'Resolved';
          ticket.replies = [...(ticket.replies || []), { senderName: 'System Administrator', message, senderRole: 'admin', createdAt: new Date().toISOString() }];
        }
        logActivity('Replied to support request', 'Feedback', button.dataset.feedbackId, 'Success');
        render();
      });
      render();
    }

    async function updateFeedbackTicket(id, payload) {
      const session = JSON.parse(localStorage.getItem('clinic-auth-session') || 'null');
      try {
        const endpoint = payload.message ? `/api/feedback/${encodeURIComponent(id)}/reply` : `/api/feedback/${encodeURIComponent(id)}/status`;
        const response = await fetch(endpoint, { method: payload.message ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token || 'mock-admin-token'}` }, body: JSON.stringify(payload) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to update support request.');
        return result;
      } catch (error) {
        const localSources = ['dhyey-public-feedback', ...Object.keys(localStorage).filter((key) => key.startsWith('clinic-db-'))];
        let updated = false;
        localSources.forEach((key) => {
          const store = JSON.parse(localStorage.getItem(key) || (key === 'dhyey-public-feedback' ? '[]' : '{}'));
          const list = key === 'dhyey-public-feedback' ? store : store.feedbacks;
          if (!Array.isArray(list)) return;
          const ticket = list.find((item) => (item.id || item.ticketNo) === id);
          if (!ticket) return;
          if (payload.status) ticket.status = payload.status;
          if (payload.message) {
            ticket.replies = [...(ticket.replies || []), { senderRole: 'admin', senderName: 'System Administrator', message: payload.message, createdAt: new Date().toISOString() }];
            ticket.status = payload.status || 'Resolved';
          }
          localStorage.setItem(key, JSON.stringify(store));
          updated = true;
        });
        if (!updated) showToast(error.message, 'error');
        return updated;
      }
    }
function renderAnalysis(type) {
  const isClinic = type === 'clinic';
  const isDoctor = type === 'doctor';
  const title = isClinic ? 'Clinic wise analysis' : isDoctor ? 'Doctor wise analysis' : 'Patient wise analysis';
  const subtitle = isClinic ? 'Compare patient volume, visits, and collections by location.' : isDoctor ? 'Track doctor workload and patient engagement.' : 'Find visit patterns and follow-up needs for individual patients.';
  page(title, subtitle, '', `<button class="btn-secondary" data-action="export"><i class="fa-solid fa-download"></i> Export CSV</button>`);
  const filter = `<div class="analysis-toolbar"><div class="form-group" style="flex:1;min-width:220px"><label class="form-label">Search everything</label><input class="form-input" id="analysisSearch" placeholder="Search by name, ID, doctor or clinic"></div><div class="form-group"><label class="form-label">Clinic</label><select class="form-select" id="analysisClinic"><option value="">All clinics</option>${clinicOptions()}</select></div><div class="form-group"><label class="form-label">Date range</label><select class="form-select" id="analysisRange"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">This year</option></select></div><div class="form-group"><label class="form-label">Activity</label><select class="form-select" id="analysisActivity"><option value="">Any activity</option><option value="high">High activity</option><option value="low">Needs attention</option></select></div><div class="form-group"><label class="form-label">Sort by</label><select class="form-select" id="analysisSort"><option value="default">Default</option><option value="high">Highest first</option><option value="low">Lowest first</option></select></div></div><div class="quick-filter-bar"><span class="clinic-form-help">Frequent filters:</span><button type="button" class="quick-filter active" data-quick-filter="">All records</button><button type="button" class="quick-filter" data-quick-filter="today">Updated recently</button><button type="button" class="quick-filter" data-quick-filter="high">High performers</button><button type="button" class="quick-filter" data-quick-filter="attention">Needs attention</button></div>`;
  const card = `<section class="admin-card">${filter}<div id="analysisTable" style="margin-top:18px"></div></section>`; content.querySelector('.admin-page').insertAdjacentHTML('beforeend', card);
  let quickFilter = '';
  const update = () => {
    const selected = document.getElementById('analysisClinic').value;
    const term = document.getElementById('analysisSearch').value.toLowerCase();
    const activity = document.getElementById('analysisActivity').value || quickFilter;
    const sort = document.getElementById('analysisSort').value;
    let rows;

    if (isClinic) {
      let records = clinics.filter(c => (!selected || c.name === selected) && `${c.name} ${c.city} ${c.specialties || ''}`.toLowerCase().includes(term));
      if (activity === 'high' || activity === 'today') records = records.filter(c => c.visits >= 200);
      if (activity === 'low' || activity === 'attention') records = records.filter(c => c.visits < 200);
      if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.visits - a.visits : a.visits - b.visits);
      rows = records.map(c => `
        <tr data-clinic-id="${c.id}">
          <td><strong>${c.name}</strong><br><small>${c.city}</small></td>
          <td>${c.doctors}</td>
          <td>${c.patients.toLocaleString()}</td>
          <td>${c.visits}</td>
          <td>${money(c.visits * 650)}</td>
          <td><div class="metric-bar"><i style="width:${Math.min(c.visits / 5, 100)}%"></i></div></td>
        </tr>
      `);
    } else if (isDoctor) {
      let records = clinicDoctors.filter(d => (!selected || d.clinic === selected) && `${d.name} ${d.specialty} ${d.clinic}`.toLowerCase().includes(term));
      if (activity === 'high' || activity === 'today') records = records.filter(d => (d.rating || 0) >= 90);
      if (activity === 'low' || activity === 'attention') records = records.filter(d => (d.rating || 0) < 90);
      if (sort !== 'default') records.sort((a, b) => sort === 'high' ? (b.rating || 0) - (a.rating || 0) : (a.rating || 0) - (b.rating || 0));
      rows = records.map(d => `
        <tr data-doctor-name="${d.name}">
          <td><strong>${d.name}</strong><br><small>${d.specialty}</small></td>
          <td>${d.clinic}</td>
          <td>${d.patients || 0}</td>
          <td>${d.visits || 0}</td>
          <td>${d.rating || 0}%</td>
          <td><div class="metric-bar"><i style="width:${d.rating || 0}%"></i></div></td>
        </tr>
      `);
    } else {
      let records = patients.filter(p => (!selected || p.clinic === selected) && `${p.name} ${p.id} ${p.doctor} ${p.status}`.toLowerCase().includes(term));
      if (activity === 'high' || activity === 'today') records = records.filter(p => p.visits >= 5);
      if (activity === 'low' || activity === 'attention') records = records.filter(p => p.status === 'Follow-up');
      if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.visits - a.visits : a.visits - b.visits);
      rows = records.map(p => `
        <tr data-patient-id="${p.id}">
          <td><strong>${p.name}</strong><br><small>${p.id}</small></td>
          <td>${p.clinic}</td>
          <td>${p.doctor}</td>
          <td>${p.visits}</td>
          <td>${p.lastVisit}</td>
          <td><span class="status-pill">${p.status}</span></td>
        </tr>
      `);
    }

    const headers = isClinic
      ? ['Clinic', 'Doctors', 'Patients', 'Visits', 'Collection', 'Volume']
      : isDoctor
      ? ['Doctor', 'Clinic', 'Patients', 'Visits', 'Satisfaction', 'Score']
      : ['Patient', 'Clinic', 'Doctor', 'Visits', 'Last visit', 'Status'];

    document.getElementById('analysisTable').innerHTML = table(headers, rows.join(''));
  };

  ['analysisClinic', 'analysisRange', 'analysisActivity', 'analysisSort', 'analysisSearch'].forEach(id => {
    document.getElementById(id).addEventListener(id === 'analysisSearch' ? 'input' : 'change', update);
  });

  content.querySelectorAll('[data-quick-filter]').forEach(button => {
    button.addEventListener('click', () => {
      quickFilter = button.dataset.quickFilter;
      content.querySelectorAll('[data-quick-filter]').forEach(item => item.classList.toggle('active', item === button));
      update();
    });
  });

  update();
}
function openClinicDetails(clinicId) {
  const clinic = clinics.find(item => item.id === clinicId);
  if (!clinic) return;
  const assignedDoctors = clinicDoctors.filter(doctor => doctor.clinic === clinic.name || (doctor.clinicId && doctor.clinicId === clinic.id));
  const modal = document.getElementById('detailsModal');
  const services = clinic.services || ['digitalPrescription', 'billing'];
  const hasReception = services.includes('receptionist');

  // Service toggle rows for the detail view
  const allServiceDefs = [
    { id: 'receptionist', label: 'Receptionist Service', icon: 'fa-user-nurse' },
    { id: 'appointment', label: 'Patient Queue Service', icon: 'fa-users-line' },
    { id: 'digitalPrescription', label: 'Digital Prescription', icon: 'fa-file-prescription' },
    { id: 'certificates', label: 'Medical Certificates', icon: 'fa-certificate' },
    { id: 'billing', label: 'Billing & Invoicing', icon: 'fa-file-invoice-dollar' },
  ];

  const serviceToggleRows = allServiceDefs.map(svc => {
    const isOn = services.includes(svc.id);
    const isAutoManaged = svc.id === 'appointment'; // appointment auto-follows receptionist
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px"><i class="fa-solid ${svc.icon}" style="width:16px;opacity:.7"></i> ${svc.label}${isAutoManaged ? ' <small style="opacity:.6">(follows Receptionist)</small>' : ''}</span>
      <button class="btn-secondary" style="padding:4px 10px;font-size:11px;min-width:72px" 
        data-action="toggle-service" data-clinic="${clinic.id}" data-service="${svc.id}">
        ${isOn ? '<i class="fa-solid fa-toggle-on" style="color:#16a34a"></i> ON' : '<i class="fa-solid fa-toggle-off" style="color:#94a3b8"></i> OFF'}
      </button>
    </div>`;
  }).join('');

  modal.innerHTML = `
    <div class="detail-modal-card">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">${clinic.name}</h2>
          <small style="color:var(--text-muted)">${clinic.id} · ${clinic.city}</small>
        </div>
        <button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button>
      </div>

      <div class="detail-section">
        <h3><i class="fa-solid fa-cubes"></i> Services — Toggle On / Off</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Changes apply immediately and are reflected in the doctor's dashboard on next login.</p>
        ${serviceToggleRows}
      </div>

      ${hasReception ? `
        <div class="detail-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <h3 style="margin-bottom:0;display:flex;align-items:center;gap:8px">
              <i class="fa-solid fa-user-nurse"></i> Receptionist Staff Account
            </h3>
            <div style="display:flex;gap:6px;align-items:center">
              <button class="btn-primary" data-action="open-add-receptionist" data-clinic="${clinic.id}" style="padding:5px 12px;font-size:12px;display:inline-flex;align-items:center;gap:6px">
                <i class="fa-solid ${clinic.receptionist ? 'fa-user-pen' : 'fa-user-plus'}"></i> ${clinic.receptionist ? 'Edit Receptionist' : 'Add Receptionist'}
              </button>
              ${clinic.receptionist ? `
                <button class="btn-secondary" data-action="remove-receptionist" data-clinic="${clinic.id}" style="padding:5px 10px;font-size:12px;color:#dc2626;border-color:#dc2626;display:inline-flex;align-items:center;gap:5px" title="Remove Receptionist">
                  <i class="fa-solid fa-user-xmark"></i> Remove
                </button>
              ` : ''}
            </div>
          </div>

          ${clinic.receptionist ? `
            <div class="receptionist-notice-box">
              <i class="fa-solid fa-shield-check"></i>
              <div><strong>Front-Desk Operations Active:</strong> Receptionist registers Family Heads and pushes patients to the doctor queue.</div>
            </div>
            <div class="detail-grid">
              <div class="detail-item"><small>Name</small><strong>${clinic.receptionist.name}</strong></div>
              <div class="detail-item"><small>Phone</small><strong>${clinic.receptionist.phone || 'N/A'}</strong></div>
              <div class="detail-item"><small>Shift</small><strong>${clinic.receptionist.shift || 'General Shift'}</strong></div>
              <div class="detail-item span-2"><small>Email (Login)</small><strong>${clinic.receptionist.email}</strong></div>
              <div class="detail-item"><small>Status</small><strong><span class="status-pill ${clinic.receptionist.status === 'Suspended' ? 'account-status-suspended' : ''}">${clinic.receptionist.status || 'Active'}</span></strong></div>
            </div>
          ` : `
            <div style="background:var(--primary-teal-light);border:1px dashed var(--primary-teal-border);border-radius:var(--radius-md);padding:18px;text-align:center">
              <i class="fa-solid fa-user-nurse" style="font-size:26px;color:var(--primary-teal);margin-bottom:8px;display:inline-block"></i>
              <div style="font-weight:700;color:var(--text-main);font-size:13px;margin-bottom:4px">No Receptionist Account Configured</div>
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Receptionist Service is enabled for this clinic. Assign a staff member to handle front-desk operations and doctor queues.</div>
              <button class="btn-primary" data-action="open-add-receptionist" data-clinic="${clinic.id}" style="padding:6px 14px;font-size:12px;display:inline-flex;align-items:center;gap:6px">
                <i class="fa-solid fa-user-plus"></i> Add Receptionist
              </button>
            </div>
          `}
        </div>
      ` : ''}

      <div class="detail-section">
        <h3><i class="fa-solid fa-hospital"></i> Clinic Information</h3>
        <div class="detail-grid">
          <div class="detail-item"><small>Clinic ID</small><strong>${clinic.id}</strong></div>
          <div class="detail-item"><small>Registration</small><strong>${clinic.registration || 'N/A'}</strong></div>
          <div class="detail-item"><small>Status</small><strong><span class="status-pill ${clinic.status === 'Suspended' ? 'account-status-suspended' : ''}">${clinic.status}</span></strong></div>
          <div class="detail-item"><small>City</small><strong>${clinic.city}</strong></div>
          <div class="detail-item"><small>Phone</small><strong>${clinic.phone || 'N/A'}</strong></div>
          <div class="detail-item"><small>Email</small><strong>${clinic.email || 'N/A'}</strong></div>
          <div class="detail-item"><small>Operating days</small><strong>${clinic.days || 'N/A'}</strong></div>
          <div class="detail-item"><small>Working hours</small><strong>${clinic.hours || 'N/A'}</strong></div>
          <div class="detail-item"><small>Specialties</small><strong>${clinic.specialties || 'N/A'}</strong></div>
          <div class="detail-item"><small>Facilities</small><strong>${clinic.facilities || 'N/A'}</strong></div>
        </div>
        <div style="margin-top:8px"><small style="color:var(--text-muted)">Address:</small><br><strong>${clinic.address || 'N/A'}</strong></div>
      </div>

      <div class="detail-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <h3 style="margin-bottom:0;display:flex;align-items:center;gap:8px">
            <i class="fa-solid fa-user-doctor"></i> Doctors mapped to this clinic
          </h3>
          <button class="btn-primary" data-action="open-add-doctor" data-clinic="${clinic.id}" style="padding:5px 12px;font-size:12px;display:inline-flex;align-items:center;gap:6px">
            <i class="fa-solid fa-user-plus"></i> Add Doctor
          </button>
        </div>
        ${assignedDoctors.length ? table(
          ['Doctor', 'Specialty', 'Status', 'Suspend', 'Remove'],
          assignedDoctors.map(doctor => `
            <tr data-doctor-name="${doctor.name}">
              <td><strong>${doctor.name}</strong><br><small>${doctor.email || ''}</small></td>
              <td>${doctor.specialty}</td>
              <td><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></td>
              <td><button class="btn-secondary suspend-button" style="font-size:11px;padding:4px 8px" data-action="toggle-doctor" data-doctor="${doctor.name}" data-clinic="${clinic.id}">${doctor.status === 'Suspended' ? 'Restore' : 'Suspend'}</button></td>
              <td><button class="btn-secondary" style="font-size:11px;padding:4px 8px;color:#dc2626;border-color:#dc2626" data-action="remove-doctor-from-clinic" data-doctor="${doctor.name}" data-clinic="${clinic.id}"><i class="fa-solid fa-user-minus"></i> Remove</button></td>
            </tr>
          `).join('')
        ) : `
          <div class="empty-results" style="padding:22px;text-align:center">
            <p style="margin-bottom:10px;color:var(--text-muted)">No doctor accounts are mapped yet.</p>
            <button class="btn-primary" data-action="open-add-doctor" data-clinic="${clinic.id}" style="padding:6px 14px;font-size:12px;display:inline-flex;align-items:center;gap:6px">
              <i class="fa-solid fa-user-plus"></i> Add Doctor
            </button>
          </div>
        `}
      </div>

      <div class="modal-footer" style="gap:8px;flex-wrap:wrap">
        <button class="btn-secondary" data-action="close-details">Close</button>
        <button class="btn-secondary" data-action="edit-clinic" data-clinic="${clinic.id}" style="color:#2563eb;border-color:#2563eb"><i class="fa-solid fa-pen"></i> Edit Details</button>
        <button class="btn-secondary suspend-button" data-action="toggle-clinic" data-clinic="${clinic.id}">${clinic.status === 'Suspended' ? '<i class="fa-solid fa-check-circle"></i> Restore' : '<i class="fa-solid fa-ban"></i> Suspend'}</button>
        <button class="btn-secondary" data-action="delete-clinic" data-clinic="${clinic.id}" style="color:#dc2626;border-color:#dc2626"><i class="fa-solid fa-trash"></i> Delete Clinic</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeDetails() {
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function openDoctorDetails(name) {
  const doctor = clinicDoctors.find(item => item.name === name);
  if (!doctor) return;
  const clinic = clinics.find(c => c.name === doctor.clinic);
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
          <div class="detail-item"><small>Mapped clinic</small><strong>${doctor.clinic}</strong></div>
          <div class="detail-item"><small>Specialization</small><strong>${doctor.specialty}</strong></div>
          <div class="detail-item"><small>Email</small><strong>${doctor.email || 'Not provided'}</strong></div>
          <div class="detail-item"><small>Registration</small><strong>${doctor.registration || 'Not provided'}</strong></div>
          <div class="detail-item"><small>Patients</small><strong>${doctor.patients || 0}</strong></div>
          <div class="detail-item"><small>Visits</small><strong>${doctor.visits || 0}</strong></div>
          <div class="detail-item"><small>Credential document</small><strong>${doctor.certificate || 'On file'}</strong></div>
        </div>
      </div>
      <div class="detail-section">
        <h3><i class="fa-solid fa-cubes"></i> Active Doctor Services for ${doctor.clinic}</h3>
        <div>${renderServiceTagsMini(clinic?.services || [])}</div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" data-action="close-details">Close</button>
        <button class="btn-secondary suspend-button" data-action="toggle-doctor" data-doctor="${doctor.name}">${doctor.status === 'Suspended' ? 'Restore account' : 'Suspend account'}</button>
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
          <div class="detail-item"><small>Status</small><strong><span class="status-pill">${patient.status}</span></strong></div>
          <div class="detail-item"><small>Clinic</small><strong>${patient.clinic}</strong></div>
          <div class="detail-item"><small>Primary doctor</small><strong>${patient.doctor}</strong></div>
          <div class="detail-item"><small>Total visits</small><strong>${patient.visits}</strong></div>
          <div class="detail-item"><small>Last visit</small><strong>${patient.lastVisit}</strong></div>
          <div class="detail-item"><small>Contact</small><strong>${patient.phone || 'Not provided'}</strong></div>
          <div class="detail-item"><small>Address</small><strong>${patient.address || 'Not provided'}</strong></div>
          <div class="detail-item"><small>Blood group</small><strong>${patient.bloodGroup || 'Not recorded'}</strong></div>
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

function doctorEntry(index) {
  return `
    <div class="doctor-entry">
      <div class="doctor-entry-header">
        <strong>Doctor ${index}</strong>
        <button type="button" class="remove-doctor">Remove</button>
      </div>
      <div class="clinic-form-grid">
        <div class="form-group"><label class="form-label">Full name <span class="req">*</span></label><input class="form-input doctor-name" required placeholder="Dr. Full Name"></div>
        <div class="form-group"><label class="form-label">Specialization <span class="req">*</span></label><input class="form-input doctor-specialty" required placeholder="e.g. Cardiology"></div>
        <div class="form-group"><label class="form-label">Registration number <span class="req">*</span></label><input class="form-input doctor-reg" required placeholder="GMC-2026-XXXX"></div>
        <div class="form-group"><label class="form-label">Doctor email <span class="req">*</span></label><input class="form-input doctor-email" type="email" required placeholder="doctor@example.com"></div>
        <div class="form-group"><label class="form-label">Initial login password <span class="req">*</span></label><input class="form-input doctor-password" type="password" minlength="8" required placeholder="At least 8 characters"></div>
        <div class="form-group"><label class="form-label">Medical certificate <span class="req">*</span></label><input class="file-input doctor-certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required><small class="clinic-form-help">PDF, JPG or PNG</small></div>
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
            <h3><i class="fa-solid fa-hospital"></i> Clinic identity and contact</h3>
            <div class="clinic-form-grid">
              <div class="form-group"><label class="form-label">Legal clinic name <span class="req">*</span></label><input class="form-input" name="name" required placeholder="Registered clinic name"></div>
              <div class="form-group"><label class="form-label">Clinic registration number <span class="req">*</span></label><input class="form-input" name="registration" required placeholder="e.g. REG-2026-AHM-01"></div>
              <div class="form-group"><label class="form-label">Phone number <span class="req">*</span></label><input class="form-input" name="phone" required type="tel" placeholder="10-digit mobile or landline"></div>
              <div class="form-group"><label class="form-label">Email address <span class="req">*</span></label><input class="form-input" name="email" required type="email" placeholder="clinic@example.com"></div>
              <div class="form-group full-width"><label class="form-label">Complete address <span class="req">*</span></label><textarea class="form-textarea" name="address" required rows="2" placeholder="Building, street, area, city, state and PIN code"></textarea></div>
              <div class="form-group"><label class="form-label">Operating days <span class="req">*</span></label><input class="form-input" name="days" required placeholder="Monday - Saturday"></div>
              <div class="form-group"><label class="form-label">Working hours <span class="req">*</span></label><input class="form-input" name="hours" required placeholder="09:00 - 20:00"></div>
            </div>
          </div>

          <!-- Services Selection -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-cubes"></i> Clinic Services & Feature Modules</h3>
            <p class="clinic-form-help" style="margin-bottom:10px">Select which services this clinic provides. If Receptionist Service is OFF, Patient Queue is automatically disabled (Doctor-Only direct mode).</p>
            
            <div class="services-selection-grid">
              <!-- Receptionist Service Toggle -->
              <label class="service-select-item is-selected" id="item_receptionist">
                <input type="checkbox" name="services" value="receptionist" id="svc_receptionist" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-user-nurse" style="color:#0f766e"></i> Receptionist Service (Front Desk)</strong>
                  <small>Dual login: Receptionist registers family heads, adds members, or finds patients & pushes to doctor queue.</small>
                </div>
              </label>

              <!-- Patient Queue Service (Dependent on Receptionist) -->
              <label class="service-select-item is-selected" id="item_appointment">
                <input type="checkbox" name="services" value="appointment" id="svc_appointment" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-users-line" style="color:#0284c7"></i> Patient Consultation Queue</strong>
                  <small id="apptHelpText">Queue dispatch: Doctor takes arriving patients from queue directly without searching.</small>
                </div>
              </label>

              <!-- Digital Prescription -->
              <label class="service-select-item is-selected" id="item_prescription">
                <input type="checkbox" name="services" value="digitalPrescription" id="svc_prescription" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-file-prescription" style="color:#2563eb"></i> Digital Multi-Language Prescription</strong>
                  <small>Regional language dosage labels (Gujarati/Hindi/English), meal timing (AF/BF), and quick templates.</small>
                </div>
              </label>

              <!-- Medical Certificates -->
              <label class="service-select-item is-selected" id="item_certificates">
                <input type="checkbox" name="services" value="certificates" id="svc_certificates" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-certificate" style="color:#d97706"></i> Medical Certificates & Verification</strong>
                  <small>Generate fitness/sickness certificates with unique auto-generated certificate IDs.</small>
                </div>
              </label>

              <!-- Billing & Invoicing -->
              <label class="service-select-item is-selected full-width" id="item_billing">
                <input type="checkbox" name="services" value="billing" id="svc_billing" checked>
                <div class="service-select-info">
                  <strong><i class="fa-solid fa-file-invoice-dollar" style="color:#16a34a"></i> Billing, Invoices & Receipts</strong>
                  <small>Itemized clinical consultation invoices, payment status (Paid/Partial/Due), and receipt printouts.</small>
                </div>
              </label>
            </div>

            <!-- Dynamic Receptionist Staff Account Form (Shown only when Receptionist Service is checked) -->
            <div class="receptionist-form-container" id="receptionistStaffSection">
              <div class="receptionist-form-header">
                <i class="fa-solid fa-user-nurse"></i> Receptionist Staff Account Details
              </div>
              <div class="receptionist-notice-box">
                <i class="fa-solid fa-circle-info"></i>
                <div>
                  <strong>Dual-Login Mode Enabled:</strong> Two logins will exist for this clinic (Receptionist & Doctor). The receptionist registers family heads, adds members, and pushes patients into the doctor's appointment queue so the doctor can directly open the consultation form.
                </div>
              </div>
              <div class="clinic-form-grid">
                <div class="form-group">
                  <label class="form-label">Receptionist Full Name <span class="req">*</span></label>
                  <input class="form-input" id="rec_name" name="receptionistName" required placeholder="e.g. Pooja Sharma">
                </div>
                <div class="form-group">
                  <label class="form-label">Receptionist Email / Login Username <span class="req">*</span></label>
                  <input class="form-input" id="rec_email" name="receptionistEmail" type="email" required placeholder="receptionist@clinic.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Contact Phone <span class="req">*</span></label>
                  <input class="form-input" id="rec_phone" name="receptionistPhone" type="tel" required placeholder="10-digit mobile number">
                </div>
                <div class="form-group">
                  <label class="form-label">Duty Shift / Hours <span class="req">*</span></label>
                  <input class="form-input" id="rec_shift" name="receptionistShift" required placeholder="e.g. Morning Shift (08:00 AM - 03:00 PM)">
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Initial Login Password <span class="req">*</span></label>
                  <input class="form-input" id="rec_pwd" name="receptionistPassword" type="password" minlength="8" required placeholder="At least 8 characters">
                </div>
              </div>
            </div>

            <!-- Doctor-Only Notice (Shown when Receptionist Service is unchecked) -->
            <div class="receptionist-form-container" id="doctorOnlyNoticeSection" style="display:none; background:#f8fafc; border-color:#cbd5e1;">
              <div class="receptionist-form-header" style="color:#334155">
                <i class="fa-solid fa-user-doctor"></i> Doctor-Only Mode (Direct Workflow)
              </div>
              <div class="receptionist-notice-box" style="background:#ffffff; border-color:#e2e8f0; color:#475569;">
                <i class="fa-solid fa-info-circle"></i>
                <div>
                  <strong>Single Doctor Login Mode:</strong> Receptionist service and appointment queue are turned OFF. The doctor handles family head registration, member addition, and new visit entry directly without an intermediate queue.
                </div>
              </div>
            </div>
          </div>

          <!-- Specialties & Facilities -->
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-stethoscope"></i> Clinical specialties and facilities</h3>
            <div class="clinic-form-grid">
              <div class="form-group full-width">
                <label class="form-label">Specialties provided <span class="req">*</span></label>
                <input class="form-input" name="specialties" required placeholder="e.g. General Medicine, Cardiology, Pediatrics">
                <small class="clinic-form-help">Separate specialties with commas.</small>
              </div>
              <div class="form-group">
                <label class="form-label">Facilities</label>
                <input class="form-input" name="facilities" placeholder="Pharmacy, lab, ultrasound, ECG">
              </div>
              <div class="form-group">
                <label class="form-label">Clinic certificate <span class="req">*</span></label>
                <input class="file-input" name="clinicCertificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required>
                <small class="clinic-form-help">Registration / accreditation proof</small>
              </div>
            </div>
          </div>

          <!-- Doctors and Credentials -->
          <div class="clinic-form-section">
            <div class="doctor-entry-header">
              <h3><i class="fa-solid fa-user-doctor"></i> Doctors and credentials</h3>
              <button type="button" class="btn-secondary" id="addDoctor"><i class="fa-solid fa-plus"></i> Add doctor</button>
            </div>
            <div id="doctorEntries">${doctorEntry(1)}</div>
          </div>

        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-shield-check"></i> Register Clinic with Selected Services</button>
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
  const recFields = ['rec_name', 'rec_email', 'rec_phone', 'rec_shift', 'rec_pwd'].map(id => document.getElementById(id));

  function updateServiceDependencies() {
    const isRecOn = recCheckbox.checked;

    if (isRecOn) {
      // Enable appointment queue
      apptCheckbox.disabled = false;
      apptCheckbox.checked = true;
      itemAppt.classList.remove('is-disabled');
      itemAppt.classList.add('is-selected');
      apptHelp.innerHTML = `Queue dispatch: Doctor takes arriving patients from queue directly without searching.`;
      
      // Show receptionist form
      recSection.style.display = 'block';
      docOnlySection.style.display = 'none';
      recFields.forEach(f => f && f.setAttribute('required', 'true'));
    } else {
      // Disable and turn off appointment queue automatically
      apptCheckbox.checked = false;
      apptCheckbox.disabled = true;
      itemAppt.classList.add('is-disabled');
      itemAppt.classList.remove('is-selected');
      apptHelp.innerHTML = `<span style="color:#b91c1c; font-weight:600"><i class="fa-solid fa-ban"></i> Disabled in Doctor-Only Mode</span> (Doctor registers & consults directly)`;

      // Hide receptionist form and show doctor-only notice
      recSection.style.display = 'none';
      docOnlySection.style.display = 'block';
      recFields.forEach(f => f && f.removeAttribute('required'));
    }
  }

  // Interactive checkbox styling & events
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

  document.getElementById('clinicForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.target);
    const phone = String(data.get('phone')).replace(/\D/g, '');
    const registration = String(data.get('registration')).trim();
    const email = String(data.get('email')).trim();
    const address = String(data.get('address')).trim();
    const clinicName = data.get('name').trim();

    if (clinicName.length < 3) { showToast('Clinic name must contain at least 3 characters.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { showToast('Enter a valid 10-digit Indian clinic phone number.'); return; }
    if (!/^[A-Za-z0-9][A-Za-z0-9/-]{3,29}$/.test(registration)) { showToast('Enter a valid clinic registration number.'); return; }
    if (!email.includes('@') || !email.includes('.')) { showToast('Enter a valid clinic email address.'); return; }
    if (address.length < 10) { showToast('Enter the clinic address in sufficient detail.'); return; }

    const isRecSelected = recCheckbox.checked;
    const selectedServices = Array.from(event.target.querySelectorAll('input[name="services"]:checked'))
      .map(cb => cb.value)
      .filter(s => s !== 'reports'); // Enforce reports removed

    // Ensure appointment queue is strictly stripped if receptionist is not selected
    const finalServices = isRecSelected ? selectedServices : selectedServices.filter(s => s !== 'appointment');

    let receptionistData = null;
    if (isRecSelected) {
      const recName = data.get('receptionistName')?.trim();
      const recEmail = data.get('receptionistEmail')?.trim();
      const recPhone = String(data.get('receptionistPhone') || '').replace(/\D/g, '');
      const recShift = data.get('receptionistShift')?.trim();
      const recPwd = data.get('receptionistPassword');

      if (!recName || recName.length < 2) { showToast('Enter receptionist full name.'); return; }
      if (!recEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recEmail)) { showToast('Enter a valid receptionist email.'); return; }
      if (!/^[6-9]\d{9}$/.test(recPhone)) { showToast('Enter a valid 10-digit receptionist phone number.'); return; }
      if (!recPwd || recPwd.length < 8) { showToast('Receptionist password must be at least 8 characters.'); return; }

      receptionistData = {
        name: recName,
        email: recEmail,
        phone: recPhone,
        shift: recShift || 'General Shift',
        status: 'Active'
      };
    }

    const newDoctors = [...entries.querySelectorAll('.doctor-entry')].map(entry => ({
      name: entry.querySelector('.doctor-name').value.trim(),
      specialty: entry.querySelector('.doctor-specialty').value.trim(),
      registration: entry.querySelector('.doctor-reg').value.trim(),
      email: entry.querySelector('.doctor-email').value.trim(),
      password: entry.querySelector('.doctor-password').value,
      certificate: entry.querySelector('.doctor-certificate').files[0]?.name || '',
      status: 'Active',
      patients: 0,
      visits: 0
    }));

    if (newDoctors.some(doctor => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(doctor.email) || doctor.password.length < 8 || !doctor.certificate)) {
      showToast('Check every doctor email, password, and certificate.');
      return;
    }

    if (newDoctors.some(doctor => clinicDoctors.some(existing => existing.email === doctor.email))) {
      showToast('Each doctor email must be unique.');
      return;
    }

    const doctorCount = entries.children.length;
    const newClinicId = `CLN-${String(clinics.length + 1).padStart(3, '0')}`;

    newDoctors.forEach(doctor => {
      doctor.clinic = clinicName;
      doctor.clinicId = newClinicId;
      doctor.services = finalServices;
      clinicDoctors.unshift(doctor);
    });

    clinics.unshift({
      id: newClinicId,
      name: clinicName,
      city: address.split(',').pop().trim() || 'Not specified',
      doctors: doctorCount,
      patients: 0,
      visits: 0,
      status: 'Active',
      updated: 'Just now',
      services: finalServices,
      receptionist: receptionistData,
      specialties: data.get('specialties'),
      facilities: data.get('facilities'),
      phone,
      email,
      registration,
      address,
      days: data.get('days'),
      hours: data.get('hours'),
      verifiedDocuments: doctorCount + 1
    });

    // Strictly initialize isolated clean database for new clinic
    const cleanClinicKey = `clinic-db-${newClinicId}`;
    const cleanDB = {
      counters: { family: 0, patient: 0, visit: 0 },
      families: {},
      appointments: [],
      certificates: [],
      bills: [],
      feedbacks: [],
      dietary: {},
      clinicShortcuts: {
        medicines: {},
        complaints: {},
        investigations: {},
        allergies: {},
        relations: {},
        areas: {},
        societies: {},
      },
      _shortcutsCleanedV2: true,
      customShortcuts: [],
      masterMedicines: [],
      masterComplaints: [],
      masterInvestigations: [],
      masterAreas: [],
      masterSocieties: [],
      masterAllergies: [],
      masterRelations: []
    };
    localStorage.setItem(cleanClinicKey, JSON.stringify(cleanDB));

    saveClinics();
    saveDoctors();
    logActivity('Deleted clinic', 'Clinic', clinic.id, 'Warning', clinic.name);
    closeModal();
    showToast(isRecSelected 
      ? `Clinic registered with Receptionist + Doctor dual-login!` 
      : `Clinic registered in Doctor-Only direct mode!`);
    
    if (location.hash === '#services') renderServices();
    else renderClinics();
  });
}

function closeModal() {
  const modal = document.getElementById('clinicModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : 'success'}`;
  const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ---- Confirm Dialog ---- */
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

/* ---- Delete Clinic ---- */
function deleteClinic(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic) return;
  confirmAction(
    `Are you sure you want to permanently delete <strong>${clinic.name}</strong>?<br>All associated doctor mappings will also be removed. This action cannot be undone.`,
    () => {
      // Remove clinic doctors
      clinicDoctors = clinicDoctors.filter(d => d.clinic !== clinic.name);
      // Remove clinic
      clinics = clinics.filter(c => c.id !== clinicId);
      // Clear local db for that clinic
      localStorage.removeItem(`clinic-db-${clinicId}`);
      saveClinics();
      saveDoctors();
      closeDetails();
      showToast(`Clinic "${clinic.name}" has been deleted.`, 'error');
      if (location.hash === '#services') renderServices();
      else renderClinics();
    }
  );
}

/* ---- Toggle individual service on/off ---- */
function toggleClinicService(clinicId, serviceId) {
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic) return;
  const services = clinic.services || [];
  const isOn = services.includes(serviceId);

  if (isOn) {
    // Turn off
    let newServices = services.filter(s => s !== serviceId);
    // If receptionist turned off, also auto-remove appointment
    if (serviceId === 'receptionist') {
      newServices = newServices.filter(s => s !== 'appointment');
    }
    clinic.services = newServices;
  } else {
    // Turn on
    // appointment can only be enabled when receptionist is on
    if (serviceId === 'appointment' && !services.includes('receptionist')) {
      showToast('Appointment Queue requires Receptionist Service to be enabled first.', 'error');
      return;
    }
    clinic.services = [...services, serviceId];
  }

  clinic.updated = 'Just now';

  // Propagate to doctor localStorage so doctor dashboard reads it immediately
  propagateServicesToClinicDB(clinicId, clinic.services);

  saveClinics();
  logActivity(`${isOn ? 'Disabled' : 'Enabled'} clinic service`, 'Service', `${clinic.name}:${serviceId}`);
  showToast(`${isOn ? 'Disabled' : 'Enabled'} "${serviceId}" for ${clinic.name}.`);
  // Re-open the details with updated data
  openClinicDetails(clinicId);
}

/* ---- Write services into the clinic's localStorage DB so doctor reads it ---- */
function propagateServicesToClinicDB(clinicId, services) {
  try {
    const key = `clinic-db-${clinicId}`;
    const raw = localStorage.getItem(key);
    const db = raw ? JSON.parse(raw) : {};
    db.activeServices = services;
    localStorage.setItem(key, JSON.stringify(db));
  } catch (e) {}
}

/* ---- Remove Doctor from Clinic ---- */
function removeDoctorFromClinic(doctorName, clinicId) {
  const doctor = clinicDoctors.find(d => d.name === doctorName);
  const clinic = clinics.find(c => c.id === clinicId);
  if (!doctor || !clinic) return;
  confirmAction(
    `Remove <strong>${doctorName}</strong> from <strong>${clinic.name}</strong>?<br>The doctor account will be unlinked but not permanently deleted.`,
    () => {
      doctor.clinic = 'Unassigned';
      doctor.clinicId = null;
      if (clinic.doctors > 0) clinic.doctors--;
      saveClinics();
      saveDoctors();
      openClinicDetails(clinicId); // refresh modal
      showToast(`${doctorName} has been removed from ${clinic.name}.`);
    }
  );
}

/* ---- Add Doctor to Clinic Modal ---- */
function openAddDoctorModal(clinicId = null) {
  const clinic = clinicId ? clinics.find(c => c.id === clinicId) : null;
  const modal = document.getElementById('clinicModal');
  const unassignedDoctors = clinicDoctors.filter(d => !d.clinicId || d.clinic === 'Unassigned');

  modal.innerHTML = `
    <div class="clinic-modal-card">
      <div class="modal-header">
        <h2 class="modal-title"><i class="fa-solid fa-user-doctor"></i> ${clinic ? `Add Doctor to ${clinic.name}` : 'Add New Doctor Account'}</h2>
        <button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>
      </div>
      <form id="addDoctorForm">
        <div class="modal-body">
          ${clinic ? `
            <input type="hidden" name="clinicId" value="${clinic.id}">
          ` : `
            <div class="form-group" style="margin-bottom:14px">
              <label class="form-label">Assign to Clinic <span class="req">*</span></label>
              <select class="form-select" name="clinicId" required>
                ${clinics.map(c => `<option value="${c.id}">${c.name} (${c.city})</option>`).join('')}
              </select>
            </div>
          `}

          ${unassignedDoctors.length > 0 ? `
            <div style="background:var(--primary-teal-light);padding:10px 14px;border-radius:var(--radius-md);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
              <div style="font-size:12px;color:var(--text-main)">
                <i class="fa-solid fa-circle-info" style="color:var(--primary-teal);margin-right:4px"></i>
                <strong>${unassignedDoctors.length} unassigned doctor${unassignedDoctors.length > 1 ? 's' : ''}</strong> available.
              </div>
              <button type="button" class="btn-secondary" id="btnToggleUnassigned" style="padding:4px 9px;font-size:11px">
                <i class="fa-solid fa-link"></i> Link Existing
              </button>
            </div>

            <div id="unassignedDocSection" style="display:none;margin-bottom:14px;padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md)">
              <div class="form-group" style="margin-bottom:8px">
                <label class="form-label">Select Unassigned Doctor</label>
                <select class="form-select" id="selectUnassignedDoc">
                  <option value="">-- Choose doctor to link --</option>
                  ${unassignedDoctors.map(d => `<option value="${d.name}">${d.name} (${d.specialty || 'General'})</option>`).join('')}
                </select>
              </div>
              <button type="button" class="btn-primary" id="btnAssignExisting" style="font-size:12px;padding:5px 12px">
                <i class="fa-solid fa-check"></i> Link to Clinic
              </button>
            </div>
          ` : ''}

          <div class="clinic-form-section" style="border-top:0;padding-top:0">
            <h3><i class="fa-solid fa-id-card-clip"></i> Doctor Profile Information</h3>
            <div class="clinic-form-grid">
              <div class="form-group">
                <label class="form-label">Doctor Name <span class="req">*</span></label>
                <input class="form-input" name="doctorName" required placeholder="e.g. Dr. Rajesh Patel">
                <small class="clinic-form-help" id="docNameError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Specialization <span class="req">*</span></label>
                <input class="form-input" name="specialty" list="specialtyList" required placeholder="e.g. General Medicine">
                <datalist id="specialtyList">
                  <option value="General Medicine">
                  <option value="Cardiology">
                  <option value="Pediatrics">
                  <option value="Dermatology">
                  <option value="Orthopedics">
                  <option value="Gynecology & Obstetrics">
                  <option value="ENT Specialist">
                  <option value="Ophthalmology">
                  <option value="Dentistry">
                  <option value="Psychiatry">
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address (Login Username) <span class="req">*</span></label>
                <input class="form-input" name="email" type="email" required placeholder="doctor@clinic.com">
                <small class="clinic-form-help" id="docEmailError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input class="form-input" name="phone" type="tel" placeholder="10-digit mobile number">
              </div>
              <div class="form-group">
                <label class="form-label">Medical Registration No.</label>
                <input class="form-input" name="registration" placeholder="e.g. G-9035 or REG-2026-01">
              </div>
              <div class="form-group">
                <label class="form-label">Login Password</label>
                <input class="form-input" name="password" type="text" value="Password@123" placeholder="Default Password@123">
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-user-plus"></i> Save Doctor</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  const toggleBtn = document.getElementById('btnToggleUnassigned');
  const unassignedSec = document.getElementById('unassignedDocSection');
  if (toggleBtn && unassignedSec) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = unassignedSec.style.display === 'none';
      unassignedSec.style.display = isHidden ? 'block' : 'none';
      toggleBtn.innerHTML = isHidden ? '<i class="fa-solid fa-xmark"></i> Hide' : '<i class="fa-solid fa-link"></i> Link Existing';
    });
  }

  const btnAssignExisting = document.getElementById('btnAssignExisting');
  if (btnAssignExisting) {
    btnAssignExisting.addEventListener('click', () => {
      const selectedName = document.getElementById('selectUnassignedDoc')?.value;
      if (!selectedName) {
        showToast('Please select a doctor to link.', 'error');
        return;
      }
      const targetClinicId = clinicId || document.querySelector('[name="clinicId"]')?.value;
      const targetClinic = clinics.find(c => c.id === targetClinicId);
      const doctor = clinicDoctors.find(d => d.name === selectedName);
      if (!targetClinic || !doctor) return;

      doctor.clinic = targetClinic.name;
      doctor.clinicId = targetClinic.id;
      doctor.status = 'Active';
      targetClinic.doctors = (targetClinic.doctors || 0) + 1;

      saveDoctors();
      saveClinics();
      closeModal();
      const detailsModal = document.getElementById('detailsModal');
      if (detailsModal && detailsModal.classList.contains('active')) {
        openClinicDetails(targetClinic.id);
      } else {
        renderClinics();
      }
      showToast(`${doctor.name} linked to ${targetClinic.name} successfully.`);
    });
  }

  document.getElementById('addDoctorForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const targetClinicId = clinicId || data.get('clinicId');
    const targetClinic = clinics.find(c => c.id === targetClinicId);
    if (!targetClinic) {
      showToast('Please select a valid clinic.', 'error');
      return;
    }

    let rawName = (data.get('doctorName') || '').trim();
    if (rawName.length < 3) {
      const err = document.getElementById('docNameError');
      if (err) { err.textContent = 'Please enter a valid doctor name.'; err.style.display = 'block'; }
      return;
    }
    const docName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;

    const specialty = (data.get('specialty') || '').trim() || 'General Medicine';
    const email = (data.get('email') || '').trim().toLowerCase();
    const phone = String(data.get('phone') || '').replace(/\D/g, '');
    const registration = (data.get('registration') || '').trim() || `REG-${Date.now().toString().slice(-4)}`;
    const password = (data.get('password') || '').trim() || 'Password@123';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = document.getElementById('docEmailError');
      if (err) { err.textContent = 'Enter a valid email address.'; err.style.display = 'block'; }
      return;
    }

    if (clinicDoctors.some(d => (d.email || '').toLowerCase() === email)) {
      const err = document.getElementById('docEmailError');
      if (err) { err.textContent = 'A doctor with this email already exists.'; err.style.display = 'block'; }
      return;
    }

    const newDoc = {
      id: `doc_${Date.now()}`,
      name: docName,
      specialty,
      clinic: targetClinic.name,
      clinicId: targetClinic.id,
      email,
      phone,
      registration,
      password,
      status: 'Active',
      patients: 0,
      visits: 0,
      rating: 95,
      services: targetClinic.services || []
    };

    clinicDoctors.unshift(newDoc);
    targetClinic.doctors = (targetClinic.doctors || 0) + 1;
    targetClinic.updated = 'Just now';

    saveDoctors();
    saveClinics();
    closeModal();

    const detailsModal = document.getElementById('detailsModal');
    if (detailsModal && detailsModal.classList.contains('active')) {
      openClinicDetails(targetClinic.id);
    } else {
      renderClinics();
    }
    showToast(`Doctor ${docName} successfully added to ${targetClinic.name}!`);
  });
}

/* ---- Add / Edit Receptionist Staff Modal ---- */
function openAddReceptionistModal(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic) return;
  const modal = document.getElementById('clinicModal');
  const existing = clinic.receptionist || {};

  modal.innerHTML = `
    <div class="clinic-modal-card">
      <div class="modal-header">
        <h2 class="modal-title"><i class="fa-solid fa-user-nurse"></i> ${clinic.receptionist ? 'Edit Receptionist Staff' : 'Add Receptionist Staff'} · ${clinic.name}</h2>
        <button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>
      </div>
      <form id="receptionistForm">
        <div class="modal-body">
          <div class="receptionist-notice-box" style="margin-bottom:16px">
            <i class="fa-solid fa-shield-check"></i>
            <div>
              <strong>Front-Desk Receptionist Role:</strong>
              This staff account logs into the Receptionist OPD Desk to register Family Heads, search patients, and route tokens to the doctor's queue.
            </div>
          </div>

          <div class="clinic-form-section" style="border-top:0;padding-top:0">
            <h3><i class="fa-solid fa-id-card"></i> Receptionist Account Details</h3>
            <div class="clinic-form-grid">
              <div class="form-group">
                <label class="form-label">Staff / Desk Name <span class="req">*</span></label>
                <input class="form-input" name="name" required value="${existing.name || (clinic.name + ' Front Desk')}" placeholder="e.g. Front Desk or Staff Name">
                <small class="clinic-form-help" id="recNameError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Email (Login Username) <span class="req">*</span></label>
                <input class="form-input" name="email" type="email" required value="${existing.email || ('reception.' + clinic.name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '@dhyeyclinic.com')}" placeholder="reception@clinic.com">
                <small class="clinic-form-help" id="recEmailError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Contact Phone <span class="req">*</span></label>
                <input class="form-input" name="phone" type="tel" required value="${existing.phone || clinic.phone || ''}" placeholder="10-digit number">
                <small class="clinic-form-help" id="recPhoneError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Duty Shift <span class="req">*</span></label>
                <select class="form-select" name="shift">
                  <option value="General Shift (08:30 AM - 08:30 PM)" ${existing.shift?.includes('08:30') ? 'selected' : ''}>General Shift (08:30 AM - 08:30 PM)</option>
                  <option value="Morning Shift (08:00 AM - 02:00 PM)" ${existing.shift?.includes('Morning') ? 'selected' : ''}>Morning Shift (08:00 AM - 02:00 PM)</option>
                  <option value="Evening Shift (02:00 PM - 09:00 PM)" ${existing.shift?.includes('Evening') ? 'selected' : ''}>Evening Shift (02:00 PM - 09:00 PM)</option>
                  <option value="Full Day (09:00 AM - 07:00 PM)" ${existing.shift?.includes('Full Day') ? 'selected' : ''}>Full Day (09:00 AM - 07:00 PM)</option>
                  <option value="Night Emergency (08:00 PM - 08:00 AM)" ${existing.shift?.includes('Night') ? 'selected' : ''}>Night Emergency (08:00 PM - 08:00 AM)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Account Status</label>
                <select class="form-select" name="status">
                  <option value="Active" ${existing.status !== 'Suspended' ? 'selected' : ''}>Active</option>
                  <option value="Suspended" ${existing.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Login Password</label>
                <input class="form-input" name="password" type="text" value="${existing.password || '123'}" placeholder="e.g. 123">
                <small class="clinic-form-help">Default password is 123.</small>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Save Receptionist</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  document.getElementById('receptionistForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = (data.get('name') || '').trim();
    const email = (data.get('email') || '').trim().toLowerCase();
    const phone = String(data.get('phone') || '').replace(/\D/g, '');
    const shift = data.get('shift');
    const status = data.get('status');
    const password = (data.get('password') || '').trim() || '123';

    let valid = true;
    if (name.length < 2) {
      const err = document.getElementById('recNameError');
      if (err) { err.textContent = 'Please enter a valid name.'; err.style.display = 'block'; }
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const err = document.getElementById('recEmailError');
      if (err) { err.textContent = 'Enter a valid email address.'; err.style.display = 'block'; }
      valid = false;
    }
    if (phone.length < 7) {
      const err = document.getElementById('recPhoneError');
      if (err) { err.textContent = 'Enter a valid contact phone number.'; err.style.display = 'block'; }
      valid = false;
    }
    if (!valid) return;

    clinic.receptionist = {
      name,
      email,
      phone,
      shift,
      status,
      password
    };
    clinic.updated = 'Just now';

    saveClinics();
    closeModal();
    openClinicDetails(clinic.id);
    showToast(`Receptionist "${name}" saved for ${clinic.name}.`);
  });
}

/* ---- Remove Receptionist from Clinic ---- */
function removeReceptionistFromClinic(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic || !clinic.receptionist) return;

  confirmAction(
    `Remove receptionist account <strong>${clinic.receptionist.name}</strong> from <strong>${clinic.name}</strong>?`,
    () => {
      clinic.receptionist = null;
      clinic.updated = 'Just now';
      saveClinics();
      openClinicDetails(clinicId);
      showToast(`Receptionist removed from ${clinic.name}.`);
    }
  );
}

window.openAddDoctorModal = openAddDoctorModal;
window.openAddReceptionistModal = openAddReceptionistModal;
window.removeReceptionistFromClinic = removeReceptionistFromClinic;

/* ---- Open Edit Clinic Modal ---- */
function openEditClinicModal(clinicId) {
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic) return;
  closeDetails();
  const modal = document.getElementById('clinicModal');
  modal.innerHTML = `
    <div class="clinic-modal-card">
      <div class="modal-header">
        <h2 class="modal-title"><i class="fa-solid fa-pen"></i> Edit Clinic Details</h2>
        <button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>
      </div>
      <form id="editClinicForm">
        <div class="modal-body">
          <div class="clinic-form-section">
            <h3><i class="fa-solid fa-hospital"></i> Clinic Identity & Contact</h3>
            <div class="clinic-form-grid">
              <div class="form-group">
                <label class="form-label">Legal clinic name <span class="req">*</span></label>
                <input class="form-input" name="name" required value="${clinic.name || ''}" placeholder="Clinic name">
                <small class="clinic-form-help" id="editNameError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Registration number <span class="req">*</span></label>
                <input class="form-input" name="registration" required value="${clinic.registration || ''}" placeholder="REG-XXXX">
                <small class="clinic-form-help" id="editRegError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Phone number <span class="req">*</span></label>
                <input class="form-input" name="phone" type="tel" required value="${clinic.phone || ''}" placeholder="10-digit number">
                <small class="clinic-form-help" id="editPhoneError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Email address <span class="req">*</span></label>
                <input class="form-input" name="email" type="email" required value="${clinic.email || ''}" placeholder="clinic@example.com">
                <small class="clinic-form-help" id="editEmailError" style="color:#dc2626;display:none"></small>
              </div>
              <div class="form-group">
                <label class="form-label">Operating days <span class="req">*</span></label>
                <input class="form-input" name="days" required value="${clinic.days || ''}" placeholder="Mon - Sat">
              </div>
              <div class="form-group">
                <label class="form-label">Working hours <span class="req">*</span></label>
                <input class="form-input" name="hours" required value="${clinic.hours || ''}" placeholder="09:00 - 20:00">
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
                <label class="form-label">Complete address <span class="req">*</span></label>
                <textarea class="form-textarea" name="address" required rows="2" placeholder="Full address">${clinic.address || ''}</textarea>
                <small class="clinic-form-help" id="editAddrError" style="color:#dc2626;display:none"></small>
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
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
          <button class="btn-primary" type="submit"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  document.getElementById('editClinicForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get('name').trim();
    const phone = String(data.get('phone')).replace(/\D/g, '');
    const email = data.get('email').trim();
    const registration = data.get('registration').trim();
    const address = data.get('address').trim();

    // Frontend validation
    let valid = true;
    const showFieldError = (id, msg) => { const el = document.getElementById(id); if (el) { el.textContent = msg; el.style.display = 'block'; } valid = false; };
    const clearFieldError = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

    clearFieldError('editNameError'); clearFieldError('editPhoneError'); clearFieldError('editEmailError'); clearFieldError('editRegError'); clearFieldError('editAddrError');

    if (name.length < 3) showFieldError('editNameError', 'Clinic name must be at least 3 characters.');
    if (!/^[6-9]\d{9}$/.test(phone)) showFieldError('editPhoneError', 'Enter a valid 10-digit Indian phone number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showFieldError('editEmailError', 'Enter a valid email address.');
    if (registration.length < 4) showFieldError('editRegError', 'Registration number is too short.');
    if (address.length < 10) showFieldError('editAddrError', 'Please enter a more detailed address.');
    if (!valid) return;

    // Update clinic object
    clinic.name = name;
    clinic.phone = phone;
    clinic.email = email;
    clinic.registration = registration;
    clinic.address = address;
    clinic.days = data.get('days');
    clinic.hours = data.get('hours');
    clinic.specialties = data.get('specialties');
    clinic.facilities = data.get('facilities');
    clinic.status = data.get('status');
    clinic.city = address.split(',').pop().trim() || clinic.city;
    clinic.updated = 'Just now';

    // Update clinic name in all mapped doctors
    clinicDoctors.forEach(d => { if (d.clinicId === clinicId) d.clinic = name; });

    saveClinics();
    saveDoctors();
    closeModal();
    showToast(`Clinic "${name}" details updated successfully.`);
    if (location.hash === '#services') renderServices();
    else renderClinics();
  });
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

document.addEventListener('click', event => {
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
  
  if (action === 'toggle-clinic') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    const clinic = clinics.find(item => item.id === clinicId);
    if (clinic) {
      const nextStatus = clinic.status === 'Suspended' ? 'restore' : 'suspend';
      if (nextStatus === 'suspend' && !confirm(`Suspend ${clinic.name}'s membership? Confirm to continue.`)) return;
      clinic.status = clinic.status === 'Suspended' ? 'Active' : 'Suspended';
      clinic.updated = 'Just now';
      saveClinics();
      logActivity(`${clinic.status === 'Active' ? 'Restored' : 'Suspended'} clinic membership`, 'Clinic', clinic.id);
      closeDetails();
      showToast(`Clinic "${clinic.name}" ${clinic.status === 'Active' ? 'restored' : 'suspended'}.`);
      if (location.hash === '#services') renderServices();
      else renderClinics();
    }
  }

  if (action === 'toggle-doctor') {
    const name = event.target.closest('[data-doctor]')?.dataset.doctor;
    const doctor = clinicDoctors.find(item => item.name === name);
    if (doctor) {
      const nextStatus = doctor.status === 'Suspended' ? 'restore' : 'suspend';
      if (nextStatus === 'suspend' && !confirm(`Suspend ${doctor.name}'s account? Confirm to continue.`)) return;
      doctor.status = doctor.status === 'Suspended' ? 'Active' : 'Suspended';
      saveDoctors();
      logActivity(`${doctor.status === 'Active' ? 'Restored' : 'Suspended'} doctor account`, 'Doctor', doctor.name);
      const clinicId2 = event.target.closest('[data-clinic]')?.dataset.clinic;
      showToast(`Doctor account ${doctor.status === 'Active' ? 'restored' : 'suspended'}.`);
      // If inside clinic details modal, refresh it
      const detailsModal = document.getElementById('detailsModal');
      if (detailsModal.classList.contains('active') && clinicId2) {
        openClinicDetails(clinicId2);
      } else {
        closeDetails();
        renderClinics();
      }

    }
  }

  if (action === 'clear-logs') {
    if (!confirm('Clear all administrator activity logs? This action cannot be undone.')) return;
    activityLogs = [];
    saveActivityLogs();
    renderLogs();
    showToast('Activity logs cleared.');
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
    if (confirm('Approve this clinic application and add it to the active clinic network?')) {
      approveClinicRequest(event.target.closest('[data-req-id]')?.dataset.reqId);
    }
  }
  if (action === 'reject-request') {
    if (confirm('Reject this clinic application?')) {
      rejectClinicRequest(event.target.closest('[data-req-id]')?.dataset.reqId);
    }
  }

  if (action === 'toggle-service') {
    const clinicId3 = event.target.closest('[data-clinic]')?.dataset.clinic;
    const serviceId = event.target.closest('[data-service]')?.dataset.service;
    if (clinicId3 && serviceId) toggleClinicService(clinicId3, serviceId);
  }

  if (action === 'remove-doctor-from-clinic') {
    const doctorName = event.target.closest('[data-doctor]')?.dataset.doctor;
    const clinicId4 = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (doctorName && clinicId4) removeDoctorFromClinic(doctorName, clinicId4);
  }

  if (action === 'open-add-doctor') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId) openAddDoctorModal(clinicId);
  }

  if (action === 'open-add-doctor-global') {
    openAddDoctorModal();
  }

  if (action === 'open-add-receptionist') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId) openAddReceptionistModal(clinicId);
  }

  if (action === 'remove-receptionist') {
    const clinicId = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId) removeReceptionistFromClinic(clinicId);
  }

  if (action === 'edit-clinic') {
    const clinicId5 = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId5) openEditClinicModal(clinicId5);
  }

  if (action === 'delete-clinic') {
    const clinicId6 = event.target.closest('[data-clinic]')?.dataset.clinic;
    if (clinicId6) deleteClinic(clinicId6);
  }

  if (action === 'account-info') showToast('Administrator account · Full system access');
  if (action === 'logout') {
    localStorage.removeItem('clinic-auth-session');
    sessionStorage.clear();
    showToast('Signed out from Admin Workspace');
    setTimeout(() => {
      window.location.href = '../login.html';
    }, 200);
  }
  if (!event.target.closest('.admin-account')) closeAccountMenu();
});

function handleAdminLogout() {
  localStorage.removeItem('clinic-auth-session');
  sessionStorage.clear();
  window.location.href = '../login.html';
}
window.handleAdminLogout = handleAdminLogout;

function closeAccountMenu() {
  const menu = document.getElementById('accountMenu');
  menu.hidden = true;
  document.getElementById('accountToggle').setAttribute('aria-expanded', 'false');
}

document.getElementById('accountToggle').addEventListener('click', event => {
  event.stopPropagation();
  const menu = document.getElementById('accountMenu');
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!menu.hidden));
});

const savedTheme = localStorage.getItem('dhyey-admin-theme');
if (savedTheme === 'dark') document.body.dataset.theme = 'dark';

document.getElementById('themeToggle').addEventListener('click', event => {
  const dark = document.body.dataset.theme !== 'dark';
  document.body.dataset.theme = dark ? 'dark' : '';
  localStorage.setItem('dhyey-admin-theme', dark ? 'dark' : 'light');
  event.currentTarget.innerHTML = `<i class="fa-solid fa-${dark ? 'sun' : 'moon'}"></i>`;
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('is-collapsed');
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

document.getElementById('todayLabel').textContent = new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date());

function updateDoctorClock() {
  const now = new Date();
  document.getElementById('docClock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}
updateDoctorClock();
setInterval(updateDoctorClock, 1000);

window.addEventListener('hashchange', () => navigate());
document.getElementById('themeToggle').innerHTML = `<i class="fa-solid fa-${savedTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
navigate();
