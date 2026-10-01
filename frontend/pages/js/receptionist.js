/* ==========================================================================
   Dhyey Clinic - Receptionist & Patient Consultation Queue Management Logic
   ========================================================================== */

// LocalStorage Keys for persistent cross-tab synchronization
const STORAGE_KEYS = {
  FAMILIES: 'clinic_families_data',
  PATIENTS: 'clinic_patients_data',
  QUEUE: 'clinic_consultation_queue',
  ACTIVE_PATIENT: 'clinic_active_patient',
  TOKEN_COUNTER: 'clinic_token_counter'
};

// Default Seed Data
const DEFAULT_FAMILIES = [
  { id: 'FAM-0001', headName: 'PATEL RAMESHBHAI GOVINDBHAI', area: 'VASTRAPUR', phone: '9876543210', address: 'B-204, Shivalik Residency, Vastrapur', membersCount: 2, createdAt: '2026-09-28' },
  { id: 'FAM-0002', headName: 'SHARMA AMITBHAI DINESHBHAI', area: 'NAVRANGPURA', phone: '9823456789', address: '12, Shanti Niketan, Navrangpura', membersCount: 3, createdAt: '2026-09-29' },
  { id: 'FAM-0003', headName: 'SHAH RAHULBHAI RAJENDRABHAI', area: 'SATELLITE', phone: '9712345678', address: '401, Galaxy Tower, Satellite Road', membersCount: 2, createdAt: '2026-09-30' },
  { id: 'FAM-0004', headName: 'DESAI SUNITABEN MAHESHBHAI', area: 'BOPAL', phone: '9988776655', address: 'Plot 45, Applewoods, South Bopal', membersCount: 1, createdAt: '2026-10-01' },
  { id: 'FAM-0005', headName: 'MEHTA VIKRAMBHAI SANJAYBHAI', area: 'THALTEJ', phone: '9654321098', address: '502, Orchid Harmony, Thaltej', membersCount: 2, createdAt: '2026-10-01' }
];

const DEFAULT_PATIENTS = [
  { id: 'PAT-0101', name: 'MEHTA SANJAYBHAI NATVERLAL', familyId: 'FAM-0005', familyHead: 'MEHTA VIKRAMBHAI SANJAYBHAI', area: 'THALTEJ', relation: 'Father', age: 62, gender: 'Male', bloodGroup: 'A+', phone: '9654321098', address: '502, Orchid Harmony, Thaltej' },
  { id: 'PAT-0102', name: 'MEHTA VIKRAMBHAI SANJAYBHAI', familyId: 'FAM-0005', familyHead: 'MEHTA VIKRAMBHAI SANJAYBHAI', area: 'THALTEJ', relation: 'Self', age: 36, gender: 'Male', bloodGroup: 'B+', phone: '9654321098', address: '502, Orchid Harmony, Thaltej' },
  { id: 'PAT-0103', name: 'PATEL RAMESHBHAI GOVINDBHAI', familyId: 'FAM-0001', familyHead: 'PATEL RAMESHBHAI GOVINDBHAI', area: 'VASTRAPUR', relation: 'Self', age: 48, gender: 'Male', bloodGroup: 'O+', phone: '9876543210', address: 'B-204, Shivalik Residency, Vastrapur' },
  { id: 'PAT-0104', name: 'PATEL MANJULABEN RAMESHBHAI', familyId: 'FAM-0001', familyHead: 'PATEL RAMESHBHAI GOVINDBHAI', area: 'VASTRAPUR', relation: 'Spouse', age: 45, gender: 'Female', bloodGroup: 'A+', phone: '9876543210', address: 'B-204, Shivalik Residency, Vastrapur' },
  { id: 'PAT-0105', name: 'SHARMA AMITBHAI DINESHBHAI', familyId: 'FAM-0002', familyHead: 'SHARMA AMITBHAI DINESHBHAI', area: 'NAVRANGPURA', relation: 'Self', age: 40, gender: 'Male', bloodGroup: 'B+', phone: '9823456789', address: '12, Shanti Niketan, Navrangpura' },
  { id: 'PAT-0106', name: 'DESAI SUNITABEN MAHESHBHAI', familyId: 'FAM-0004', familyHead: 'DESAI SUNITABEN MAHESHBHAI', area: 'BOPAL', relation: 'Self', age: 52, gender: 'Female', bloodGroup: 'AB+', phone: '9988776655', address: 'Plot 45, Applewoods, South Bopal' }
];

const DEFAULT_QUEUE = [
  {
    token: 'T-01',
    patientId: 'PAT-0101',
    name: 'MEHTA SANJAYBHAI NATVERLAL',
    familyId: 'FAM-0005',
    familyHead: 'MEHTA VIKRAMBHAI SANJAYBHAI',
    age: 62,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '9654321098',
    area: 'THALTEJ',
    arrivedAt: '10:05 AM',
    doctor: 'Dr. Shah (General Medicine)',
    vitals: { bp: '130/85', pulse: '72 bpm', temp: '98.6 °F', spo2: '99%', weight: '68 kg' },
    complaint: 'Intermittent headache, fatigue, and mild body aches for 2 days.',
    status: 'In Consultation',
    priority: 'Normal'
  },
  {
    token: 'T-02',
    patientId: 'PAT-0103',
    name: 'PATEL RAMESHBHAI GOVINDBHAI',
    familyId: 'FAM-0001',
    familyHead: 'PATEL RAMESHBHAI GOVINDBHAI',
    age: 48,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '9876543210',
    area: 'VASTRAPUR',
    arrivedAt: '10:20 AM',
    doctor: 'Dr. Shah (General Medicine)',
    vitals: { bp: '120/80', pulse: '76 bpm', temp: '98.4 °F', spo2: '98%', weight: '74 kg' },
    complaint: 'Routine follow-up & Blood Pressure checkup.',
    status: 'Waiting',
    priority: 'Normal'
  }
];

// In-memory data wrappers with localStorage synchronization
function getFamilies() {
  const data = localStorage.getItem(STORAGE_KEYS.FAMILIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(DEFAULT_FAMILIES));
    return DEFAULT_FAMILIES;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_FAMILIES; }
}

function saveFamilies(families) {
  localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
  broadcastChange('families');
}

function getPatients() {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(DEFAULT_PATIENTS));
    return DEFAULT_PATIENTS;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_PATIENTS; }
}

function savePatients(patients) {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  broadcastChange('patients');
}

function getQueue() {
  const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(DEFAULT_QUEUE));
    return DEFAULT_QUEUE;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_QUEUE; }
}

function saveQueue(queue) {
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  broadcastChange('queue');
}

function getActivePatient() {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  const queue = getQueue();
  return queue.length > 0 ? queue[0] : null;
}

function setActivePatient(patient) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, JSON.stringify(patient));
  broadcastChange('activePatient');
}

function getNextToken() {
  let count = parseInt(localStorage.getItem(STORAGE_KEYS.TOKEN_COUNTER) || '2', 10) + 1;
  localStorage.setItem(STORAGE_KEYS.TOKEN_COUNTER, String(count));
  return `T-${String(count).padStart(2, '0')}`;
}

// Broadcast updates for multi-tab sync
function broadcastChange(type) {
  window.dispatchEvent(new CustomEvent('clinic-data-sync', { detail: { type } }));
}

// Global active view state
let currentActiveView = 'regView'; // 'regView', 'patientsView', 'queueView'
let selectedFamilyForMember = null;
let selectedPatientForArrival = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  setupKeyboardShortcuts();
  setupLiveClock();
  setupEventListeners();

  renderAllViews();
});

function initStorage() {
  getFamilies();
  getPatients();
  getQueue();
}

function setupLiveClock() {
  const updateClock = () => {
    const el = document.getElementById('tickerClock');
    const dateEl = document.getElementById('headerDateText');
    const now = new Date();
    if (el) el.textContent = now.toLocaleTimeString();
    if (dateEl) dateEl.textContent = `Clinic OPD · ${now.toLocaleDateString('en-GB')}`;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

function setupEventListeners() {
  window.addEventListener('storage', (e) => {
    if (Object.values(STORAGE_KEYS).includes(e.key)) {
      renderAllViews();
    }
  });

  window.addEventListener('clinic-data-sync', () => {
    renderAllViews();
  });
}

// Master Render Function
function renderAllViews() {
  renderFamilyList();
  renderPatientDirectory();
  renderConsultationQueue();
  renderQueueBadge();
}

// ==========================================
// VIEW SWITCHING
// ==========================================
function switchView(viewName) {
  currentActiveView = viewName;
  const views = ['regView', 'patientsView', 'queueView'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = (v === viewName) ? 'block' : 'none';
  });

  // Highlight active sidebar item & pill tab
  document.querySelectorAll('.sidebar .nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-pills-bar .btn-pill').forEach(el => el.classList.remove('active'));

  const navMap = {
    'regView': 'nav-f1',
    'patientsView': 'nav-f2',
    'queueView': 'nav-f3'
  };

  if (navMap[viewName]) {
    document.getElementById(navMap[viewName])?.classList.add('active');
  }

  const pillMap = {
    'regView': 'pill-reg',
    'patientsView': 'pill-patients',
    'queueView': 'pill-queue'
  };
  if (pillMap[viewName]) {
    document.getElementById(pillMap[viewName])?.classList.add('active');
  }

  if (viewName === 'queueView') renderConsultationQueue();
  if (viewName === 'patientsView') renderPatientDirectory();
}

// ==========================================
// 1. FAMILY & PATIENT REGISTRATION (F1)
// ==========================================
function handleGenerateFamilyId(event) {
  event.preventDefault();

  const nameInput = document.getElementById('familyHeadName');
  const areaInput = document.getElementById('familyArea');
  const phoneInput = document.getElementById('familyPhone');
  const addressInput = document.getElementById('familyAddress');
  const ageInput = document.getElementById('familyHeadAge');
  const genderInput = document.getElementById('familyHeadGender');
  const bloodInput = document.getElementById('familyHeadBlood');

  const name = nameInput.value.trim().toUpperCase();
  const area = (areaInput?.value.trim() || 'AHMEDABAD').toUpperCase();
  const phone = phoneInput?.value.trim() || '9876543210';
  const address = addressInput?.value.trim() || `${area}, Ahmedabad`;
  const age = parseInt(ageInput?.value || '45', 10);
  const gender = genderInput?.value || 'Male';
  const blood = bloodInput?.value || 'B+';

  if (!name) {
    showToast('Please enter Family Head Name', 'error');
    nameInput.focus();
    return;
  }

  const families = getFamilies();
  const patients = getPatients();

  const newFamId = `FAM-${String(families.length + 1).padStart(4, '0')}`;
  const newPatId = `PAT-${String(patients.length + 101).padStart(4, '0')}`;

  const newFamily = {
    id: newFamId,
    headName: name,
    area: area,
    phone: phone,
    address: address,
    membersCount: 1,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const newPatient = {
    id: newPatId,
    name: name,
    familyId: newFamId,
    familyHead: name,
    area: area,
    relation: 'Self (Head)',
    age: age,
    gender: gender,
    bloodGroup: blood,
    phone: phone,
    address: address
  };

  families.unshift(newFamily);
  patients.unshift(newPatient);

  saveFamilies(families);
  savePatients(patients);

  showToast(`Family ID ${newFamId} created & Head ${name} registered!`, 'success');

  // Reset form
  document.getElementById('familyRegistrationForm').reset();

  renderAllViews();

  // Prompt next action: Quick Add Member or Send to Doctor
  openFamilyActionPrompt(newFamily, newPatient);
}

function openFamilyActionPrompt(family, patient) {
  const modal = document.getElementById('postRegActionModal');
  if (!modal) return;

  document.getElementById('postRegFamName').textContent = `${family.headName} (${family.id})`;
  document.getElementById('postRegPatientName').textContent = `${patient.name} (${patient.id})`;

  document.getElementById('btnPromptAddMember').onclick = () => {
    closeModal('postRegActionModal');
    openAddMemberModal(family.id);
  };

  document.getElementById('btnPromptSendDoctor').onclick = () => {
    closeModal('postRegActionModal');
    openSendToDoctorModal(patient.id);
  };

  modal.classList.add('active');
}

function renderFamilyList(searchTerm = '') {
  const container = document.getElementById('familyListContainer');
  if (!container) return;

  const families = getFamilies();
  const patients = getPatients();

  const filtered = families.filter(f =>
    f.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.phone.includes(searchTerm)
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 32px 16px; color: var(--text-muted);">
        <i class="fa-solid fa-people-roof" style="font-size:32px; margin-bottom:8px; opacity:0.4;"></i>
        <p>No family records found matching "${searchTerm}".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(fam => {
    const famMembers = patients.filter(p => p.familyId === fam.id);
    return `
      <div class="family-item-card" onclick="viewFamilyMembers('${fam.id}')">
        <div class="family-item-info">
          <div style="display:flex; align-items:center; gap:8px;">
            <h5 style="margin:0; font-weight:800; font-size:14px;">${fam.headName}</h5>
            <span class="family-id-tag">${fam.id}</span>
          </div>
          <p style="margin:4px 0 0; font-size:12px; color:var(--text-muted);">
            <i class="fa-solid fa-location-dot" style="color:var(--primary-teal);"></i> ${fam.area} · 
            <i class="fa-solid fa-phone" style="color:var(--primary-teal);"></i> ${fam.phone} · 
            <span style="font-weight:700; color:var(--primary-teal);"><i class="fa-solid fa-users"></i> ${famMembers.length} member(s)</span>
          </p>
        </div>
        <div class="family-item-actions">
          <button class="btn-secondary" style="padding:6px 10px; font-size:11px;" onclick="event.stopPropagation(); openAddMemberModal('${fam.id}')" title="Add Family Member">
            <i class="fa-solid fa-user-plus"></i> + Member
          </button>
          <button class="btn-icon-danger" onclick="event.stopPropagation(); deleteFamily('${fam.id}')" title="Delete Family">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteFamily(famId) {
  if (confirm(`Are you sure you want to delete family record ${famId} and associated members?`)) {
    let families = getFamilies().filter(f => f.id !== famId);
    let patients = getPatients().filter(p => p.familyId !== famId);
    saveFamilies(families);
    savePatients(patients);
    showToast(`Deleted family ${famId}`, 'success');
    renderAllViews();
  }
}

// ==========================================
// 2. ADD FAMILY MEMBER MODAL (F2)
// ==========================================
function openAddMemberModal(familyId = null) {
  const modal = document.getElementById('addMemberModal');
  if (!modal) return;

  const families = getFamilies();
  if (families.length === 0) {
    showToast('Please register at least one family first!', 'error');
    return;
  }

  const select = document.getElementById('memberFamilySelect');
  select.innerHTML = families.map(f => `
    <option value="${f.id}" ${familyId === f.id ? 'selected' : ''}>
      ${f.id} - ${f.headName} (${f.area})
    </option>
  `).join('');

  selectedFamilyForMember = familyId || families[0].id;
  document.getElementById('addMemberForm').reset();
  modal.classList.add('active');
  document.getElementById('memberName').focus();
}

function handleAddMemberSubmit(event) {
  event.preventDefault();

  const familyId = document.getElementById('memberFamilySelect').value;
  const name = document.getElementById('memberName').value.trim().toUpperCase();
  const relation = document.getElementById('memberRelation').value;
  const age = parseInt(document.getElementById('memberAge').value || '30', 10);
  const gender = document.getElementById('memberGender').value;
  const blood = document.getElementById('memberBlood').value;
  const phone = document.getElementById('memberPhone').value.trim();

  if (!name) {
    showToast('Please enter Member Name', 'error');
    return;
  }

  const families = getFamilies();
  const patients = getPatients();
  const targetFam = families.find(f => f.id === familyId);

  const newPatId = `PAT-${String(patients.length + 101).padStart(4, '0')}`;

  const newMember = {
    id: newPatId,
    name: name,
    familyId: familyId,
    familyHead: targetFam ? targetFam.headName : 'FAMILY HEAD',
    area: targetFam ? targetFam.area : 'AHMEDABAD',
    relation: relation,
    age: age,
    gender: gender,
    bloodGroup: blood,
    phone: phone || (targetFam ? targetFam.phone : ''),
    address: targetFam ? targetFam.address : ''
  };

  if (targetFam) {
    targetFam.membersCount = (targetFam.membersCount || 1) + 1;
    saveFamilies(families);
  }

  patients.unshift(newMember);
  savePatients(patients);

  closeModal('addMemberModal');
  showToast(`Member ${name} added under ${familyId}!`, 'success');
  renderAllViews();

  if (confirm(`Do you want to send ${name} to the Doctor's Consultation Queue now?`)) {
    openSendToDoctorModal(newPatId);
  }
}

// ==========================================
// 3. PATIENT DIRECTORY & ARRIVAL (F2)
// ==========================================
function renderPatientDirectory(searchTerm = '') {
  const container = document.getElementById('patientDirectoryList');
  if (!container) return;

  const patients = getPatients();
  const queue = getQueue();

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.familyHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.familyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 32px 16px; color: var(--text-muted);">
        <i class="fa-solid fa-user-xmark" style="font-size:32px; margin-bottom:8px; opacity:0.4;"></i>
        <p>No patients found matching "${searchTerm}".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pat => {
    const inQueue = queue.find(q => q.patientId === pat.id);
    return `
      <div class="patient-directory-card">
        <div class="patient-card-left">
          <div class="patient-avatar-circle">
            <i class="fa-solid ${pat.gender === 'Female' ? 'fa-user-nurse' : 'fa-user'}"></i>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h4 style="margin:0; font-size:15px; font-weight:800; color:var(--text-main);">${pat.name}</h4>
              <span class="badge-key" style="background:#f1f5f9; color:#334155;">${pat.id}</span>
              ${inQueue ? `<span class="badge-key" style="background:#0284c7; color:#fff;"><i class="fa-solid fa-clock"></i> In Queue (${inQueue.token})</span>` : ''}
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
              <span><strong>Family:</strong> ${pat.familyHead} (${pat.familyId})</span> · 
              <span><strong>Relation:</strong> ${pat.relation}</span> · 
              <span><strong>Age/Sex:</strong> ${pat.age} Y / ${pat.gender}</span> · 
              <span style="color:#095c54; font-weight:700;">Blood: ${pat.bloodGroup}</span>
            </div>
            <div style="font-size:11.5px; color:var(--text-light); margin-top:2px;">
              <i class="fa-solid fa-phone"></i> ${pat.phone || 'N/A'} · <i class="fa-solid fa-location-dot"></i> ${pat.area}
            </div>
          </div>
        </div>

        <div class="patient-card-right">
          ${inQueue ? `
            <button class="btn-secondary" style="padding:8px 14px; font-size:12px; border-color:#0284c7; color:#0284c7;" onclick="switchView('queueView')">
              <i class="fa-solid fa-stethoscope"></i> View in Queue (${inQueue.token})
            </button>
          ` : `
            <button class="btn-primary" style="padding:8px 16px; font-size:12px;" onclick="openSendToDoctorModal('${pat.id}')">
              <i class="fa-solid fa-hospital-user"></i> Patient Arrived · Send to Doctor
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 4. PATIENT ARRIVAL & SEND TO DOCTOR QUEUE
// ==========================================
function openSendToDoctorModal(patientId) {
  const modal = document.getElementById('sendToDoctorModal');
  if (!modal) return;

  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  if (!patient) {
    showToast('Patient record not found', 'error');
    return;
  }

  selectedPatientForArrival = patient;

  document.getElementById('modalArrivePatientName').textContent = patient.name;
  document.getElementById('modalArrivePatientInfo').textContent = `${patient.id} · Age: ${patient.age} (${patient.gender}) · Family: ${patient.familyHead} · Area: ${patient.area}`;
  
  const nextToken = `T-${String((getQueue().length + 1)).padStart(2, '0')}`;
  document.getElementById('arriveTokenPreview').textContent = nextToken;

  document.getElementById('arriveBP').value = '120/80';
  document.getElementById('arrivePulse').value = '72';
  document.getElementById('arriveTemp').value = '98.6';
  document.getElementById('arriveWeight').value = '65';
  document.getElementById('arriveComplaints').value = 'General checkup / Consultation';
  document.getElementById('arrivePriority').value = 'Normal';

  modal.classList.add('active');
}

function handleSendToDoctorSubmit(event) {
  event.preventDefault();

  if (!selectedPatientForArrival) return;

  const doctor = document.getElementById('arriveDoctorSelect').value;
  const bp = document.getElementById('arriveBP').value.trim() || '120/80';
  const pulse = document.getElementById('arrivePulse').value.trim() || '72';
  const temp = document.getElementById('arriveTemp').value.trim() || '98.6';
  const weight = document.getElementById('arriveWeight').value.trim() || '65';
  const complaints = document.getElementById('arriveComplaints').value.trim() || 'General Checkup';
  const priority = document.getElementById('arrivePriority').value || 'Normal';

  const queue = getQueue();
  const token = getNextToken();

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const queueEntry = {
    token: token,
    patientId: selectedPatientForArrival.id,
    name: selectedPatientForArrival.name,
    familyId: selectedPatientForArrival.familyId,
    familyHead: selectedPatientForArrival.familyHead,
    age: selectedPatientForArrival.age,
    gender: selectedPatientForArrival.gender,
    bloodGroup: selectedPatientForArrival.bloodGroup,
    phone: selectedPatientForArrival.phone,
    area: selectedPatientForArrival.area,
    arrivedAt: timeStr,
    doctor: doctor,
    vitals: {
      bp: bp,
      pulse: `${pulse} bpm`,
      temp: `${temp} °F`,
      spo2: '99%',
      weight: `${weight} kg`
    },
    complaint: complaints,
    status: queue.length === 0 ? 'In Consultation' : 'Waiting',
    priority: priority
  };

  if (queue.length === 0) {
    setActivePatient(queueEntry);
  }

  queue.push(queueEntry);
  saveQueue(queue);

  closeModal('sendToDoctorModal');
  showToast(`Patient ${selectedPatientForArrival.name} is checked-in! Token ${token} sent to Doctor.`, 'success');

  renderAllViews();
  switchView('queueView');
}

// ==========================================
// 5. LIVE CONSULTATION QUEUE VIEW (F3)
// ==========================================
function renderConsultationQueue() {
  const container = document.getElementById('liveQueueContainer');
  if (!container) return;

  const queue = getQueue();

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="padding:48px 24px; text-align:center;">
        <div class="empty-state-icon" style="font-size:42px; color:var(--text-light); margin-bottom:12px;">
          <i class="fa-solid fa-clipboard-check"></i>
        </div>
        <h3 style="color:var(--text-main); font-size:18px; font-weight:800; margin:0;">OPD Queue is Empty</h3>
        <p style="color:var(--text-muted); font-size:13px; margin:6px 0 18px;">No patients currently waiting for doctor consultation.</p>
        <button class="btn-primary" onclick="switchView('patientsView')">
          <i class="fa-solid fa-user-plus"></i> Check In Arrived Patient
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = queue.map((q) => {
    const isConsulting = q.status === 'In Consultation';
    return `
      <div class="queue-item-card ${isConsulting ? 'active-consulting' : ''}">
        <div class="queue-token-badge ${isConsulting ? 'token-active' : ''}">
          <span style="font-size:10px; font-weight:700; text-transform:uppercase;">TOKEN</span>
          <strong style="font-size:20px; font-weight:900;">${q.token}</strong>
          <span style="font-size:10px; margin-top:2px;">${q.arrivedAt}</span>
        </div>

        <div class="queue-details-wrap">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h4 style="margin:0; font-size:16px; font-weight:800; color:var(--text-main);">${q.name}</h4>
                <span class="badge-key" style="${isConsulting ? 'background:#dcfce7; color:#15803d;' : 'background:#e0f2fe; color:#0369a1;'}">
                  <i class="fa-solid ${isConsulting ? 'fa-stethoscope' : 'fa-hourglass-half'}"></i> ${q.status}
                </span>
                ${q.priority === 'Urgent' ? '<span class="badge-key" style="background:#fee2e2; color:#b91c1c;">URGENT</span>' : ''}
              </div>
              <p style="margin:4px 0 0; font-size:12.5px; color:var(--text-muted);">
                Age: <strong>${q.age} Y (${q.gender})</strong> · Blood: <strong>${q.bloodGroup}</strong> · Family: <strong>${q.familyHead}</strong> (${q.area})
              </p>
            </div>

            <div style="text-align:right; font-size:12px;">
              <div style="color:var(--primary-teal); font-weight:700;"><i class="fa-solid fa-user-doctor"></i> ${q.doctor}</div>
              <div style="color:var(--text-light); font-size:11px;">OPD Room #04</div>
            </div>
          </div>

          <div class="queue-vitals-strip">
            <span class="vital-pill"><strong>BP:</strong> ${q.vitals.bp}</span>
            <span class="vital-pill"><strong>Pulse:</strong> ${q.vitals.pulse}</span>
            <span class="vital-pill"><strong>Temp:</strong> ${q.vitals.temp}</span>
            <span class="vital-pill"><strong>Weight:</strong> ${q.vitals.weight}</span>
            <span class="vital-pill" style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              <strong>Complaints:</strong> ${q.complaint}
            </span>
          </div>
        </div>

        <div class="queue-action-buttons">
          <button class="btn-primary" style="padding:6px 12px; font-size:11.5px; background:#0284c7;" onclick="openPatientInDoctorDesk('${q.token}')" title="Direct Doctor View">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open in Doctor Desk
          </button>
          <button class="btn-secondary" style="padding:6px 10px; font-size:11.5px; color:#15803d; border-color:#86efac;" onclick="markQueueCompleted('${q.token}')" title="Mark Consultation Completed">
            <i class="fa-solid fa-check"></i> Done
          </button>
          <button class="btn-icon-danger" onclick="removeFromQueue('${q.token}')" title="Remove from Queue">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openPatientInDoctorDesk(token) {
  const queue = getQueue();
  const patient = queue.find(q => q.token === token);
  if (patient) {
    queue.forEach(q => {
      q.status = (q.token === token) ? 'In Consultation' : 'Waiting';
    });
    saveQueue(queue);
    setActivePatient(patient);
    window.location.href = '../doctor/dashboard.html';
  }
}

function markQueueCompleted(token) {
  let queue = getQueue();
  queue = queue.filter(q => q.token !== token);
  saveQueue(queue);
  if (queue.length > 0) {
    queue[0].status = 'In Consultation';
    saveQueue(queue);
    setActivePatient(queue[0]);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT);
  }
  showToast(`Consultation for Token ${token} marked complete.`, 'success');
  renderAllViews();
}

function removeFromQueue(token) {
  if (confirm(`Remove token ${token} from consultation queue?`)) {
    let queue = getQueue().filter(q => q.token !== token);
    saveQueue(queue);
    showToast(`Removed token ${token} from queue`, 'success');
    renderAllViews();
  }
}

function renderQueueBadge() {
  const queue = getQueue();
  const badge = document.getElementById('queueCountBadge');
  if (badge) badge.textContent = String(queue.length);
}

// ==========================================
// 6. SEARCH & SHORTCUT HELPERS
// ==========================================
function globalSearch(query) {
  if (!query || !query.trim()) {
    renderFamilyList();
    renderPatientDirectory();
    return;
  }
  renderFamilyList(query);
  renderPatientDirectory(query);
  switchView('patientsView');
}

function viewFamilyMembers(familyId) {
  const fam = getFamilies().find(f => f.id === familyId);
  if (!fam) return;

  const input = document.getElementById('globalSearchInput');
  if (input) input.value = familyId;
  renderPatientDirectory(familyId);
  switchView('patientsView');
  showToast(`Showing members of ${fam.headName} (${familyId})`, 'success');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement?.tagName;

    if (e.key === 'F1') {
      e.preventDefault();
      switchView('regView');
      showToast('Switched to Registration (F1)');
    } else if (e.key === 'F2') {
      e.preventDefault();
      switchView('patientsView');
      showToast('Switched to Patient Directory (F2)');
    } else if (e.key === 'F3') {
      e.preventDefault();
      switchView('queueView');
      showToast('Switched to Consultation Queue (F3)');
    } else if (e.key === '/') {
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('globalSearchInput')?.focus();
      }
    } else if (e.key === 'Escape') {
      closeModal('addMemberModal');
      closeModal('sendToDoctorModal');
      closeModal('postRegActionModal');
    }
  });
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function toggleTheme() {
  const body = document.body;
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    showToast('Switched to Light Theme');
  } else {
    body.setAttribute('data-theme', 'dark');
    showToast('Switched to Dark Theme');
  }
}

// Expose functions globally to window for inline HTML handlers
window.switchView = switchView;
window.handleGenerateFamilyId = handleGenerateFamilyId;
window.renderFamilyList = renderFamilyList;
window.openAddMemberModal = openAddMemberModal;
window.handleAddMemberSubmit = handleAddMemberSubmit;
window.openSendToDoctorModal = openSendToDoctorModal;
window.handleSendToDoctorSubmit = handleSendToDoctorSubmit;
window.openPatientInDoctorDesk = openPatientInDoctorDesk;
window.markQueueCompleted = markQueueCompleted;
window.removeFromQueue = removeFromQueue;
window.globalSearch = globalSearch;
window.viewFamilyMembers = viewFamilyMembers;
window.deleteFamily = deleteFamily;
window.closeModal = closeModal;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
