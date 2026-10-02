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
  let queue = [];
  try {
    const res = await apiFetch('/appointments');
    if (res.success) queue = res.data || [];
  } catch (e) {
    console.error('Failed to load queue', e);
  }

  // Filter state - default to 'pending'
  let currentQueueTab = 'pending'; // 'pending' | 'completed'

  function getPendingQueue() {
    return queue.filter((q) => !q.status || q.status === 'Waiting' || q.status === 'In Consultation');
  }

  function getCompletedQueue() {
    return queue.filter((q) => q.status === 'Completed' || q.status === 'Done');
  }

  function renderView() {
    const pendingQueue = getPendingQueue();
    const completedQueue = getCompletedQueue();
    const activeList = currentQueueTab === 'completed' ? completedQueue : pendingQueue;

    const waitingCount = queue.filter((q) => !q.status || q.status === 'Waiting').length;
    const inConsultCount = queue.filter((q) => q.status === 'In Consultation').length;
    const completedCount = completedQueue.length;

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
              Real-time patient roster dispatched by Receptionist. Click "Consult" to begin medical examination.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Two Tabs: Pending / Completed -->
            <div style="display: flex; background: var(--surface-alt); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--border); gap: 4px;">
              <button type="button" class="cms-btn cms-btn-sm queue-tab-btn ${currentQueueTab === 'pending' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="pending" style="font-size: 12px; padding: 6px 14px;">
                <i class="fa-solid fa-clock"></i> Pending / Waiting (${pendingQueue.length})
              </button>
              <button type="button" class="cms-btn cms-btn-sm queue-tab-btn ${currentQueueTab === 'completed' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="completed" style="font-size: 12px; padding: 6px 14px;">
                <i class="fa-solid fa-circle-check"></i> Completed (${completedCount})
              </button>
            </div>

            <!-- Add Walk-in Patient to Queue Button -->
            <button type="button" id="btn-open-add-walkin-queue" class="cms-btn cms-btn-primary cms-btn-sm" style="font-size: 12px; padding: 7px 14px;">
              <i class="fa-solid fa-user-plus"></i>
              <span>+ Add Walk-In Patient</span>
            </button>
          </div>
        </div>

        <!-- Queue Table Card -->
        <div class="cms-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
          <div style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); background: var(--surface);">
            <div class="cms-card-title" style="margin: 0; font-size: 14.5px;">
              <i class="fa-solid ${currentQueueTab === 'completed' ? 'fa-clipboard-check' : 'fa-list-ol'}" style="color: var(--primary); margin-right: 6px;"></i>
              ${currentQueueTab === 'completed' ? 'Completed Consultations Today' : 'Active Patient Waiting Queue'}
            </div>
            <span class="cms-pill cms-badge-paid font-mono" style="font-size: 11px;">
              ${activeList.length} ${currentQueueTab === 'completed' ? 'Completed' : 'Waiting / In Consultation'}
            </span>
          </div>

          ${activeList.length === 0
        ? `
            <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
              <i class="fa-solid ${currentQueueTab === 'completed' ? 'fa-clipboard-check' : 'fa-users-slash'}" style="font-size: 40px; margin-bottom: 12px; display: block; opacity: 0.4;"></i>
              <div style="font-size: 16px; font-weight: 800; color: var(--text);">
                ${currentQueueTab === 'completed' ? 'No completed consultations today' : 'No patients currently waiting in queue'}
              </div>
              <p style="font-size: 12.5px; margin-top: 6px;">
                ${currentQueueTab === 'completed' ? 'Consultations completed by the doctor will appear here.' : 'Arriving patients registered by the receptionist will appear here live in real-time.'}
              </p>
              ${currentQueueTab === 'pending'
          ? `
                <button type="button" id="btn-add-walkin-empty" class="cms-btn cms-btn-primary" style="margin-top: 14px; padding: 9px 20px;">
                  <i class="fa-solid fa-user-plus"></i> Add Walk-In Patient to Queue
                </button>
              `
          : ''
        }
            </div>
          `
        : `
            <div class="cms-table-wrapper" style="margin: 0;">
              <table class="cms-table" style="width: 100%;">
                <thead>
                  <tr>
                    <th style="width: 80px;">Token</th>
                    <th>Patient Info</th>
                    <th>Family Head &amp; Contact</th>
                    <th>Chief Complaint</th>
                    <th>Triage Vitals</th>
                    <th>Arrived</th>
                    <th>Status</th>
                    <th style="text-align: right; min-width: 220px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeList
          .map((q, idx) => {
            const st = q.status || 'Waiting';
            const statusColor = {
              Waiting: '#b91c1c',
              'In Consultation': '#166534',
              Completed: '#0369a1',
              Done: '#0369a1',
            };
            const statusBg = {
              Waiting: '#fee2e2',
              'In Consultation': '#dcfce7',
              Completed: '#e0f2fe',
              Done: '#e0f2fe',
            };
            const col = statusColor[st] || 'var(--text-muted)';
            const bg = statusBg[st] || 'var(--surface-alt)';

            return `
                      <tr>
                        <td>
                          <span class="cms-pill font-mono" style="background: var(--primary-soft); color: var(--primary-dark); font-weight: 900; font-size: 13px;">
                            ${q.token || 'T-' + pad(idx + 1, 2)}
                          </span>
                        </td>
                        <td>
                          <div style="font-weight: 800; color: var(--text); font-size: 14px;">
                            ${q.patientName || q.name}
                          </div>
                          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                            ${q.age ? q.age + ' Yrs' : 'Adult'}${q.gender ? ' · ' + q.gender : ''} · <span class="font-mono">${q.patientId || 'ID-N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div style="font-size: 12.5px; font-weight: 600;">
                            <i class="fa-solid fa-people-roof" style="color: var(--primary); font-size: 11px;"></i> ${q.familyHead || 'Self'}
                          </div>
                          <div style="font-size: 11px; color: var(--text-muted);">
                            ${q.phone ? '📞 ' + q.phone : (q.area || 'General Area')}
                          </div>
                        </td>
                        <td style="max-width: 220px;">
                          <div style="font-size: 12.5px; font-weight: 600; color: var(--text);">
                            ${q.complaint || 'General Consultation'}
                          </div>
                        </td>
                        <td>
                          ${q.vitals && (q.vitals.bp || q.vitals.pulse || q.vitals.temp || q.vitals.spo2 || q.vitals.weight)
                ? `
                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                              ${q.vitals.bp ? `<span class="cms-pill" style="font-size: 10px; background: var(--surface-alt); border: 1px solid var(--border); font-weight: 700;">BP: ${q.vitals.bp}</span>` : ''}
                              ${q.vitals.pulse ? `<span class="cms-pill" style="font-size: 10px; background: var(--surface-alt); border: 1px solid var(--border); font-weight: 700;">HR: ${q.vitals.pulse}</span>` : ''}
                              ${q.vitals.temp ? `<span class="cms-pill" style="font-size: 10px; background: var(--surface-alt); border: 1px solid var(--border); font-weight: 700;">${q.vitals.temp}</span>` : ''}
                            </div>
                          `
                : `<span style="font-size: 11px; color: #94a3b8; font-style: italic;">No vitals</span>`
              }
                        </td>
                        <td style="font-size: 12px; font-family: 'IBM Plex Mono', monospace; color: var(--text-muted);">
                          ${q.arrivedAt || '-'}
                        </td>
                        <td>
                          <span class="cms-pill" style="background: ${bg}; color: ${col}; font-weight: 800; font-size: 11px;">
                            ${st}
                          </span>
                        </td>
                        <td>
                          <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
                            <!-- View Details Button -->
                            <button type="button" class="cms-btn cms-btn-ghost btn-view-doctor-queue" data-token="${q.token}" style="font-size: 11px; padding: 5px 9px; border: 1px solid var(--border);" title="View Full Details">
                              <i class="fa-solid fa-eye"></i> View
                            </button>

                            <!-- Start Consultation Direct Button -->
                            <button type="button" class="cms-btn cms-btn-primary btn-start-consultation-direct" data-token="${q.token}" data-patid="${q.patientId}" data-famid="${q.familyId}" style="padding: 5px 11px; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
                              <i class="fa-solid fa-stethoscope"></i>
                              <span>${st === 'In Consultation' ? 'Continue' : st === 'Completed' ? 'Reopen' : 'Consult'}</span>
                            </button>

                            ${st !== 'Completed'
                ? `
                              <button type="button" class="cms-btn cms-btn-ghost btn-mark-queue-done" data-token="${q.token}" style="font-size: 11px; padding: 5px 8px; border: 1px solid var(--border); color: #059669;" title="Mark as Completed">
                                <i class="fa-solid fa-check"></i>
                              </button>
                            `
                : ''
              }

                            <button type="button" class="cms-btn cms-btn-danger btn-del-queue-item" data-token="${q.token}" style="font-size: 11px; padding: 5px 8px;" title="Remove from Queue">
                              <i class="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
          })
          .join('')}
                </tbody>
              </table>
            </div>
          `
      }
        </div>

      </div>

      <!-- Add Walk-In Modal Mount -->
      <div id="modal-add-walkin-container"></div>
      <!-- View Detail Modal Mount -->
      <div id="modal-doctor-queue-detail"></div>
    `;

    wireQueueEvents();
  }

  function wireQueueEvents() {
    // Tab Switcher Buttons (Pending / Completed)
    container.querySelectorAll('.queue-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentQueueTab = btn.getAttribute('data-tab');
        renderView();
      });
    });

    // View Details Button
    container.querySelectorAll('.btn-view-doctor-queue').forEach((btn) => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        openDoctorQueueDetailModal(token);
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
          const apiId = item._id || item.id;
          if (apiId) apiFetch(`/appointments/${apiId}`, { method: 'PUT', body: { status: 'In Consultation' } }).catch(console.error);
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
          const apiId = item._id || item.id;
          if (apiId) apiFetch(`/appointments/${apiId}`, { method: 'PUT', body: { status: 'Completed' } }).catch(console.error);
          renderView();
          showToast(`Token ${token} marked as Completed`);
        }
      });
    });

    // Remove from Queue
    container.querySelectorAll('.btn-del-queue-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        const item = queue.find((q) => q.token === token);
        if (confirm(`Remove token ${token} from today's queue?`)) {
          queue = queue.filter((q) => q.token !== token);
          const apiId = item ? (item._id || item.id) : null;
          if (apiId) apiFetch(`/appointments/${apiId}`, { method: 'DELETE' }).catch(console.error);
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

  // View Queue Detail Modal for Doctor
  function openDoctorQueueDetailModal(token) {
    const item = queue.find((q) => q.token === token);
    const modalRoot = container.querySelector('#modal-doctor-queue-detail');
    if (!item || !modalRoot) {
      showToast('Patient record not found', 'error');
      return;
    }

    modalRoot.innerHTML = `
      <div class="cms-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; backdrop-filter: blur(2px);">
        <div class="cms-modal cms-card" style="width: 100%; max-width: 540px; box-shadow: var(--shadow-xl); border: 1px solid var(--border); padding: 22px; display: flex; flex-direction: column; gap: 14px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="cms-pill font-mono" style="background: var(--primary); color: #fff; font-size: 15px; font-weight: 900; padding: 4px 10px;">${item.token}</span>
              <div>
                <h2 class="font-display" style="font-weight: 800; font-size: 16px; margin: 0; color: var(--text);">
                  ${item.patientName || item.name}
                </h2>
                <div style="font-size: 11.5px; color: var(--text-muted);">${item.age ? item.age + ' Yrs' : 'Adult'} &bull; ${item.gender || 'Male'} &bull; ID: ${item.patientId || '-'}</div>
              </div>
            </div>
            <button type="button" id="btn-close-doctor-detail-modal" class="cms-btn cms-btn-ghost" style="padding: 4px 8px; border: none; font-size: 16px;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Status Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--border);">
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Queue Status:</span>
              <span class="cms-pill" style="font-weight: 800; font-size: 11px; background: ${item.status === 'In Consultation' ? '#dcfce7' : item.status === 'Completed' ? '#e0f2fe' : '#fee2e2'}; color: ${item.status === 'In Consultation' ? '#166534' : item.status === 'Completed' ? '#0369a1' : '#b91c1c'};">
                ${item.status || 'Waiting'}
              </span>
            </div>

            <!-- Family & Contact -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Family &amp; Contact</div>
              <div style="font-size: 12.5px; line-height: 1.6;">
                <div><i class="fa-solid fa-people-roof" style="color: var(--primary); width: 16px;"></i> Family Head: <b>${item.familyHead || 'Self'}</b></div>
                <div><i class="fa-solid fa-phone" style="color: var(--primary); width: 16px;"></i> Phone: <b>${item.phone || 'N/A'}</b></div>
                <div><i class="fa-solid fa-location-dot" style="color: var(--primary); width: 16px;"></i> Area: ${item.area || 'General Area'}</div>
              </div>
            </div>

            <!-- Chief Complaint -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Chief Complaint</div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text);">${item.complaint || 'General OPD Consultation'}</div>
            </div>

            <!-- Pre-Consultation Vitals -->
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">OPD Triage Vitals</div>
              ${item.vitals && (item.vitals.bp || item.vitals.pulse || item.vitals.temp || item.vitals.spo2 || item.vitals.weight)
        ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px;">
                  ${item.vitals.bp ? `<div style="background: var(--surface-alt); padding: 6px 8px; border-radius: 6px; font-size: 11.5px;"><span style="color: var(--text-muted); display: block; font-size: 10px;">BP</span><b>${item.vitals.bp}</b></div>` : ''}
                  ${item.vitals.pulse ? `<div style="background: var(--surface-alt); padding: 6px 8px; border-radius: 6px; font-size: 11.5px;"><span style="color: var(--text-muted); display: block; font-size: 10px;">Pulse</span><b>${item.vitals.pulse}</b></div>` : ''}
                  ${item.vitals.temp ? `<div style="background: var(--surface-alt); padding: 6px 8px; border-radius: 6px; font-size: 11.5px;"><span style="color: var(--text-muted); display: block; font-size: 10px;">Temp</span><b>${item.vitals.temp}</b></div>` : ''}
                  ${item.vitals.spo2 ? `<div style="background: var(--surface-alt); padding: 6px 8px; border-radius: 6px; font-size: 11.5px;"><span style="color: var(--text-muted); display: block; font-size: 10px;">SpO2</span><b>${item.vitals.spo2}</b></div>` : ''}
                  ${item.vitals.weight ? `<div style="background: var(--surface-alt); padding: 6px 8px; border-radius: 6px; font-size: 11.5px;"><span style="color: var(--text-muted); display: block; font-size: 10px;">Weight</span><b>${item.vitals.weight}</b></div>` : ''}
                </div>
              `
        : `<div style="font-size: 12px; color: var(--text-muted); font-style: italic;">No pre-consultation vitals recorded.</div>`
      }
            </div>

            <div style="font-size: 11.5px; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Arrived: <b>${item.arrivedAt || 'Recently'}</b></span>
              <span>Date: <b>${item.date || todayISO()}</b></span>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--border);">
            <button type="button" id="btn-close-doctor-detail-bottom" class="cms-btn cms-btn-ghost" style="padding: 7px 16px; border: 1px solid var(--border);">Close</button>
            <button type="button" id="btn-start-consult-from-modal" class="cms-btn cms-btn-primary" style="padding: 7px 18px; font-weight: 700;">
              <i class="fa-solid fa-stethoscope"></i> Start Consultation
            </button>
          </div>

        </div>
      </div>
    `;

    const closeModal = () => (modalRoot.innerHTML = '');
    modalRoot.querySelector('#btn-close-doctor-detail-modal')?.addEventListener('click', closeModal);
    modalRoot.querySelector('#btn-close-doctor-detail-bottom')?.addEventListener('click', closeModal);

    modalRoot.querySelector('#btn-start-consult-from-modal')?.addEventListener('click', () => {
      closeModal();
      item.status = 'In Consultation';
      const apiId = item._id || item.id;
      if (apiId) apiFetch(`/appointments/${apiId}`, { method: 'PUT', body: { status: 'In Consultation' } }).catch(console.error);

      if (typeof onSelectPatientForConsultation === 'function') {
        onSelectPatientForConsultation({ familyId: item.familyId, patientId: item.patientId });
      } else {
        const caseNav = document.getElementById('nav-case');
        if (caseNav) {
          window.__SELECTED_PATIENT_FOR_VISIT = { familyId: item.familyId, patientId: item.patientId };
          caseNav.click();
        }
      }
      showToast(`🩺 Opened consultation for Token ${item.token}`);
    });
  }

  // Add Walk-in Modal
  async function openWalkinModal() {
    const modalRoot = container.querySelector('#modal-add-walkin-container');
    if (!modalRoot) return;

    let allPatients = [];
    try {
      const res = await apiFetch('/patients');
      if (res.success && res.data) {
        allPatients = res.data.map(p => ({
          id: p._id || p.patId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          familyId: p.familyId ? (typeof p.familyId === 'object' ? p.familyId._id : p.familyId) : '',
          familyHead: p.familyId && p.familyId.headName ? p.familyId.headName : (p.familyHead || 'Self'),
          phone: p.phone,
          area: p.area
        }));
      }
    } catch (e) { }

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

    form.addEventListener('submit', async (e) => {
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

      try {
        const res = await apiFetch('/appointments', {
          method: 'POST',
          body: newEntry
        });
        if (res && res.success && res.data) queue.push(res.data);
        else queue.push(newEntry);
      } catch (e) { queue.push(newEntry); }

      closeModal();
      showToast(`✅ Added ${patientName} to Patient Queue (${nextToken})`);
      renderView();
    });
  }

  // Cross-tab real-time sync with Receptionist desk
  const storageHandler = (e) => {
    if (e.key === QUEUE_STORAGE_KEY || (e.key && e.key.startsWith('clinic_db_'))) {
      apiFetch('/appointments').then(res => {
        if (res.success) {
          queue = res.data || [];
          renderView();
        }
      }).catch(() => { });
      renderView();
    }
  };
  window.addEventListener('storage', storageHandler);

  // Initial render
  renderView();
}

// Backwards compatibility alias so all existing calls to renderAppointmentsView work seamlessly
export const renderAppointmentsView = renderPatientQueueView;

