const STORAGE_KEY = 'dhyey-admin-clinics';

const defaultClinics = [
  { id: 'CLN-001', name: 'Dhyey Main Clinic', city: 'Ahmedabad', doctors: 12, patients: 1840, visits: 428, status: 'Active', updated: 'Today' },
  { id: 'CLN-002', name: 'Satellite Wellness Centre', city: 'Ahmedabad', doctors: 7, patients: 920, visits: 216, status: 'Active', updated: 'Yesterday' },
  { id: 'CLN-003', name: 'Riverside Family Care', city: 'Gandhinagar', doctors: 4, patients: 380, visits: 92, status: 'Paused', updated: '28 Sep 2026' }
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
let clinicDoctors = JSON.parse(localStorage.getItem('dhyey-admin-doctors') || 'null') || doctors.map(doctor => ({ ...doctor, email: `${doctor.name.toLowerCase().replace(/[^a-z]+/g, '.')}@dhyeyclinic.com`, status: 'Active' }));
const content = document.getElementById('adminContent');

function money(value) { return `â‚¹${value.toLocaleString('en-IN')}`; }
function saveClinics() { localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics)); }
function saveDoctors() { localStorage.setItem('dhyey-admin-doctors', JSON.stringify(clinicDoctors)); }
function clinicOptions() { return clinics.map(c => `<option value="${c.name}">${c.name}</option>`).join(''); }
function page(title, subtitle, body, actions = '') {
  content.innerHTML = `<div class="admin-page"><div class="admin-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="admin-actions">${actions}</div></div>${body}</div>`;
}
function table(headers, rows, empty = 'No records match these filters.') {
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}" class="empty-results">${empty}</td></tr>`}</tbody></table></div>`;
}
function stats() {
  const active = clinics.filter(c => c.status === 'Active').length;
  return `<div class="admin-stats">
    <div class="admin-stat"><div class="admin-stat-top"><span>Total clinics</span><span class="admin-stat-icon"><i class="fa-solid fa-hospital"></i></span></div><strong>${clinics.length}</strong><small>${active} active locations</small></div>
    <div class="admin-stat"><div class="admin-stat-top"><span>Registered doctors</span><span class="admin-stat-icon"><i class="fa-solid fa-user-doctor"></i></span></div><strong>${doctors.length}</strong><small>Across all clinics</small></div>
    <div class="admin-stat"><div class="admin-stat-top"><span>Total patients</span><span class="admin-stat-icon"><i class="fa-solid fa-users"></i></span></div><strong>${clinics.reduce((s, c) => s + c.patients, 0).toLocaleString()}</strong><small>+8.4% this month</small></div>
    <div class="admin-stat"><div class="admin-stat-top"><span>Visits this month</span><span class="admin-stat-icon"><i class="fa-solid fa-calendar-check"></i></span></div><strong>${clinics.reduce((s, c) => s + c.visits, 0).toLocaleString()}</strong><small>+12.2% this month</small></div>
  </div>`;
}
function renderOverview() {
  const rows = clinics.map(c => `<tr data-clinic-id="${c.id}"><td><strong>${c.name}</strong><br><small>${c.id} Â· ${c.city}</small></td><td>${c.doctors}</td><td>${c.patients.toLocaleString()}</td><td>${c.visits}</td><td><span class="status-pill ${c.status === 'Paused' ? 'paused' : ''}">${c.status}</span></td></tr>`).join('');
  page('Good evening, Administrator', 'Here is the latest snapshot across your clinic network.', stats(), `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic</button>`);
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `<div class="admin-grid"><section class="admin-card"><div class="admin-card-header"><div><h2>Clinic performance</h2><span>Live network summary</span></div><a class="btn-secondary" href="#clinics" data-view="clinics">View all</a></div>${table(['Clinic', 'Doctors', 'Patients', 'Visits', 'Status'], rows)}</section><section class="admin-card"><div class="admin-card-header"><div><h2>Quick analysis</h2><span>Compare operational activity</span></div></div><div class="quick-links"><a class="admin-quick-link" href="#analysis-clinic" data-view="analysis-clinic"><i class="fa-solid fa-hospital"></i><span><strong>Clinic wise</strong><small>Collections and visits by location</small></span><i class="fa-solid fa-arrow-right"></i></a><a class="admin-quick-link" href="#analysis-doctor" data-view="analysis-doctor"><i class="fa-solid fa-user-doctor"></i><span><strong>Doctor wise</strong><small>Workload and patient outcomes</small></span><i class="fa-solid fa-arrow-right"></i></a><a class="admin-quick-link" href="#analysis-patient" data-view="analysis-patient"><i class="fa-solid fa-user-injured"></i><span><strong>Patient wise</strong><small>Visit history and follow-ups</small></span><i class="fa-solid fa-arrow-right"></i></a></div></section></div>`);
}
function renderClinics() {
  page('Clinic management', 'Add, search, and monitor every location in your network.', '', `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic</button>`);
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `<section class="admin-card"><div class="admin-filter-row"><div class="form-group" style="flex:1;min-width:220px;margin:0"><input class="form-input" id="clinicSearch" placeholder="Search by clinic, city, or ID"></div><select class="form-select" id="clinicStatus"><option value="">All statuses</option><option>Active</option><option>Paused</option></select></div><div id="clinicTable" style="margin-top:16px"></div></section>`);
  const update = () => { const term = document.getElementById('clinicSearch').value.toLowerCase(); const status = document.getElementById('clinicStatus').value; const filtered = clinics.filter(c => `${c.name} ${c.city} ${c.id}`.toLowerCase().includes(term) && (!status || c.status === status)); document.getElementById('clinicTable').innerHTML = table(['Clinic', 'City', 'Doctors', 'Patients', 'Status', 'Updated'], filtered.map(c => `<tr data-clinic-id="${c.id}"><td><strong>${c.name}</strong><br><small>${c.id}</small></td><td>${c.city}</td><td>${c.doctors}</td><td>${c.patients.toLocaleString()}</td><td><span class="status-pill ${c.status === 'Paused' ? 'paused' : ''}">${c.status}</span></td><td>${c.updated}</td></tr>`).join('')); renderDoctorManagement(); };
  document.getElementById('clinicSearch').addEventListener('input', update); document.getElementById('clinicStatus').addEventListener('change', update); update();
}
function renderDoctorManagement() {
  const pageRoot = content.querySelector('.admin-page');
  if (!pageRoot || pageRoot.querySelector('#doctorManagement')) return;
  pageRoot.insertAdjacentHTML('beforeend', `<section class="admin-card" id="doctorManagement"><div class="admin-card-header"><div><h2>Doctor management</h2><span>Every doctor is mapped to a registered clinic.</span></div><span>${clinicDoctors.length} accounts</span></div>${table(['Doctor', 'Clinic', 'Email', 'Specialty', 'Status', 'Action'], clinicDoctors.map(doctor => `<tr data-doctor-name="${doctor.name}"><td><strong>${doctor.name}</strong><br><small>${doctor.registration || 'Credential on file'}</small></td><td>${doctor.clinic}</td><td>${doctor.email || 'Not provided'}</td><td>${doctor.specialty}</td><td><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></td><td><button class="btn-secondary suspend-button" data-action="toggle-doctor" data-doctor="${doctor.name}">${doctor.status === 'Suspended' ? 'Restore account' : 'Suspend account'}</button></td></tr>`).join(''))}</section>`);
}
function renderAnalysis(type) {
  const isClinic = type === 'clinic'; const isDoctor = type === 'doctor';
  const title = isClinic ? 'Clinic wise analysis' : isDoctor ? 'Doctor wise analysis' : 'Patient wise analysis';
  const subtitle = isClinic ? 'Compare patient volume, visits, and collections by location.' : isDoctor ? 'Track doctor workload and patient engagement.' : 'Find visit patterns and follow-up needs for individual patients.';
  page(title, subtitle, '', `<button class="btn-secondary" data-action="export"><i class="fa-solid fa-download"></i> Export CSV</button>`);
  const filter = `<div class="analysis-toolbar"><div class="form-group" style="flex:1;min-width:220px"><label class="form-label">Search everything</label><input class="form-input" id="analysisSearch" placeholder="Search by name, ID, doctor or clinic"></div><div class="form-group"><label class="form-label">Clinic</label><select class="form-select" id="analysisClinic"><option value="">All clinics</option>${clinicOptions()}</select></div><div class="form-group"><label class="form-label">Date range</label><select class="form-select" id="analysisRange"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">This year</option></select></div><div class="form-group"><label class="form-label">Activity</label><select class="form-select" id="analysisActivity"><option value="">Any activity</option><option value="high">High activity</option><option value="low">Needs attention</option></select></div><div class="form-group"><label class="form-label">Sort by</label><select class="form-select" id="analysisSort"><option value="default">Default</option><option value="high">Highest first</option><option value="low">Lowest first</option></select></div></div><div class="quick-filter-bar"><span class="clinic-form-help">Frequent filters:</span><button type="button" class="quick-filter active" data-quick-filter="">All records</button><button type="button" class="quick-filter" data-quick-filter="today">Updated recently</button><button type="button" class="quick-filter" data-quick-filter="high">High performers</button><button type="button" class="quick-filter" data-quick-filter="attention">Needs attention</button></div>`;
  const card = `<section class="admin-card">${filter}<div id="analysisTable" style="margin-top:18px"></div></section>`; content.querySelector('.admin-page').insertAdjacentHTML('beforeend', card);
  let quickFilter = '';
  const update = () => { const selected = document.getElementById('analysisClinic').value; const term = document.getElementById('analysisSearch').value.toLowerCase(); const activity = document.getElementById('analysisActivity').value || quickFilter; const sort = document.getElementById('analysisSort').value; let rows;   if (isClinic) { let records = clinics.filter(c => (!selected || c.name === selected) && `${c.name} ${c.city} ${c.specialties || ''}`.toLowerCase().includes(term)); if (activity === 'high' || activity === 'today') records = records.filter(c => c.visits >= 200); if (activity === 'low' || activity === 'attention') records = records.filter(c => c.visits < 200); if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.visits - a.visits : a.visits - b.visits); rows = records.map(c => `<tr data-clinic-id="${c.id}"><td><strong>${c.name}</strong><br><small>${c.city}</small></td><td>${c.doctors}</td><td>${c.patients.toLocaleString()}</td><td>${c.visits}</td><td>${money(c.visits * 650)}</td><td><div class="metric-bar"><i style="width:${Math.min(c.visits / 5, 100)}%"></i></div></td></tr>`); } else if (isDoctor) { let records = clinicDoctors.filter(d => (!selected || d.clinic === selected) && `${d.name} ${d.specialty} ${d.clinic}`.toLowerCase().includes(term)); if (activity === 'high' || activity === 'today') records = records.filter(d => (d.rating || 0) >= 90); if (activity === 'low' || activity === 'attention') records = records.filter(d => (d.rating || 0) < 90); if (sort !== 'default') records.sort((a, b) => sort === 'high' ? (b.rating || 0) - (a.rating || 0) : (a.rating || 0) - (b.rating || 0)); rows = records.map(d => `<tr data-doctor-name="${d.name}"><td><strong>${d.name}</strong><br><small>${d.specialty}</small></td><td>${d.clinic}</td><td>${d.patients || 0}</td><td>${d.visits || 0}</td><td>${d.rating || 0}%</td><td><div class="metric-bar"><i style="width:${d.rating || 0}%"></i></div></td></tr>`); } else { let records = patients.filter(p => (!selected || p.clinic === selected) && `${p.name} ${p.id} ${p.doctor} ${p.status}`.toLowerCase().includes(term)); if (activity === 'high' || activity === 'today') records = records.filter(p => p.visits >= 5); if (activity === 'low' || activity === 'attention') records = records.filter(p => p.status === 'Follow-up'); if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.visits - a.visits : a.visits - b.visits); rows = records.map(p => `<tr data-patient-id="${p.id}"><td><strong>${p.name}</strong><br><small>${p.id}</small></td><td>${p.clinic}</td><td>${p.doctor}</td><td>${p.visits}</td><td>${p.lastVisit}</td><td><span class="status-pill">${p.status}</span></td></tr>`); } const headers = isClinic ? ['Clinic', 'Doctors', 'Patients', 'Visits', 'Collection', 'Volume'] : isDoctor ? ['Doctor', 'Clinic', 'Patients', 'Visits', 'Satisfaction', 'Score'] : ['Patient', 'Clinic', 'Doctor', 'Visits', 'Last visit', 'Status']; document.getElementById('analysisTable').innerHTML = table(headers, rows.join('')); };
  ['analysisClinic', 'analysisRange', 'analysisActivity', 'analysisSort', 'analysisSearch'].forEach(id => document.getElementById(id).addEventListener(id === 'analysisSearch' ? 'input' : 'change', update));
  content.querySelectorAll('[data-quick-filter]').forEach(button => button.addEventListener('click', () => { quickFilter = button.dataset.quickFilter; content.querySelectorAll('[data-quick-filter]').forEach(item => item.classList.toggle('active', item === button)); update(); })); update();
}
function openClinicDetails(clinicId) {
  const clinic = clinics.find(item => item.id === clinicId);
  if (!clinic) return;
  const assignedDoctors = clinicDoctors.filter(doctor => doctor.clinic === clinic.name);
  const modal = document.getElementById('detailsModal');
  modal.innerHTML = `<div class="detail-modal-card"><div class="modal-header"><h2 class="modal-title">${clinic.name}</h2><button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button></div><div class="detail-section"><div class="detail-grid"><div class="detail-item"><small>Clinic ID</small><strong>${clinic.id}</strong></div><div class="detail-item"><small>Registration number</small><strong>${clinic.registration || 'Not provided'}</strong></div><div class="detail-item"><small>Status</small><strong><span class="status-pill ${clinic.status === 'Suspended' ? 'account-status-suspended' : ''}">${clinic.status}</span></strong></div><div class="detail-item"><small>Last updated</small><strong>${clinic.updated}</strong></div><div class="detail-item"><small>City</small><strong>${clinic.city}</strong></div><div class="detail-item"><small>Phone</small><strong>${clinic.phone || 'Not provided'}</strong></div><div class="detail-item"><small>Email</small><strong>${clinic.email || 'Not provided'}</strong></div><div class="detail-item"><small>Operating days</small><strong>${clinic.days || 'Not provided'}</strong></div><div class="detail-item"><small>Working hours</small><strong>${clinic.hours || 'Not provided'}</strong></div><div class="detail-item"><small>Registered doctors</small><strong>${clinic.doctors}</strong></div><div class="detail-item"><small>Verified documents</small><strong>${clinic.verifiedDocuments || 'On file'}</strong></div><div class="detail-item"><small>Patients</small><strong>${clinic.patients.toLocaleString()}</strong></div><div class="detail-item"><small>Visits</small><strong>${clinic.visits}</strong></div><div class="detail-item"><small>Specialties</small><strong>${clinic.specialties || 'Not specified'}</strong></div><div class="detail-item"><small>Facilities</small><strong>${clinic.facilities || 'Not specified'}</strong></div></div></div><div class="detail-section"><h3><i class="fa-solid fa-location-dot"></i> Address</h3><div class="detail-item"><strong>${clinic.address || 'Not provided'}</strong></div></div><div class="detail-section"><h3><i class="fa-solid fa-user-doctor"></i> Doctors mapped to this clinic</h3>${assignedDoctors.length ? table(['Doctor', 'Email', 'Specialty', 'Status', 'Action'], assignedDoctors.map(doctor => `<tr data-doctor-name="${doctor.name}"><td>${doctor.name}</td><td>${doctor.email || 'Not provided'}</td><td>${doctor.specialty}</td><td><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></td><td><button class="btn-secondary suspend-button" data-action="toggle-doctor" data-doctor="${doctor.name}">${doctor.status === 'Suspended' ? 'Restore' : 'Suspend'}</button></td></tr>`).join('')) : '<div class="empty-results">No doctor accounts are mapped yet.</div>'}</div><div class="modal-footer"><button class="btn-secondary" data-action="close-details">Close</button><button class="btn-secondary suspend-button" data-action="toggle-clinic" data-clinic="${clinic.id}">${clinic.status === 'Suspended' ? 'Restore membership' : 'Suspend membership'}</button></div></div>`;
  modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
}
function closeDetails() { const modal = document.getElementById('detailsModal'); modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); }
function openDoctorDetails(name) {
  const doctor = clinicDoctors.find(item => item.name === name);
  if (!doctor) return;
  const modal = document.getElementById('detailsModal');
  modal.innerHTML = `<div class="detail-modal-card"><div class="modal-header"><h2 class="modal-title">${doctor.name}</h2><button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button></div><div class="detail-section"><div class="detail-grid"><div class="detail-item"><small>Status</small><strong><span class="status-pill ${doctor.status === 'Suspended' ? 'account-status-suspended' : ''}">${doctor.status || 'Active'}</span></strong></div><div class="detail-item"><small>Mapped clinic</small><strong>${doctor.clinic}</strong></div><div class="detail-item"><small>Specialization</small><strong>${doctor.specialty}</strong></div><div class="detail-item"><small>Email</small><strong>${doctor.email || 'Not provided'}</strong></div><div class="detail-item"><small>Registration</small><strong>${doctor.registration || 'Not provided'}</strong></div><div class="detail-item"><small>Patients</small><strong>${doctor.patients || 0}</strong></div><div class="detail-item"><small>Visits</small><strong>${doctor.visits || 0}</strong></div><div class="detail-item"><small>Credential document</small><strong>${doctor.certificate || 'On file'}</strong></div></div></div><div class="detail-section"><h3><i class="fa-solid fa-shield-halved"></i> Account access</h3><p class="clinic-form-help">The login email is shown for administration. Passwords are never displayed.</p></div><div class="modal-footer"><button class="btn-secondary" data-action="close-details">Close</button><button class="btn-secondary suspend-button" data-action="toggle-doctor" data-doctor="${doctor.name}">${doctor.status === 'Suspended' ? 'Restore account' : 'Suspend account'}</button></div></div>`;
  modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
}
function openPatientDetails(id) {
  const patient = patients.find(item => item.id === id);
  if (!patient) return;
  const modal = document.getElementById('detailsModal');
  modal.innerHTML = `<div class="detail-modal-card"><div class="modal-header"><h2 class="modal-title">${patient.name}</h2><button class="modal-close-btn" data-action="close-details" aria-label="Close">&times;</button></div><div class="detail-section"><div class="detail-grid"><div class="detail-item"><small>Patient ID</small><strong>${patient.id}</strong></div><div class="detail-item"><small>Status</small><strong><span class="status-pill">${patient.status}</span></strong></div><div class="detail-item"><small>Clinic</small><strong>${patient.clinic}</strong></div><div class="detail-item"><small>Primary doctor</small><strong>${patient.doctor}</strong></div><div class="detail-item"><small>Total visits</small><strong>${patient.visits}</strong></div><div class="detail-item"><small>Last visit</small><strong>${patient.lastVisit}</strong></div><div class="detail-item"><small>Contact</small><strong>${patient.phone || 'Not provided'}</strong></div><div class="detail-item"><small>Address</small><strong>${patient.address || 'Not provided'}</strong></div><div class="detail-item"><small>Blood group</small><strong>${patient.bloodGroup || 'Not recorded'}</strong></div></div></div><div class="detail-section"><h3><i class="fa-solid fa-notes-medical"></i> Patient record</h3><p class="clinic-form-help">Visit history, prescriptions, diagnoses, and follow-ups are linked to this patient record.</p></div><div class="modal-footer"><button class="btn-secondary" data-action="close-details">Close</button></div></div>`;
  modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
}
function doctorEntry(index) {
  return `<div class="doctor-entry"><div class="doctor-entry-header"><strong>Doctor ${index}</strong><button type="button" class="remove-doctor">Remove</button></div><div class="clinic-form-grid"><div class="form-group"><label class="form-label">Full name <span class="req">*</span></label><input class="form-input doctor-name" required placeholder="Dr. Full Name"></div><div class="form-group"><label class="form-label">Specialization <span class="req">*</span></label><input class="form-input doctor-specialty" required placeholder="e.g. Cardiology"></div><div class="form-group"><label class="form-label">Registration number <span class="req">*</span></label><input class="form-input doctor-reg" required></div><div class="form-group"><label class="form-label">Doctor email <span class="req">*</span></label><input class="form-input doctor-email" type="email" required placeholder="doctor@example.com"></div><div class="form-group"><label class="form-label">Initial login password <span class="req">*</span></label><input class="form-input doctor-password" type="password" minlength="8" required placeholder="At least 8 characters"></div><div class="form-group"><label class="form-label">Medical certificate <span class="req">*</span></label><input class="file-input doctor-certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required><small class="clinic-form-help">PDF, JPG or PNG</small></div></div></div>`;
}
function openClinicModal() {
  const modal = document.getElementById('clinicModal');
  modal.innerHTML = `<div class="clinic-modal-card"><div class="modal-header"><h2 class="modal-title">Register a clinic</h2><button class="modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button></div><form id="clinicForm"><div class="modal-body">
    <div class="clinic-form-section"><h3><i class="fa-solid fa-hospital"></i> Clinic identity and contact</h3><div class="clinic-form-grid"><div class="form-group"><label class="form-label">Legal clinic name <span class="req">*</span></label><input class="form-input" name="name" required placeholder="Registered clinic name"></div><div class="form-group"><label class="form-label">Clinic registration number <span class="req">*</span></label><input class="form-input" name="registration" required></div><div class="form-group"><label class="form-label">Phone number <span class="req">*</span></label><input class="form-input" name="phone" required type="tel"></div><div class="form-group"><label class="form-label">Email address <span class="req">*</span></label><input class="form-input" name="email" required type="email"></div><div class="form-group full-width"><label class="form-label">Complete address <span class="req">*</span></label><textarea class="form-textarea" name="address" required rows="2" placeholder="Building, street, area, city, state and PIN code"></textarea></div><div class="form-group"><label class="form-label">Operating days <span class="req">*</span></label><input class="form-input" name="days" required placeholder="Monday - Saturday"></div><div class="form-group"><label class="form-label">Working hours <span class="req">*</span></label><input class="form-input" name="hours" required placeholder="09:00 - 20:00"></div></div></div>
    <div class="clinic-form-section"><h3><i class="fa-solid fa-stethoscope"></i> Services and specialties</h3><div class="clinic-form-grid"><div class="form-group full-width"><label class="form-label">Specialties provided <span class="req">*</span></label><input class="form-input" name="specialties" required placeholder="e.g. General Medicine, Cardiology, Pediatrics"><small class="clinic-form-help">Separate specialties with commas.</small></div><div class="form-group"><label class="form-label">Facilities</label><input class="form-input" name="facilities" placeholder="Pharmacy, lab, emergency"></div><div class="form-group"><label class="form-label">Clinic certificate <span class="req">*</span></label><input class="file-input" name="clinicCertificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required><small class="clinic-form-help">Registration/accreditation proof</small></div></div></div>
    <div class="clinic-form-section"><div class="doctor-entry-header"><h3><i class="fa-solid fa-user-doctor"></i> Doctors and credentials</h3><button type="button" class="btn-secondary" id="addDoctor"><i class="fa-solid fa-plus"></i> Add doctor</button></div><div id="doctorEntries">${doctorEntry(1)}</div></div>
    </div><div class="modal-footer"><button type="button" class="btn-secondary" data-action="close-modal">Cancel</button><button class="btn-primary" type="submit"><i class="fa-solid fa-shield-check"></i> Submit for verification</button></div></form></div>`;
  modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
  const entries = document.getElementById('doctorEntries');
  document.getElementById('addDoctor').addEventListener('click', () => { entries.insertAdjacentHTML('beforeend', doctorEntry(entries.children.length + 1)); });
  entries.addEventListener('click', event => { if (event.target.closest('.remove-doctor') && entries.children.length > 1) event.target.closest('.doctor-entry').remove(); });
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
    const newDoctors = [...entries.querySelectorAll('.doctor-entry')].map(entry => ({ name: entry.querySelector('.doctor-name').value.trim(), specialty: entry.querySelector('.doctor-specialty').value.trim(), registration: entry.querySelector('.doctor-reg').value.trim(), email: entry.querySelector('.doctor-email').value.trim(), password: entry.querySelector('.doctor-password').value, certificate: entry.querySelector('.doctor-certificate').files[0]?.name || '', status: 'Active', patients: 0, visits: 0 }));
    if (newDoctors.some(doctor => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(doctor.email) || doctor.password.length < 8 || !doctor.certificate)) { showToast('Check every doctor email, password, and certificate.'); return; }
    if (newDoctors.some(doctor => clinicDoctors.some(existing => existing.email === doctor.email))) { showToast('Each doctor email must be unique.'); return; }
    const doctorCount = entries.children.length;
    newDoctors.forEach(doctor => { doctor.clinic = clinicName; clinicDoctors.unshift(doctor); });
    clinics.unshift({ id: `CLN-${String(clinics.length + 1).padStart(3, '0')}`, name: clinicName, city: address.split(',').pop().trim() || 'Not specified', doctors: doctorCount, patients: 0, visits: 0, status: 'Active', updated: 'Just now', specialties: data.get('specialties'), facilities: data.get('facilities'), phone, email, registration, address, days: data.get('days'), hours: data.get('hours'), verifiedDocuments: doctorCount + 1 });
    saveClinics(); saveDoctors(); closeModal(); showToast('Clinic and doctor accounts submitted for verification'); renderClinics();
  });
}
function closeModal() { const modal = document.getElementById('clinicModal'); modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); }
function showToast(message) { const toast = document.createElement('div'); toast.className = 'toast success'; toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`; document.getElementById('toastContainer').appendChild(toast); setTimeout(() => toast.remove(), 2800); }
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
function navigate(view = location.hash.slice(1) || 'overview') { document.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === view)); document.querySelectorAll('.admin-subnav-link').forEach(item => item.classList.toggle('active', item.dataset.view === view)); if (view === 'overview') renderOverview(); else if (view === 'clinics') renderClinics(); else if (view.startsWith('analysis-')) renderAnalysis(view.replace('analysis-', '')); else renderOverview(); }
document.addEventListener('click', event => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) { event.preventDefault(); location.hash = viewLink.dataset.view; navigate(viewLink.dataset.view); }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'add-clinic') openClinicModal();
  if (action === 'close-modal') closeModal();
  if (action === 'close-details') closeDetails();
  if (action === 'toast') showToast('Staff invitations will be available soon.');
  if (action === 'export') exportVisibleTable();
  if (action === 'toggle-clinic') { const clinic = clinics.find(item => item.id === event.target.closest('[data-clinic]')?.dataset.clinic); if (clinic) { clinic.status = clinic.status === 'Suspended' ? 'Active' : 'Suspended'; saveClinics(); closeDetails(); showToast(`Clinic membership ${clinic.status === 'Suspended' ? 'suspended' : 'restored'}.`); renderClinics(); } }
  if (action === 'toggle-doctor') { const name = event.target.closest('[data-doctor]')?.dataset.doctor; const doctor = clinicDoctors.find(item => item.name === name); if (doctor) { doctor.status = doctor.status === 'Suspended' ? 'Active' : 'Suspended'; saveDoctors(); closeDetails(); showToast(`Doctor account ${doctor.status === 'Suspended' ? 'suspended' : 'restored'}.`); renderClinics(); } }
  if (action === 'account-info') showToast('Administrator account Â· Full system access');
  if (action === 'logout') { sessionStorage.clear(); window.location.href = '../login.html'; }
  if (!event.target.closest('.admin-account')) closeAccountMenu();
});
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
document.getElementById('menuToggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('is-collapsed'));
document.addEventListener('click', event => { const clinicRow = event.target.closest('[data-clinic-id]'); if (clinicRow && !event.target.closest('button')) openClinicDetails(clinicRow.dataset.clinicId); const doctorRow = event.target.closest('[data-doctor-name]'); if (doctorRow && !event.target.closest('button')) openDoctorDetails(doctorRow.dataset.doctorName); const patientRow = event.target.closest('[data-patient-id]'); if (patientRow && !event.target.closest('button')) openPatientDetails(patientRow.dataset.patientId); });
document.addEventListener('keydown', event => {
  if (event.key === 'F1') { event.preventDefault(); location.hash = 'overview'; navigate('overview'); }
  if (event.key === 'F2') { event.preventDefault(); location.hash = 'clinics'; navigate('clinics'); }
  if (event.key === 'F3') { event.preventDefault(); location.hash = 'analysis-clinic'; navigate('analysis-clinic'); }
  if (event.key === 'Escape') { closeModal(); closeAccountMenu(); }
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
