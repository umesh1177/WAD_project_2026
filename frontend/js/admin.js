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
const content = document.getElementById('adminContent');

function money(value) { return `₹${value.toLocaleString('en-IN')}`; }
function saveClinics() { localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics)); }
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
  const rows = clinics.map(c => `<tr><td><strong>${c.name}</strong><br><small>${c.id} · ${c.city}</small></td><td>${c.doctors}</td><td>${c.patients.toLocaleString()}</td><td>${c.visits}</td><td><span class="status-pill ${c.status === 'Paused' ? 'paused' : ''}">${c.status}</span></td></tr>`).join('');
  page('Good evening, Administrator', 'Here is the latest snapshot across your clinic network.', stats(), `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic</button>`);
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `<div class="admin-grid"><section class="admin-card"><div class="admin-card-header"><div><h2>Clinic performance</h2><span>Live network summary</span></div><a class="btn-secondary" href="#clinics" data-view="clinics">View all</a></div>${table(['Clinic', 'Doctors', 'Patients', 'Visits', 'Status'], rows)}</section><section class="admin-card"><div class="admin-card-header"><div><h2>Quick analysis</h2><span>Compare operational activity</span></div></div><div class="quick-links"><a class="admin-quick-link" href="#analysis-clinic" data-view="analysis-clinic"><i class="fa-solid fa-hospital"></i><span><strong>Clinic wise</strong><small>Collections and visits by location</small></span><i class="fa-solid fa-arrow-right"></i></a><a class="admin-quick-link" href="#analysis-doctor" data-view="analysis-doctor"><i class="fa-solid fa-user-doctor"></i><span><strong>Doctor wise</strong><small>Workload and patient outcomes</small></span><i class="fa-solid fa-arrow-right"></i></a><a class="admin-quick-link" href="#analysis-patient" data-view="analysis-patient"><i class="fa-solid fa-user-injured"></i><span><strong>Patient wise</strong><small>Visit history and follow-ups</small></span><i class="fa-solid fa-arrow-right"></i></a></div></section></div>`);
}
function renderClinics() {
  page('Clinic management', 'Add, search, and monitor every location in your network.', '', `<button class="btn-primary" data-action="add-clinic"><i class="fa-solid fa-plus"></i> Add clinic</button>`);
  content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `<section class="admin-card"><div class="admin-filter-row"><div class="form-group" style="flex:1;min-width:220px;margin:0"><input class="form-input" id="clinicSearch" placeholder="Search by clinic, city, or ID"></div><select class="form-select" id="clinicStatus"><option value="">All statuses</option><option>Active</option><option>Paused</option></select></div><div id="clinicTable" style="margin-top:16px"></div></section>`);
  const update = () => { const term = document.getElementById('clinicSearch').value.toLowerCase(); const status = document.getElementById('clinicStatus').value; const filtered = clinics.filter(c => `${c.name} ${c.city} ${c.id}`.toLowerCase().includes(term) && (!status || c.status === status)); document.getElementById('clinicTable').innerHTML = table(['Clinic', 'City', 'Doctors', 'Patients', 'Status', 'Updated'], filtered.map(c => `<tr><td><strong>${c.name}</strong><br><small>${c.id}</small></td><td>${c.city}</td><td>${c.doctors}</td><td>${c.patients.toLocaleString()}</td><td><span class="status-pill ${c.status === 'Paused' ? 'paused' : ''}">${c.status}</span></td><td>${c.updated}</td></tr>`).join('')); };
  document.getElementById('clinicSearch').addEventListener('input', update); document.getElementById('clinicStatus').addEventListener('change', update); update();
}
function renderAnalysis(type) {
  const isClinic = type === 'clinic'; const isDoctor = type === 'doctor';
  const title = isClinic ? 'Clinic wise analysis' : isDoctor ? 'Doctor wise analysis' : 'Patient wise analysis';
  const subtitle = isClinic ? 'Compare patient volume, visits, and collections by location.' : isDoctor ? 'Track doctor workload and patient engagement.' : 'Find visit patterns and follow-up needs for individual patients.';
  page(title, subtitle, '', `<button class="btn-secondary" data-action="export"><i class="fa-solid fa-download"></i> Export CSV</button>`);
  const filter = `<div class="analysis-toolbar"><div class="form-group" style="flex:1;min-width:220px"><label class="form-label">Search everything</label><input class="form-input" id="analysisSearch" placeholder="Search by name, ID, doctor or clinic"></div><div class="form-group"><label class="form-label">Clinic</label><select class="form-select" id="analysisClinic"><option value="">All clinics</option>${clinicOptions()}</select></div><div class="form-group"><label class="form-label">Date range</label><select class="form-select" id="analysisRange"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">This year</option></select></div><div class="form-group"><label class="form-label">Activity</label><select class="form-select" id="analysisActivity"><option value="">Any activity</option><option value="high">High activity</option><option value="low">Needs attention</option></select></div><div class="form-group"><label class="form-label">Sort by</label><select class="form-select" id="analysisSort"><option value="default">Default</option><option value="high">Highest first</option><option value="low">Lowest first</option></select></div></div><div class="quick-filter-bar"><span class="clinic-form-help">Frequent filters:</span><button type="button" class="quick-filter active" data-quick-filter="">All records</button><button type="button" class="quick-filter" data-quick-filter="today">Updated recently</button><button type="button" class="quick-filter" data-quick-filter="high">High performers</button><button type="button" class="quick-filter" data-quick-filter="attention">Needs attention</button></div>`;
  const card = `<section class="admin-card">${filter}<div id="analysisTable" style="margin-top:18px"></div></section>`; content.querySelector('.admin-page').insertAdjacentHTML('beforeend', card);
  let quickFilter = '';
  const update = () => { const selected = document.getElementById('analysisClinic').value; const term = document.getElementById('analysisSearch').value.toLowerCase(); const activity = document.getElementById('analysisActivity').value || quickFilter; const sort = document.getElementById('analysisSort').value; let rows; if (isClinic) { let records = clinics.filter(c => (!selected || c.name === selected) && `${c.name} ${c.city} ${c.specialties || ''}`.toLowerCase().includes(term)); if (activity === 'high' || activity === 'today') records = records.filter(c => c.visits >= 200); if (activity === 'low' || activity === 'attention') records = records.filter(c => c.visits < 200); if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.visits - a.visits : a.visits - b.visits); rows = records.map(c => `<tr><td><strong>${c.name}</strong><br><small>${c.city}</small></td><td>${c.doctors}</td><td>${c.patients.toLocaleString()}</td><td>${c.visits}</td><td>${money(c.visits * 650)}</td><td><div class="metric-bar"><i style="width:${Math.min(c.visits / 5, 100)}%"></i></div></td></tr>`); } else if (isDoctor) { let records = doctors.filter(d => (!selected || d.clinic === selected) && `${d.name} ${d.specialty} ${d.clinic}`.toLowerCase().includes(term)); if (activity === 'high' || activity === 'today') records = records.filter(d => d.rating >= 90); if (activity === 'low' || activity === 'attention') records = records.filter(d => d.rating < 90); if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.rating - a.rating : a.rating - b.rating); rows = records.map(d => `<tr><td><strong>${d.name}</strong><br><small>${d.specialty}</small></td><td>${d.clinic}</td><td>${d.patients}</td><td>${d.visits}</td><td>${d.rating}%</td><td><div class="metric-bar"><i style="width:${d.rating}%"></i></div></td></tr>`); } else { let records = patients.filter(p => (!selected || p.clinic === selected) && `${p.name} ${p.id} ${p.doctor} ${p.status}`.toLowerCase().includes(term)); if (activity === 'high' || activity === 'today') records = records.filter(p => p.visits >= 5); if (activity === 'low' || activity === 'attention') records = records.filter(p => p.status === 'Follow-up'); if (sort !== 'default') records.sort((a, b) => sort === 'high' ? b.visits - a.visits : a.visits - b.visits); rows = records.map(p => `<tr><td><strong>${p.name}</strong><br><small>${p.id}</small></td><td>${p.clinic}</td><td>${p.doctor}</td><td>${p.visits}</td><td>${p.lastVisit}</td><td><span class="status-pill">${p.status}</span></td></tr>`); } const headers = isClinic ? ['Clinic', 'Doctors', 'Patients', 'Visits', 'Collection', 'Volume'] : isDoctor ? ['Doctor', 'Clinic', 'Patients', 'Visits', 'Satisfaction', 'Score'] : ['Patient', 'Clinic', 'Doctor', 'Visits', 'Last visit', 'Status']; document.getElementById('analysisTable').innerHTML = table(headers, rows.join('')); };
  ['analysisClinic', 'analysisRange', 'analysisActivity', 'analysisSort', 'analysisSearch'].forEach(id => document.getElementById(id).addEventListener(id === 'analysisSearch' ? 'input' : 'change', update));
  content.querySelectorAll('[data-quick-filter]').forEach(button => button.addEventListener('click', () => { quickFilter = button.dataset.quickFilter; content.querySelectorAll('[data-quick-filter]').forEach(item => item.classList.toggle('active', item === button)); update(); })); update();
}
function renderStaff() { page('Staff overview', 'Manage the people who keep your clinics running.', '', `<button class="btn-primary" data-action="toast"><i class="fa-solid fa-user-plus"></i> Invite staff</button>`); content.querySelector('.admin-page').insertAdjacentHTML('beforeend', `<section class="admin-card">${table(['Name', 'Specialty', 'Primary clinic', 'Patients', 'Visits', 'Status'], doctors.map(d => `<tr><td><strong>${d.name}</strong></td><td>${d.specialty}</td><td>${d.clinic}</td><td>${d.patients}</td><td>${d.visits}</td><td><span class="status-pill">Active</span></td>`).join(''))}</section>`); }
function doctorEntry(index) {
  return `<div class="doctor-entry"><div class="doctor-entry-header"><strong>Doctor ${index}</strong><button type="button" class="remove-doctor">Remove</button></div><div class="clinic-form-grid"><div class="form-group"><label class="form-label">Full name <span class="req">*</span></label><input class="form-input doctor-name" required placeholder="Dr. Full Name"></div><div class="form-group"><label class="form-label">Specialization <span class="req">*</span></label><input class="form-input doctor-specialty" required placeholder="e.g. Cardiology"></div><div class="form-group"><label class="form-label">Registration number <span class="req">*</span></label><input class="form-input doctor-reg" required></div><div class="form-group"><label class="form-label">Medical certificate <span class="req">*</span></label><input class="file-input doctor-certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" required><small class="clinic-form-help">PDF, JPG or PNG</small></div></div></div>`;
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
    const doctorCount = entries.children.length;
    clinics.unshift({ id: `CLN-${String(clinics.length + 1).padStart(3, '0')}`, name: data.get('name').trim(), city: data.get('address').split(',').pop().trim() || 'Not specified', doctors: doctorCount, patients: 0, visits: 0, status: 'Active', updated: 'Just now', specialties: data.get('specialties'), verifiedDocuments: doctorCount + 1 });
    saveClinics(); closeModal(); showToast('Clinic submitted with certificates for verification'); renderClinics();
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
function navigate(view = location.hash.slice(1) || 'overview') { document.querySelectorAll('[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === view)); document.querySelectorAll('.admin-subnav-link').forEach(item => item.classList.toggle('active', item.dataset.view === view)); if (view === 'overview') renderOverview(); else if (view === 'clinics') renderClinics(); else if (view.startsWith('analysis-')) renderAnalysis(view.replace('analysis-', '')); else renderStaff(); }
document.addEventListener('click', event => {
  const viewLink = event.target.closest('[data-view]');
  if (viewLink) { event.preventDefault(); location.hash = viewLink.dataset.view; navigate(viewLink.dataset.view); }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'add-clinic') openClinicModal();
  if (action === 'close-modal') closeModal();
  if (action === 'toast') showToast('Staff invitations will be available soon.');
  if (action === 'export') exportVisibleTable();
  if (action === 'account-info') showToast('Administrator account · Full system access');
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
document.getElementById('menuToggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('is-open'));
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
