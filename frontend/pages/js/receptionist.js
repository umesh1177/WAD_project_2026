/* ==========================================================================
   Dhyey Clinic - Receptionist UI Logic & Keyboard Shortcuts
   ========================================================================== */

// Initial Sample Data matching screenshots
let familyData = [
  { id: 'FAM 0001', name: 'PATEL RAMESHBHAI GOVINDBHAI', area: 'VASTRAPUR', phone: '9876543210', members: 2 },
  { id: 'FAM 0002', name: 'SHARMA AMITBHAI DINESHBHAI', area: 'NAVRANGPURA', phone: '9823456789', members: 3 },
  { id: 'FAM 0003', name: 'SHAH RAHULBHAI RAJENDRABHAI', area: 'SATELLITE', phone: '9712345678', members: 2 },
  { id: 'FAM 0004', name: 'DESAI SUNITABEN MAHESHBHAI', area: 'BOPAL', phone: '9988776655', members: 1 },
  { id: 'FAM 0005', name: 'MEHTA VIKRAMBHAI SANJAYBHAI', area: 'THALTEJ', phone: '9654321098', members: 2 }
];

let patientData = [
  { id: 'PAT 0101', name: 'MEHTA SANJAYBHAI NATVERLAL', familyHead: 'MEHTA VIKRAMBHAI SANJAYBHAI', area: 'THALTEJ', relation: 'Father', age: 62, bloodGroup: 'A+', visits: [] },
  { id: 'PAT 0102', name: 'PATEL RAMESHBHAI GOVINDBHAI', familyHead: 'PATEL RAMESHBHAI GOVINDBHAI', area: 'VASTRAPUR', relation: 'Self', age: 48, bloodGroup: 'O+', visits: [{ date: '25/09/2026', doctor: 'Dr. Shah', diagnosis: 'Mild Hypertension', fee: '₹500' }] }
];

let currentActiveView = 'regView'; // 'regView', 'recordView', 'dashboardView', 'appointmentsView', 'billingView', 'reportsView'
let selectedPatient = patientData[0]; // MEHTA SANJAYBHAI NATVERLAL

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderFamilyList();
  renderPatientRecord();
  updateLiveClock();
  setInterval(updateLiveClock, 1000);
  setupKeyboardShortcuts();
});

// Update live clock in bottom ticker bar
function updateLiveClock() {
  const clockEl = document.getElementById('tickerClock');
  if (clockEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${mins}:${secs}`;
  }
}

// Global View Switcher
function switchView(viewName) {
  currentActiveView = viewName;

  // Hide all view containers
  const views = ['regView', 'recordView', 'dashboardView', 'appointmentsView', 'billingView', 'reportsView'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = 'none';
  });

  // Show target view
  const targetEl = document.getElementById(viewName);
  if (targetEl) targetEl.style.display = 'block';

  // Update sidebar active state
  document.querySelectorAll('.sidebar .nav-item').forEach(nav => nav.classList.remove('active'));

  if (viewName === 'regView') {
    document.getElementById('nav-f1')?.classList.add('active');
  } else if (viewName === 'recordView') {
    document.getElementById('nav-f3')?.classList.add('active');
  } else if (viewName === 'dashboardView') {
    document.getElementById('nav-f4')?.classList.add('active');
  } else if (viewName === 'reportsView') {
    document.getElementById('nav-f5')?.classList.add('active');
  } else if (viewName === 'appointmentsView') {
    document.getElementById('nav-f8')?.classList.add('active');
  } else if (viewName === 'billingView') {
    document.getElementById('nav-f7')?.classList.add('active');
  }
}

// Render Registered Families list (Right card in Family Reg view)
function renderFamilyList(searchTerm = '') {
  const container = document.getElementById('familyListContainer');
  if (!container) return;

  const filtered = familyData.filter(fam => 
    fam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fam.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-muted);">No family records matching "${searchTerm}"</div>`;
    return;
  }

  container.innerHTML = filtered.map(fam => `
    <div class="family-item-card" onclick="selectFamilyForMember('${fam.id}')">
      <div class="family-item-info">
        <h5>${fam.name}</h5>
        <p>${fam.area} · ${fam.members} member(s)</p>
      </div>
      <div class="family-item-actions">
        <span class="family-id-tag">${fam.id}</span>
        <button class="btn-icon-danger" onclick="event.stopPropagation(); deleteFamily('${fam.id}')" title="Delete Family">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Handle Family Head Form Submission (Generate Family ID)
function handleGenerateFamilyId(event) {
  event.preventDefault();
  const nameInput = document.getElementById('familyHeadName');
  const areaInput = document.getElementById('familyArea');
  const phoneInput = document.getElementById('familyPhone');

  const name = nameInput.value.trim().toUpperCase();
  const area = areaInput.value.trim().toUpperCase() || 'VASTRAPUR';
  const phone = phoneInput.value.trim() || '9876543210';

  if (!name) {
    showToast('Please enter Family Head Name', 'error');
    return;
  }

  const nextNum = familyData.length + 1;
  const newId = `FAM ${String(nextNum).padStart(4, '0')}`;

  const newFamily = {
    id: newId,
    name: name,
    area: area,
    phone: phone,
    members: 1
  };

  familyData.unshift(newFamily);

  // Also add as patient
  const newPatient = {
    id: `PAT 010${patientData.length + 1}`,
    name: name,
    familyHead: name,
    area: area,
    relation: 'Head',
    age: 45,
    bloodGroup: 'B+',
    visits: []
  };
  patientData.unshift(newPatient);

  renderFamilyList();
  showToast(`Family ID generated successfully: ${newId}`, 'success');

  // Reset Form
  nameInput.value = '';
  areaInput.value = '';
  phoneInput.value = '';
}

// Delete Family
function deleteFamily(famId) {
  if (confirm(`Are you sure you want to delete family record ${famId}?`)) {
    familyData = familyData.filter(f => f.id !== famId);
    renderFamilyList();
    showToast(`Deleted family record ${famId}`, 'success');
  }
}

// Select Family for adding member (F2 Modal)
function selectFamilyForMember(famId) {
  const family = familyData.find(f => f.id === famId);
  if (!family) return;
  openAddMemberModal(family);
}

// Open Add Member Modal (F2)
function openAddMemberModal(family = familyData[0]) {
  const modal = document.getElementById('addMemberModal');
  if (!modal) return;
  
  document.getElementById('modalFamilyTitle').textContent = `Add Member to: ${family.name} (${family.id})`;
  document.getElementById('targetFamilyId').value = family.id;
  modal.classList.add('active');
}

function closeAddMemberModal() {
  const modal = document.getElementById('addMemberModal');
  if (modal) modal.classList.remove('active');
}

// Submit Add Member
function handleAddMemberSubmit(event) {
  event.preventDefault();
  const famId = document.getElementById('targetFamilyId').value;
  const name = document.getElementById('memberName').value.trim().toUpperCase();
  const relation = document.getElementById('memberRelation').value;
  const age = document.getElementById('memberAge').value;
  const gender = document.getElementById('memberGender').value;
  const blood = document.getElementById('memberBlood').value;

  if (!name) {
    showToast('Please enter Member Name', 'error');
    return;
  }

  const family = familyData.find(f => f.id === famId);
  if (family) {
    family.members += 1;
  }

  patientData.unshift({
    id: `PAT 0${patientData.length + 100}`,
    name: name,
    familyHead: family ? family.name : 'MEHTA VIKRAMBHAI SANJAYBHAI',
    area: family ? family.area : 'THALTEJ',
    relation: relation,
    age: age || 30,
    bloodGroup: blood,
    visits: []
  });

  renderFamilyList();
  closeAddMemberModal();
  showToast(`Member ${name} added to family!`, 'success');
}

// Search Patients in F3 Patient Record view
function searchPatientRecord(term) {
  if (!term.trim()) return;
  const match = patientData.find(p => 
    p.name.toLowerCase().includes(term.toLowerCase()) ||
    p.id.toLowerCase().includes(term.toLowerCase()) ||
    p.familyHead.toLowerCase().includes(term.toLowerCase())
  );

  if (match) {
    selectedPatient = match;
    renderPatientRecord();
    showToast(`Loaded Patient Record: ${match.name}`, 'success');
  } else {
    showToast(`No patient found matching "${term}"`, 'error');
  }
}

// Render Patient Record Card (Image 2)
function renderPatientRecord() {
  const container = document.getElementById('patientCardContainer');
  const visitContainer = document.getElementById('visitHistoryContainer');
  if (!container || !selectedPatient) return;

  container.innerHTML = `
    <div class="patient-record-header-card">
      <div>
        <div class="patient-header-name">${selectedPatient.name}</div>
        <div class="patient-header-details">
          Family: <strong>${selectedPatient.familyHead}</strong> (${selectedPatient.area}) · ${selectedPatient.relation} · Age ${selectedPatient.age} · ${selectedPatient.bloodGroup}
        </div>
      </div>
      <div class="patient-header-actions">
        <button class="btn-danger-outline" onclick="deleteSelectedPatient()">
          <i class="fa-regular fa-trash-can"></i> Delete Patient
        </button>
        <button class="btn-secondary" onclick="editSelectedPatient()">
          <i class="fa-regular fa-pen-to-square"></i> Edit Patient
        </button>
        <button class="btn-primary" onclick="openNewVisitModal()">
          <i class="fa-solid fa-plus"></i> + New Visit <span class="badge-key" style="margin-left:4px;">F6</span>
        </button>
      </div>
    </div>
  `;

  if (selectedPatient.visits && selectedPatient.visits.length > 0) {
    visitContainer.innerHTML = `
      <table style="width:100%; border-collapse: collapse; margin-top:12px;">
        <thead>
          <tr style="background:var(--primary-teal-light); text-align:left; font-size:12px; color:var(--primary-teal); border-bottom:2px solid var(--primary-teal-border);">
            <th style="padding:10px;">Date</th>
            <th style="padding:10px;">Doctor</th>
            <th style="padding:10px;">Diagnosis / Notes</th>
            <th style="padding:10px;">Fee Paid</th>
            <th style="padding:10px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${selectedPatient.visits.map(v => `
            <tr style="border-bottom:1px solid var(--border-color); font-size:13px;">
              <td style="padding:12px 10px; font-weight:700;">${v.date}</td>
              <td style="padding:12px 10px;">${v.doctor}</td>
              <td style="padding:12px 10px;">${v.diagnosis}</td>
              <td style="padding:12px 10px; font-weight:700; color:var(--primary-teal);">${v.fee}</td>
              <td style="padding:12px 10px;">
                <button class="btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="printVisitReceipt('${v.date}')">Print Receipt</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    visitContainer.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon"><i class="fa-solid fa-notes-medical"></i></div>
        <h4 style="color:var(--text-muted); font-weight:600;">No visits yet.</h4>
        <p style="font-size:12px; margin-top:4px;">Click "+ New Visit [F6]" above to create the first clinical entry for this patient.</p>
      </div>
    `;
  }
}

function deleteSelectedPatient() {
  if (confirm(`Delete patient record for ${selectedPatient.name}?`)) {
    patientData = patientData.filter(p => p.id !== selectedPatient.id);
    selectedPatient = patientData[0] || null;
    renderPatientRecord();
    showToast('Patient record deleted', 'success');
  }
}

function editSelectedPatient() {
  const newName = prompt('Edit Patient Name:', selectedPatient.name);
  if (newName && newName.trim()) {
    selectedPatient.name = newName.trim().toUpperCase();
    renderPatientRecord();
    showToast('Patient updated successfully', 'success');
  }
}

// New Visit Modal (F6)
function openNewVisitModal() {
  const modal = document.getElementById('newVisitModal');
  if (!modal) return;
  document.getElementById('visitPatientName').textContent = selectedPatient.name;
  modal.classList.add('active');
}

function closeNewVisitModal() {
  const modal = document.getElementById('newVisitModal');
  if (modal) modal.classList.remove('active');
}

function handleNewVisitSubmit(event) {
  event.preventDefault();
  const doctor = document.getElementById('visitDoctor').value;
  const complaint = document.getElementById('visitComplaint').value.trim();
  const fee = document.getElementById('visitFee').value || '₹500';

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

  selectedPatient.visits.unshift({
    date: dateStr,
    doctor: doctor,
    diagnosis: complaint || 'General Checkup',
    fee: fee.startsWith('₹') ? fee : `₹${fee}`
  });

  renderPatientRecord();
  closeNewVisitModal();
  showToast(`New visit logged for ${selectedPatient.name}! Token #07`, 'success');
}

function printVisitReceipt(dateStr) {
  showToast(`Printing receipt for visit on ${dateStr}...`, 'success');
}

// Keyboard Shortcuts Listener (F1, F2, F3, F4, F5, F6, F7, F8, F9, Esc, /)
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // If user is typing inside an input field, allow Esc and Enter, but don't break F keys
    const tag = document.activeElement.tagName;
    
    if (e.key === 'F1') {
      e.preventDefault();
      switchView('regView');
      showToast('Switched to Family / Patient Reg (F1)');
    } else if (e.key === 'F2') {
      e.preventDefault();
      switchView('regView');
      openAddMemberModal();
      showToast('Opened Add Member (F2)');
    } else if (e.key === 'F3') {
      e.preventDefault();
      switchView('recordView');
      showToast('Switched to Patient Record (F3)');
    } else if (e.key === 'F4') {
      e.preventDefault();
      switchView('dashboardView');
      showToast('Switched to Dashboard (F4)');
    } else if (e.key === 'F5') {
      e.preventDefault();
      switchView('reportsView');
      showToast('Switched to Reports (F5)');
    } else if (e.key === 'F6') {
      e.preventDefault();
      switchView('recordView');
      openNewVisitModal();
      showToast('Opened New Visit (F6)');
    } else if (e.key === 'F7') {
      e.preventDefault();
      switchView('billingView');
      showToast('Switched to Billing & Payments (F7)');
    } else if (e.key === 'F8') {
      e.preventDefault();
      switchView('appointmentsView');
      showToast('Switched to Appointments (F8)');
    } else if (e.key === 'F9') {
      e.preventDefault();
      const globalSearch = document.getElementById('globalSearchInput');
      if (globalSearch) globalSearch.focus();
      showToast('Global Search Focused (F9)');
    } else if (e.key === '/') {
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        const globalSearch = document.getElementById('globalSearchInput');
        if (globalSearch) globalSearch.focus();
      }
    } else if (e.key === 'Escape') {
      closeAddMemberModal();
      closeNewVisitModal();
    }
  });
}

// Toast Helper
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
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const current = body.getAttribute('data-theme');
  if (current === 'dark') {
    body.removeAttribute('data-theme');
    showToast('Switched to Light Theme');
  } else {
    body.setAttribute('data-theme', 'dark');
    showToast('Switched to Dark Theme');
  }
}
