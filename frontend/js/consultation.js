/**
 * =========================================================
 * CASE ENTRY & CLINICAL CONSULTATION CONTROLLER
 * Full Clinical Workflow: Vitals, Diagnosis, Rx, Treatment
 * =========================================================
 */

import { apiFetch, getLocalDB, saveLocalDB, getAuthSession, pad, todayISO, nowTime, fmtDate, fmtMoney, uid, makeCaseId, showToast } from './api.js';
import { openPrescriptionModal } from './prescription.js';

export function renderConsultationView(container, selection, onSelectPatient, onPrintRequested, onOpenLabReports) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  let { familyId, patientId } = selection;
  let family = familyId && db.families[familyId] ? db.families[familyId] : null;
  let patient = family && patientId && family.patients[patientId] ? family.patients[patientId] : null;

  // If no selection, default to the first family & patient
  if (!family || !patient) {
    const firstFam = Object.values(db.families || {})[0];
    if (firstFam) {
      family = firstFam;
      familyId = firstFam.id;
      const firstPat = Object.values(firstFam.patients || {})[0];
      if (firstPat) {
        patient = firstPat;
        patientId = firstPat.id;
      }
    }
  }

  let isNewVisitOpen = false;
  let treatmentRows = [{ name: '', qty: '1' }];
  let prescriptionRows = [{ name: '', qty: '1', mor: '1', noon: '0', eve: '1', ngt: '0', timing: 'AF' }];

  container.innerHTML = `
    <div class="cms-case-container">
      <!-- Search Bar to Find Patient -->
      <div class="cms-card" style="padding: 12px 18px;">
        <label class="cms-label">Find Patient by Name, Patient ID, or Family Head</label>
        <div style="position: relative;">
          <input type="text" id="case-search-input" class="cms-input" placeholder="Type patient name, ID, or family head..." />
          <div id="case-search-results" class="cms-card" style="position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100; max-height: 280px; overflow-y: auto; display: none; padding: 6px;"></div>
        </div>
      </div>

      ${
        patient
          ? `
        <!-- Patient Header Card -->
        <div class="cms-patient-header-card">
          <div class="cms-patient-info-left">
            <div class="cms-patient-avatar">👤</div>
            <div class="cms-patient-title-group">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="cms-patient-name">${patient.name}</span>
                <span class="cms-kbd">PT ${patient.id}</span>
                <span class="cms-pill cms-badge-paid">FAM ${family.id}</span>
              </div>
              <div class="cms-patient-meta">
                <span>Relation: <b>${patient.relation || 'Head'}</b></span> &middot;
                <span>Age: <b>${patient.age || '—'}</b></span> &middot;
                <span>Blood Grp: <b>${patient.bloodGroup || '—'}</b></span> &middot;
                <span>Allergy: <b style="color: var(--danger);">${patient.allergy || 'None'}</b></span> &middot;
                <span>Head: <b>${family.headName}</b></span> &middot;
                <span>Area: <b>${family.area || '—'}</b></span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <button type="button" id="btn-toggle-new-visit" class="cms-btn cms-btn-primary">
              <span>🩺</span>
              <span>New Visit</span>
              <span class="cms-kbd">F6</span>
            </button>
            <button type="button" id="btn-edit-patient" class="cms-btn cms-btn-ghost">
              <span>✏️</span>
              <span>Edit Info</span>
            </button>
            <button type="button" id="btn-family-dues" class="cms-btn cms-btn-ghost">
              <span>💰</span>
              <span>Family Dues</span>
            </button>
          </div>
        </div>

        <!-- New Visit Form Drawer (Conditionally Open) -->
        <div id="new-visit-drawer" style="display: none;">
          <form id="form-new-visit" class="cms-card" style="border: 2px solid var(--primary); padding: 20px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--border); padding-bottom: 10px;">
              <div class="font-display" style="font-weight: 800; font-size: 16px; color: var(--primary);">
                Record Clinical Consultation &middot; Visit #${(patient.visits || []).length + 1}
              </div>
              <button type="button" id="btn-close-visit-form" class="cms-btn-ghost" style="padding: 4px 8px;">✕</button>
            </div>

            <!-- Vitals Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
              <div class="cms-form-group">
                <label class="cms-label">Date</label>
                <input type="date" id="visit-date" class="cms-input cms-input-sm" value="${todayISO()}" required />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Time</label>
                <input type="text" id="visit-time" class="cms-input cms-input-sm" value="${nowTime()}" />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">BP (mmHg)</label>
                <input type="text" id="visit-bp" class="cms-input cms-input-sm" list="dl-bp-list" placeholder="120/80" />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Weight (kg)</label>
                <input type="text" id="visit-weight" class="cms-input cms-input-sm" placeholder="70" />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Blood Sugar</label>
                <input type="text" id="visit-sugar" class="cms-input cms-input-sm" placeholder="110 mg/dL" />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Ref Doctor</label>
                <input type="text" id="visit-ref" class="cms-input cms-input-sm" list="dl-refdr-list" value="Self" />
              </div>
            </div>

            <!-- Clinical Observations -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="cms-form-group">
                <label class="cms-label">Chief Complaint *</label>
                <input type="text" id="visit-complaint" class="cms-input" list="dl-complaint-list" placeholder="e.g. Fever, Cough, Headache" required />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Diagnosis *</label>
                <input type="text" id="visit-diagnosis" class="cms-input" list="dl-diagnosis-list" placeholder="e.g. Viral Pharyngitis, Acidity" required />
              </div>
            </div>

            <div class="cms-form-group">
              <label class="cms-label">Investigation &amp; Clinical Notes</label>
              <input type="text" id="visit-investigation" class="cms-input" placeholder="e.g. CBC, Urine Routine, Chest X-Ray" />
            </div>

            <!-- Treatments Given At Clinic -->
            <div style="border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--surface-alt);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label class="cms-label" style="margin: 0; color: var(--primary-dark);">Clinic Treatments / Procedures</label>
                <button type="button" id="btn-add-treatment-row" class="cms-btn cms-btn-ghost" style="padding: 4px 10px; font-size: 12px;">+ Add Item</button>
              </div>
              <div id="treatment-rows-container" style="display: flex; flex-direction: column; gap: 6px;"></div>
            </div>

            <!-- Medicines / Prescriptions For Pharmacy -->
            <div style="border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--surface-alt);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label class="cms-label" style="margin: 0; color: var(--primary-dark);">Prescription (Medical Store)</label>
                <button type="button" id="btn-add-rx-row" class="cms-btn cms-btn-ghost" style="padding: 4px 10px; font-size: 12px;">+ Add Medicine</button>
              </div>
              <div id="rx-rows-container" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>

            <!-- Billing & Financials -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; background: var(--surface-alt); padding: 14px; border-radius: 12px;">
              <div class="cms-form-group">
                <label class="cms-label">Consultation Charge (₹)</label>
                <input type="number" id="visit-charge" class="cms-input" value="500" />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Received Amount (₹)</label>
                <input type="number" id="visit-received" class="cms-input" value="500" />
              </div>
              <div class="cms-form-group">
                <label class="cms-label">Balance Due (₹)</label>
                <div id="visit-due-display" class="font-mono" style="font-size: 18px; font-weight: 800; color: var(--success); padding-top: 8px;">₹0</div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px;">
              <button type="button" id="btn-open-lab-modal" class="cms-btn cms-btn-ghost">🔬 Attach Lab Reports</button>
              <button type="submit" class="cms-btn cms-btn-primary" style="padding: 10px 24px;">
                <span>💾</span>
                <span>Save Consultation &amp; Print</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Past Visits History Timeline -->
        <div class="cms-card" style="padding: 18px 22px;">
          <div class="cms-card-header">
            <div class="cms-card-title">
              Consultation &amp; Case History (${(patient.visits || []).length} Visits)
            </div>
          </div>

          <div id="patient-visits-timeline">
            ${
              (patient.visits || []).length === 0
                ? `<div style="padding: 40px; text-align: center; color: var(--text-muted);">No past visits recorded for this patient. Click "New Visit" above to start.</div>`
                : (patient.visits || [])
                    .slice()
                    .reverse()
                    .map((v) => renderVisitCardHTML(v))
                    .join('')
            }
          </div>
        </div>
      `
          : `
        <div class="cms-card" style="padding: 60px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 42px; margin-bottom: 12px;">📂</div>
          <div class="font-display" style="font-size: 18px; font-weight: 800; color: var(--text);">No Patient Selected</div>
          <div style="font-size: 14px; margin-top: 6px;">Search for a patient above or register a new family.</div>
        </div>
      `
      }
    </div>
  `;

  // Attach search listeners
  setupPatientSearch(container, db, onSelectPatient);

  if (patient) {
    setupVisitFormLogic(container, db, clinicId, family, patient, treatmentRows, prescriptionRows, onSelectPatient, onPrintRequested, onOpenLabReports);
  }
}

function renderVisitCardHTML(v) {
  return `
    <div class="cms-visit-card" data-visitid="${v.id}">
      <div class="cms-visit-card-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="font-mono" style="font-weight: 800; color: var(--primary);">Case ${v.caseId}</span>
          <span style="font-size: 13px; color: var(--text-muted);">📅 ${fmtDate(v.date)} at ${v.time || '10:00'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="font-mono" style="font-size: 13px; font-weight: 700;">Charge: ${fmtMoney(v.charge)}</span>
          ${
            Number(v.due) > 0
              ? `<span class="cms-pill cms-badge-due">Due: ${fmtMoney(v.due)}</span>`
              : `<span class="cms-pill cms-badge-paid">Paid Full</span>`
          }
          <button type="button" class="cms-btn cms-btn-ghost btn-print-visit" data-caseid="${v.caseId}" style="padding: 4px 8px; font-size: 12px;">🖨️ Print</button>
        </div>
      </div>

      <!-- Vitals Pills -->
      <div class="cms-vitals-row">
        ${v.bp ? `<div class="cms-vital-pill cms-vital-bp"><span>BP:</span> <b>${v.bp}</b></div>` : ''}
        ${v.weight ? `<div class="cms-vital-pill cms-vital-other"><span>Wt:</span> <b>${v.weight} kg</b></div>` : ''}
        ${v.sugar ? `<div class="cms-vital-pill cms-vital-sugar"><span>Sugar:</span> <b>${v.sugar}</b></div>` : ''}
        ${v.reference ? `<div class="cms-vital-pill cms-vital-ref"><span>Ref:</span> <b>${v.reference}</b></div>` : ''}
        ${v.complaint ? `<div class="cms-vital-pill cms-vital-comp"><span>Complaint:</span> <b>${v.complaint}</b></div>` : ''}
        ${v.diagnosis ? `<div class="cms-vital-pill cms-vital-inv"><span>Diagnosis:</span> <b>${v.diagnosis}</b></div>` : ''}
      </div>

      <!-- Treatments & Prescriptions with Repeat Click Actions -->
      ${
        (v.treatment && v.treatment.length > 0) || (v.prescription && v.prescription.length > 0)
          ? `
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; margin-top: 4px;">
          <!-- Treatment List -->
          <div style="background: var(--surface-alt); border-radius: 8px; padding: 8px 12px;">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Clinic Treatments Given:</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${(v.treatment || []).map((t) => `<div class="cms-repeat-badge btn-repeat-treatment" data-name="${t.name}" data-qty="${t.qty}">➕ ${t.name} (x${t.qty})</div>`).join('')}
            </div>
          </div>

          <!-- Prescription List -->
          <div style="background: var(--surface-alt); border-radius: 8px; padding: 8px 12px;">
            <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Prescriptions (Pharmacy):</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${(v.prescription || []).map((p) => `<div class="cms-repeat-badge btn-repeat-rx" data-name="${p.name}" data-qty="${p.qty}" data-mor="${p.mor}" data-noon="${p.noon}" data-eve="${p.eve}" data-ngt="${p.ngt}" data-timing="${p.timing || 'AF'}">➕ ${p.name} [Qty ${p.qty}] (${p.mor}-${p.noon}-${p.eve}-${p.ngt}) ${p.timing || 'AF'}</div>`).join('')}
            </div>
          </div>
        </div>
      `
          : ''
      }
    </div>
  `;
}

function setupPatientSearch(container, db, onSelectPatient) {
  const input = container.querySelector('#case-search-input');
  const resultsBox = container.querySelector('#case-search-results');
  if (!input || !resultsBox) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      resultsBox.style.display = 'none';
      return;
    }

    const matched = [];
    Object.values(db.families || {}).forEach((fam) => {
      Object.values(fam.patients || {}).forEach((pat) => {
        if (
          pat.name.toLowerCase().includes(q) ||
          pat.id.includes(q) ||
          fam.headName.toLowerCase().includes(q) ||
          fam.id.includes(q) ||
          (fam.area || '').toLowerCase().includes(q)
        ) {
          matched.push({ fam, pat });
        }
      });
    });

    if (matched.length === 0) {
      resultsBox.innerHTML = `<div style="padding: 10px; color: var(--text-muted); font-size: 13px;">No patient records found for "${q}".</div>`;
    } else {
      resultsBox.innerHTML = matched
        .slice(0, 8)
        .map(
          ({ fam, pat }) => `
        <div class="cms-search-hit" data-famid="${fam.id}" data-patid="${pat.id}" style="padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s;">
          <div>
            <b>${pat.name}</b> <span style="font-size: 12px; color: var(--text-muted);">(${pat.relation || 'Head'})</span>
            <div style="font-size: 11px; color: var(--text-muted);">${fam.headName} &middot; FAM ${fam.id} &middot; ${fam.area || '—'}</div>
          </div>
          <span class="cms-kbd">PT ${pat.id}</span>
        </div>
      `
        )
        .join('');

      resultsBox.querySelectorAll('.cms-search-hit').forEach((hit) => {
        hit.addEventListener('mouseenter', () => (hit.style.background = 'var(--surface-alt)'));
        hit.addEventListener('mouseleave', () => (hit.style.background = 'transparent'));
        hit.addEventListener('click', () => {
          const fId = hit.getAttribute('data-famid');
          const pId = hit.getAttribute('data-patid');
          resultsBox.style.display = 'none';
          input.value = '';
          if (onSelectPatient) onSelectPatient(fId, pId);
        });
      });
    }
    resultsBox.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!resultsBox.contains(e.target) && e.target !== input) {
      resultsBox.style.display = 'none';
    }
  });
}

function setupVisitFormLogic(container, db, clinicId, family, patient, treatmentRows, prescriptionRows, onSelectPatient, onPrintRequested, onOpenLabReports) {
  const toggleBtn = container.querySelector('#btn-toggle-new-visit');
  const drawer = container.querySelector('#new-visit-drawer');
  const closeBtn = container.querySelector('#btn-close-visit-form');
  const form = container.querySelector('#form-new-visit');

  const chargeInput = container.querySelector('#visit-charge');
  const receivedInput = container.querySelector('#visit-received');
  const dueDisplay = container.querySelector('#visit-due-display');

  const updateDueCalculation = () => {
    const c = Number(chargeInput.value || 0);
    const r = Number(receivedInput.value || 0);
    const d = Math.max(0, c - r);
    dueDisplay.textContent = fmtMoney(d);
    dueDisplay.style.color = d > 0 ? 'var(--danger)' : 'var(--success)';
  };

  chargeInput.addEventListener('input', updateDueCalculation);
  receivedInput.addEventListener('input', updateDueCalculation);

  toggleBtn.addEventListener('click', () => {
    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
    if (drawer.style.display === 'block') {
      drawer.scrollIntoView({ behavior: 'smooth' });
    }
  });

  closeBtn.addEventListener('click', () => {
    drawer.style.display = 'none';
  });

  // Render Treatment Rows
  const treatmentContainer = container.querySelector('#treatment-rows-container');
  const renderTreatments = () => {
    treatmentContainer.innerHTML = treatmentRows
      .map(
        (t, idx) => `
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="text" class="cms-input cms-input-sm tr-name" data-idx="${idx}" value="${t.name}" placeholder="Treatment / injection name" style="flex: 3;" />
        <input type="text" class="cms-input cms-input-sm tr-qty" data-idx="${idx}" value="${t.qty}" placeholder="Qty" style="flex: 1;" />
        <button type="button" class="cms-btn-ghost btn-del-tr" data-idx="${idx}" style="color: var(--danger); padding: 4px 8px;">✕</button>
      </div>
    `
      )
      .join('');

    treatmentContainer.querySelectorAll('.tr-name').forEach((el) => {
      el.addEventListener('input', (e) => (treatmentRows[el.dataset.idx].name = e.target.value));
    });
    treatmentContainer.querySelectorAll('.tr-qty').forEach((el) => {
      el.addEventListener('input', (e) => (treatmentRows[el.dataset.idx].qty = e.target.value));
    });
    treatmentContainer.querySelectorAll('.btn-del-tr').forEach((el) => {
      el.addEventListener('click', () => {
        treatmentRows.splice(Number(el.dataset.idx), 1);
        if (treatmentRows.length === 0) treatmentRows.push({ name: '', qty: '1' });
        renderTreatments();
      });
    });
  };

  container.querySelector('#btn-add-treatment-row').addEventListener('click', () => {
    treatmentRows.push({ name: '', qty: '1' });
    renderTreatments();
  });
  renderTreatments();

  // Render Prescription Rows
  const rxContainer = container.querySelector('#rx-rows-container');
  const renderPrescriptions = () => {
    rxContainer.innerHTML = prescriptionRows
      .map(
        (p, idx) => `
      <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; background: var(--surface); padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border);">
        <input type="text" class="cms-input cms-input-sm rx-name" data-idx="${idx}" value="${p.name}" placeholder="Medicine name" style="flex: 2.5; min-width: 140px;" />
        <input type="text" class="cms-input cms-input-sm rx-qty" data-idx="${idx}" value="${p.qty}" placeholder="Qty" style="width: 50px; text-align: center;" />
        <input type="text" class="cms-input cms-input-sm rx-mor" data-idx="${idx}" value="${p.mor}" placeholder="M" title="Morning dose" style="width: 38px; text-align: center;" />
        <input type="text" class="cms-input cms-input-sm rx-noon" data-idx="${idx}" value="${p.noon}" placeholder="N" title="Noon dose" style="width: 38px; text-align: center;" />
        <input type="text" class="cms-input cms-input-sm rx-eve" data-idx="${idx}" value="${p.eve}" placeholder="E" title="Evening dose" style="width: 38px; text-align: center;" />
        <input type="text" class="cms-input cms-input-sm rx-ngt" data-idx="${idx}" value="${p.ngt}" placeholder="Nt" title="Night dose" style="width: 38px; text-align: center;" />
        <div style="display: flex; gap: 8px; align-items: center; padding: 2px 8px; background: var(--surface-alt); border-radius: 6px;">
          <label style="font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px;">
            <input type="radio" name="rx-timing-${idx}" value="BF" ${p.timing === 'BF' ? 'checked' : ''} class="rx-timing" data-idx="${idx}" /> BF
          </label>
          <label style="font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px;">
            <input type="radio" name="rx-timing-${idx}" value="AF" ${p.timing !== 'BF' ? 'checked' : ''} class="rx-timing" data-idx="${idx}" /> AF
          </label>
        </div>
        <button type="button" class="cms-btn-ghost btn-del-rx" data-idx="${idx}" style="color: var(--danger); padding: 4px 8px;">✕</button>
      </div>
    `
      )
      .join('');

    rxContainer.querySelectorAll('.rx-name').forEach((el) => {
      el.addEventListener('input', (e) => (prescriptionRows[el.dataset.idx].name = e.target.value));
    });
    rxContainer.querySelectorAll('.rx-qty').forEach((el) => {
      el.addEventListener('input', (e) => (prescriptionRows[el.dataset.idx].qty = e.target.value));
    });
    rxContainer.querySelectorAll('.rx-mor').forEach((el) => {
      el.addEventListener('input', (e) => (prescriptionRows[el.dataset.idx].mor = e.target.value));
    });
    rxContainer.querySelectorAll('.rx-noon').forEach((el) => {
      el.addEventListener('input', (e) => (prescriptionRows[el.dataset.idx].noon = e.target.value));
    });
    rxContainer.querySelectorAll('.rx-eve').forEach((el) => {
      el.addEventListener('input', (e) => (prescriptionRows[el.dataset.idx].eve = e.target.value));
    });
    rxContainer.querySelectorAll('.rx-ngt').forEach((el) => {
      el.addEventListener('input', (e) => (prescriptionRows[el.dataset.idx].ngt = e.target.value));
    });
    rxContainer.querySelectorAll('.rx-timing').forEach((el) => {
      el.addEventListener('change', (e) => (prescriptionRows[el.dataset.idx].timing = e.target.value));
    });
    rxContainer.querySelectorAll('.btn-del-rx').forEach((el) => {
      el.addEventListener('click', () => {
        prescriptionRows.splice(Number(el.dataset.idx), 1);
        if (prescriptionRows.length === 0) prescriptionRows.push({ name: '', qty: '1', mor: '1', noon: '0', eve: '1', ngt: '0', timing: 'AF' });
        renderPrescriptions();
      });
    });
  };

  container.querySelector('#btn-add-rx-row').addEventListener('click', () => {
    prescriptionRows.push({ name: '', qty: '1', mor: '1', noon: '0', eve: '1', ngt: '0', timing: 'AF' });
    renderPrescriptions();
  });
  renderPrescriptions();

  // Attach Repeat Badges Click Actions from Past Visits
  container.querySelectorAll('.btn-repeat-treatment').forEach((badge) => {
    badge.addEventListener('click', () => {
      drawer.style.display = 'block';
      treatmentRows.push({ name: badge.dataset.name, qty: badge.dataset.qty || '1' });
      renderTreatments();
      showToast(`Added ${badge.dataset.name} to active visit`);
    });
  });

  container.querySelectorAll('.btn-repeat-rx').forEach((badge) => {
    badge.addEventListener('click', () => {
      drawer.style.display = 'block';
      prescriptionRows.push({
        name: badge.dataset.name,
        qty: badge.dataset.qty || '1',
        mor: badge.dataset.mor || '1',
        noon: badge.dataset.noon || '0',
        eve: badge.dataset.eve || '1',
        ngt: badge.dataset.ngt || '0',
        timing: badge.dataset.timing || 'AF',
      });
      renderPrescriptions();
      showToast(`Added ${badge.dataset.name} to active prescription`);
    });
  });

  // Attach Print Visit Action
  container.querySelectorAll('.btn-print-visit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caseId = btn.dataset.caseid;
      const visit = (patient.visits || []).find((v) => v.caseId === caseId);
      if (visit && onPrintRequested) {
        onPrintRequested(patient, visit);
      }
    });
  });

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = container.querySelector('#visit-date').value || todayISO();
    const time = container.querySelector('#visit-time').value || nowTime();
    const bp = container.querySelector('#visit-bp').value.trim();
    const weight = container.querySelector('#visit-weight').value.trim();
    const sugar = container.querySelector('#visit-sugar').value.trim();
    const refDr = container.querySelector('#visit-ref').value.trim() || 'Self';
    const complaint = container.querySelector('#visit-complaint').value.trim();
    const diagnosis = container.querySelector('#visit-diagnosis').value.trim();
    const investigation = container.querySelector('#visit-investigation').value.trim();
    const charge = Number(chargeInput.value || 0);
    const received = Number(receivedInput.value || 0);
    const due = Math.max(0, charge - received);

    const validTreatments = treatmentRows.filter((t) => t.name.trim());
    const validRx = prescriptionRows.filter((p) => p.name.trim());

    const visitNum = (patient.visits || []).length + 1;
    const caseId = makeCaseId(family.id, patient.id, visitNum);

    const visitPayload = {
      id: uid(),
      caseId,
      visitNum,
      familyId: family.id,
      patientId: patient.id,
      date,
      time,
      bp,
      weight,
      sugar,
      reference: refDr,
      refDr,
      complaint,
      diagnosis,
      investigation,
      treatment: validTreatments,
      prescription: validRx,
      charge,
      received,
      due,
    };

    // Try backend API first
    try {
      await apiFetch('/consultations', {
        method: 'POST',
        body: visitPayload,
      });
    } catch (err) {}

    // Update Local DB
    if (!patient.visits) patient.visits = [];
    patient.visits.push(visitPayload);
    db.counters.visit = (db.counters.visit || 1) + 1;
    saveLocalDB(db, clinicId);

    showToast(`Visit recorded for ${patient.name}! Case ${caseId}`);
    drawer.style.display = 'none';

    // Auto trigger print preview
    if (onPrintRequested) {
      onPrintRequested(patient, visitPayload);
    } else {
      renderConsultationView(container, { familyId: family.id, patientId: patient.id }, onSelectPatient, onPrintRequested, onOpenLabReports);
    }
  });
}
