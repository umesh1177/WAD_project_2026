/**
 * =========================================================
 * PATIENT OPD CONSULTATION QUEUE CONTROLLER (Doctor Workspace)
 * Receives pushed patient tokens from Receptionist Desk
 * Direct 1-Click Launch into New Visit Consultation
 * =========================================================
 */

import {
  apiFetch,
  todayISO,
  fmtDate,
  nowTime,
  pad,
  showToast,
  getLocalDB,
  saveLocalDB,
  getAuthSession
} from './api.js';

const QUEUE_STORAGE_KEY = 'clinic_consultation_queue';

export async function renderPatientQueueView(container, onSelectPatientForConsultation) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  // Sync patient queue from DB or localStorage
  let queue = db.patientQueue || [];
  if (!queue || queue.length === 0) {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) queue = JSON.parse(raw);
    } catch (e) {}
  }

  // Filter state
  let statusFilter = 'All'; // 'All' | 'Waiting' | 'In Consultation' | 'Completed'

  function getFilteredQueue() {
    if (statusFilter === 'All') return queue;
    return queue.filter((q) => (q.status || 'Waiting') === statusFilter);
  }

  function renderView() {
    const filtered = getFilteredQueue();
    const waitingCount = queue.filter((q) => (q.status || 'Waiting') === 'Waiting').length;
    const inConsultCount = queue.filter((q) => q.status === 'In Consultation').length;
    const completedCount = queue.filter((q) => q.status === 'Completed' || q.status === 'Done').length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 1400px; margin: 0 auto; width: 100%;">
        
        <!-- Top Queue Header & Statistics -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 20px; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-users-line" style="color: var(--primary); font-size: 20px;"></i>
              <h1 class="font-display" style="font-weight: 800; font-size: 18px; color: var(--text); margin: 0;">
                Patient OPD Consultation Queue
              </h1>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              Receptionist-dispatched patient cases. Pick any arriving patient to start new consultation entry directly.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <!-- Status Badges -->
            <button type="button" class="cms-btn cms-btn-sm queue-filter-btn ${statusFilter === 'All' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-status="All" style="font-size: 11.5px; padding: 6px 12px;">
              All (${queue.length})
            </button>
            <button type="button" class="cms-btn cms-btn-sm queue-filter-btn ${statusFilter === 'Waiting' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-status="Waiting" style="font-size: 11.5px; padding: 6px 12px; border: 1px solid #fca5a5; color: #b91c1c;">
              <i class="fa-solid fa-clock"></i> Waiting (${waitingCount})
            </button>
            <button type="button" class="cms-btn cms-btn-sm queue-filter-btn ${statusFilter === 'In Consultation' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-status="In Consultation" style="font-size: 11.5px; padding: 6px 12px; border: 1px solid #86efac; color: #166534;">
              <i class="fa-solid fa-stethoscope"></i> In Progress (${inConsultCount})
            </button>
            <button type="button" class="cms-btn cms-btn-sm queue-filter-btn ${statusFilter === 'Completed' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-status="Completed" style="font-size: 11.5px; padding: 6px 12px; border: 1px solid #bae6fd; color: #0369a1;">
              <i class="fa-solid fa-check"></i> Done (${completedCount})
            </button>

            <!-- Add Walk-in Patient to Queue Button -->
            <button type="button" id="btn-open-add-walkin-queue" class="cms-btn cms-btn-primary cms-btn-sm" style="font-size: 12px; padding: 7px 14px; margin-left: 8px;">
              <i class="fa-solid fa-plus"></i>
              <span>+ Add Walk-In Patient</span>
            </button>
          </div>
        </div>

        <!-- Queue Cards List / Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="cms-card-header" style="margin-bottom: 0; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid fa-list-ol" style="color: var(--primary); margin-right: 6px;"></i> Active Consultation Roster
            </div>
            <span class="cms-pill cms-badge-paid font-mono" style="font-size: 11px;">
              ${filtered.length} Patients in view
            </span>
          </div>

          ${
            filtered.length === 0
              ? `
            <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
              <i class="fa-solid fa-users-slash" style="font-size: 40px; margin-bottom: 12px; display: block; opacity: 0.4;"></i>
              <div style="font-size: 16px; font-weight: 800; color: var(--text);">No patients in ${statusFilter.toLowerCase()} queue</div>
              <p style="font-size: 12.5px; margin-top: 6px;">Arriving patients registered by the receptionist will appear here live in real-time.</p>
              <button type="button" id="btn-add-walkin-empty" class="cms-btn cms-btn-primary" style="margin-top: 14px; padding: 9px 20px;">
                <i class="fa-solid fa-user-plus"></i> Add Walk-In Patient to Queue
              </button>
            </div>
          `
              : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${filtered
                .map(
                  (q, idx) => `
                <div style="background: var(--surface-alt); border: 1.5px solid ${q.status === 'In Consultation' ? 'var(--primary)' : q.status === 'Completed' ? '#93c5fd' : '#fca5a5'}; border-left-width: 6px; border-radius: var(--radius-md); padding: 16px 20px; display: grid; grid-template-columns: 80px 1.8fr 1.5fr auto; gap: 16px; align-items: center; box-shadow: var(--shadow-sm); transition: transform .15s;">
                  
                  <!-- Token Badge -->
                  <div style="text-align: center;">
                    <span class="font-mono" style="font-size: 24px; font-weight: 900; color: var(--primary); display: block; line-height: 1;">
                      ${q.token || 'T-' + pad(idx + 1, 2)}
                    </span>
                    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-top: 4px; display: block;">Token</span>
                  </div>

                  <!-- Patient & Family Details -->
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <h3 style="font-size: 15px; font-weight: 800; color: var(--text); margin: 0;">
                        ${q.patientName || q.name}
                      </h3>
                      <span class="cms-pill" style="font-size: 11px; background: rgba(37,99,235,0.08); color: var(--primary); font-weight: 700;">
                        ${q.age ? q.age + ' Yrs' : 'Adult'} / ${q.gender || 'Male'}
                      </span>
                      <span class="cms-pill" style="font-size: 10.5px; font-weight: 800; background: ${q.status === 'In Consultation' ? '#dcfce7' : q.status === 'Completed' ? '#e0f2fe' : '#fee2e2'}; color: ${q.status === 'In Consultation' ? '#166534' : q.status === 'Completed' ? '#0369a1' : '#b91c1c'};">
                        ${q.status || 'Waiting'}
                      </span>
                    </div>

                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                      <span><i class="fa-solid fa-people-roof" style="color: var(--primary);"></i> Family Head: <b>${q.familyHead || 'Self'}</b></span>
                      ${q.phone ? ` &bull; <span><i class="fa-solid fa-phone"></i> ${q.phone}</span>` : ''}
                      ${q.area ? ` &bull; <span>${q.area}</span>` : ''}
                    </div>

                    ${
                      q.complaint
                        ? `
                      <div style="font-size: 12.5px; color: var(--text); margin-top: 5px; background: rgba(0,0,0,0.02); padding: 4px 8px; border-radius: 4px; border-left: 2px solid var(--primary);">
                        <b>Chief Complaint:</b> ${q.complaint}
                      </div>
                    `
                        : ''
                    }
                  </div>

                  <!-- Vitals & Arrival Time -->
                  <div style="font-size: 11.5px; color: var(--text-muted);">
                    <div><i class="fa-solid fa-clock"></i> Arrived at: <b>${q.arrivedAt || 'Recently'}</b></div>
                    ${
                      q.vitals && (q.vitals.bp || q.vitals.pulse || q.vitals.temp || q.vitals.spo2 || q.vitals.weight)
                        ? `
                      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                        ${q.vitals.bp ? `<span class="cms-pill" style="font-size: 10.5px; background: #fff; border: 1px solid var(--border); font-weight: 700;">BP: ${q.vitals.bp}</span>` : ''}
                        ${q.vitals.pulse ? `<span class="cms-pill" style="font-size: 10.5px; background: #fff; border: 1px solid var(--border); font-weight: 700;">Pulse: ${q.vitals.pulse}</span>` : ''}
                        ${q.vitals.temp ? `<span class="cms-pill" style="font-size: 10.5px; background: #fff; border: 1px solid var(--border); font-weight: 700;">Temp: ${q.vitals.temp}</span>` : ''}
                        ${q.vitals.spo2 ? `<span class="cms-pill" style="font-size: 10.5px; background: #fff; border: 1px solid var(--border); font-weight: 700;">SpO2: ${q.vitals.spo2}</span>` : ''}
                        ${q.vitals.weight ? `<span class="cms-pill" style="font-size: 10.5px; background: #fff; border: 1px solid var(--border); font-weight: 700;">Wt: ${q.vitals.weight}</span>` : ''}
                      </div>
                    `
                        : `<div style="font-style: italic; color: #94a3b8; margin-top: 4px;">No pre-consultation vitals recorded</div>`
                    }
                  </div>

                  <!-- Action Buttons -->
                  <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                    <button type="button" class="cms-btn cms-btn-primary btn-start-consultation-direct" data-token="${q.token}" data-patid="${q.patientId}" data-famid="${q.familyId}" style="padding: 8px 16px; font-size: 12.5px; font-weight: 800; white-space: nowrap;">
                      <i class="fa-solid fa-stethoscope"></i>
                      <span>Start Consultation</span>
                    </button>

                    <div style="display: flex; gap: 6px;">
                      ${
                        q.status !== 'Completed'
                          ? `
                        <button type="button" class="cms-btn cms-btn-ghost btn-mark-queue-done" data-token="${q.token}" style="font-size: 11px; padding: 4px 8px; border: 1px solid var(--border); color: #059669;" title="Mark as Completed">
                          <i class="fa-solid fa-check"></i> Done
                        </button>
                      `
                          : ''
                      }
                      <button type="button" class="cms-btn-danger btn-del-queue-item" data-token="${q.token}" style="font-size: 11px; padding: 4px 8px;" title="Remove from Queue">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>

                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>

      </div>

      <!-- Add Walk-In Modal Mount -->
      <div id="modal-add-walkin-container"></div>
    `;

    wireQueueEvents();
  }

  function wireQueueEvents() {
    // Filter Buttons
    container.querySelectorAll('.queue-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        statusFilter = btn.getAttribute('data-status');
        renderView();
      });
    });

    // Start Consultation Direct Button
    container.querySelectorAll('.btn-start-consultation-direct').forEach((btn) => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        const patId = btn.getAttribute('data-patid');
        const famId = btn.getAttribute('data-famid');

        // Mark in consultation in queue
        const item = queue.find((q) => q.token === token);
        if (item) {
          item.status = 'In Consultation';
          db.patientQueue = queue;
          saveLocalDB(db, clinicId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        }

        // Navigate doctor directly to consultation view with preselected patient!
        if (typeof onSelectPatientForConsultation === 'function') {
          onSelectPatientForConsultation({ familyId: famId, patientId: patId });
        } else {
          // Trigger navigation via global nav-case
          const caseNav = document.getElementById('nav-case');
          if (caseNav) {
            // Set global selection
            window.__SELECTED_PATIENT_FOR_VISIT = { familyId: famId, patientId: patId };
            caseNav.click();
          }
        }

        showToast(`🩺 Opened consultation for Token ${token}`);
      });
    });

    // Mark Done Button
    container.querySelectorAll('.btn-mark-queue-done').forEach((btn) => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        const item = queue.find((q) => q.token === token);
        if (item) {
          item.status = 'Completed';
          db.patientQueue = queue;
          saveLocalDB(db, clinicId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
          renderView();
          showToast(`Token ${token} marked as Completed`);
        }
      });
    });

    // Remove from Queue
    container.querySelectorAll('.btn-del-queue-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        if (confirm(`Remove token ${token} from today's queue?`)) {
          queue = queue.filter((q) => q.token !== token);
          db.patientQueue = queue;
          saveLocalDB(db, clinicId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
          renderView();
          showToast(`Token ${token} removed from queue`);
        }
      });
    });

    // Open Walk-in Modal
    const btnOpenWalkin = container.querySelector('#btn-open-add-walkin-queue');
    const btnEmptyWalkin = container.querySelector('#btn-add-walkin-empty');
    if (btnOpenWalkin) btnOpenWalkin.addEventListener('click', openWalkinModal);
    if (btnEmptyWalkin) btnEmptyWalkin.addEventListener('click', openWalkinModal);
  }

  // Add Walk-in Modal
  function openWalkinModal() {
    const modalRoot = container.querySelector('#modal-add-walkin-container');
    if (!modalRoot) return;

    // Collect all registered patients for autocomplete
    const allPatients = [];
    Object.values(db.families || {}).forEach((f) => {
      Object.values(f.patients || {}).forEach((p) => {
        allPatients.push({
          id: p.id || p.patId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          familyId: f.famId || f.id,
          familyHead: f.headName,
          phone: p.phone || f.phone,
          area: f.area,
        });
      });
    });

    const nextToken = `T-${pad(queue.length + 1, 2)}`;

    modalRoot.innerHTML = `
      <div class="cms-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; backdrop-filter: blur(2px);">
        <div class="cms-modal cms-card" style="width: 100%; max-width: 540px; box-shadow: var(--shadow-xl); border: 1px solid var(--border); padding: 22px; display: flex; flex-direction: column; gap: 14px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-user-plus" style="color: var(--primary); font-size: 18px;"></i>
              <div>
                <h2 class="font-display" style="font-weight: 800; font-size: 16px; margin: 0; color: var(--text);">
                  Add Walk-In Patient to Queue
                </h2>
                <div style="font-size: 11px; color: var(--text-muted);">Assigned Token: <b>${nextToken}</b></div>
              </div>
            </div>
            <button type="button" id="btn-close-walkin-modal" class="cms-btn cms-btn-ghost" style="padding: 4px 8px; border: none; font-size: 16px;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form id="form-add-walkin-queue" style="display: flex; flex-direction: column; gap: 12px;">
            
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Quick Select Registered Patient</label>
              <input type="text" id="walkin-lookup" class="cms-input" list="dl-walkin-patients" placeholder="Type name or phone to auto-fill..." style="padding: 7px 10px;" />
              <datalist id="dl-walkin-patients">
                ${allPatients
                  .map(
                    (p) =>
                      `<option value="${p.name}">ID: ${p.id} &bull; Head: ${p.familyHead} &bull; Ph: ${p.phone}</option>`
                  )
                  .join('')}
              </datalist>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 10px;">
              <div class="cms-form-group" style="margin-bottom: 0;">
                <label class="cms-label" style="font-size: 12px;">Patient Full Name *</label>
                <input type="text" id="walkin-name" class="cms-input" required placeholder="Full Name" style="padding: 7px 10px; font-weight: 700;" />
              </div>
              <div class="cms-form-group" style="margin-bottom: 0;">
                <label class="cms-label" style="font-size: 12px;">Age</label>
                <input type="number" id="walkin-age" class="cms-input" placeholder="Age" style="padding: 7px 10px;" />
              </div>
              <div class="cms-form-group" style="margin-bottom: 0;">
                <label class="cms-label" style="font-size: 12px;">Gender</label>
                <select id="walkin-gender" class="cms-select cms-input" style="padding: 7px 10px;">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Chief Complaint / Reason *</label>
              <input type="text" id="walkin-complaint" class="cms-input" required placeholder="e.g. Fever, Headache, Checkup" style="padding: 7px 10px;" />
            </div>

            <!-- Vitals -->
            <div style="background: var(--surface-alt); padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border);">
              <label class="cms-label" style="font-size: 11.5px; margin-bottom: 4px;">OPD Triage Vitals (Optional)</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <input type="text" id="walkin-bp" class="cms-input" placeholder="BP (120/80)" style="padding: 5px 8px; font-size: 12px;" />
                <input type="text" id="walkin-pulse" class="cms-input" placeholder="Pulse (72)" style="padding: 5px 8px; font-size: 12px;" />
                <input type="text" id="walkin-temp" class="cms-input" placeholder="Temp (98.6°F)" style="padding: 5px 8px; font-size: 12px;" />
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--border);">
              <button type="button" id="btn-cancel-walkin-modal" class="cms-btn cms-btn-ghost" style="padding: 8px 16px; border: 1px solid var(--border);">Cancel</button>
              <button type="submit" class="cms-btn cms-btn-primary" style="padding: 8px 20px;">
                <i class="fa-solid fa-plus"></i> Add to Queue (${nextToken})
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    const closeBtn = modalRoot.querySelector('#btn-close-walkin-modal');
    const cancelBtn = modalRoot.querySelector('#btn-cancel-walkin-modal');
    const form = modalRoot.querySelector('#form-add-walkin-queue');
    const lookupInput = modalRoot.querySelector('#walkin-lookup');
    const nameInput = modalRoot.querySelector('#walkin-name');
    const ageInput = modalRoot.querySelector('#walkin-age');
    const genderInput = modalRoot.querySelector('#walkin-gender');

    let matchedPat = null;

    const closeModal = () => (modalRoot.innerHTML = '');
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    lookupInput.addEventListener('change', (e) => {
      const val = e.target.value.trim().toLowerCase();
      matchedPat = allPatients.find((p) => p.name.toLowerCase() === val);
      if (matchedPat) {
        nameInput.value = matchedPat.name;
        if (matchedPat.age) ageInput.value = matchedPat.age;
        if (matchedPat.gender) genderInput.value = matchedPat.gender;
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = nameInput.value.trim().toUpperCase();
      const age = ageInput.value.trim();
      const gender = genderInput.value;
      const complaint = modalRoot.querySelector('#walkin-complaint').value.trim();
      const bp = modalRoot.querySelector('#walkin-bp').value.trim();
      const pulse = modalRoot.querySelector('#walkin-pulse').value.trim();
      const temp = modalRoot.querySelector('#walkin-temp').value.trim();

      const newEntry = {
        token: nextToken,
        patientId: matchedPat?.id || `PAT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        name: patientName,
        patientName: patientName,
        familyId: matchedPat?.familyId || 'FAM-WALKIN',
        familyHead: matchedPat?.familyHead || patientName,
        age: age || '35',
        gender: gender,
        phone: matchedPat?.phone || '',
        area: matchedPat?.area || 'Surat',
        arrivedAt: nowTime(),
        date: todayISO(),
        complaint: complaint,
        vitals: { bp, pulse, temp },
        status: 'Waiting',
      };

      queue.push(newEntry);
      db.patientQueue = queue;
      saveLocalDB(db, clinicId);
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

      closeModal();
      showToast(`✅ Added ${patientName} to Patient Queue (${nextToken})`);
      renderView();
    });
  }

  // Initial render
  renderView();
}

// Backwards compatibility alias so all existing calls to renderAppointmentsView work seamlessly
export const renderAppointmentsView = renderPatientQueueView;
