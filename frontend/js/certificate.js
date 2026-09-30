/**
 * =========================================================
 * MEDICAL CERTIFICATE ISSUANCE CONTROLLER
 * Fitness, Leave & Rest Certificate Form and A4 Print Preview
 * =========================================================
 */

import { fmtDate, todayISO, showToast, apiFetch } from './api.js';

export function renderCertificateView(container) {
  let certPat = '';
  let certDiag = 'Viral Fever & Physical Weakness';
  let certFromDate = todayISO();
  let certToDate = todayISO();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Issue Certificate Form Card -->
      <div class="cms-card">
        <div class="cms-card-header">
          <div class="cms-card-title">Issue Medical Fitness / Leave Certificate</div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 1fr; gap: 14px; margin-bottom: 20px;">
          <div class="cms-form-group">
            <label class="cms-label">Patient Full Name *</label>
            <input type="text" id="cert-patient-name" class="cms-input" placeholder="e.g. PATEL RAMESHBHAI G." value="${certPat}" />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">Medical Diagnosis *</label>
            <input type="text" id="cert-diagnosis" class="cms-input" placeholder="e.g. Acute Gastroenteritis, Viral Fever" value="${certDiag}" />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">From Date</label>
            <input type="date" id="cert-from-date" class="cms-input" value="${certFromDate}" />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">To Date</label>
            <input type="date" id="cert-to-date" class="cms-input" value="${certToDate}" />
          </div>
        </div>

        <!-- Live A4 Certificate Print Preview Area -->
        <div style="background: var(--surface-alt); padding: 24px; border-radius: var(--radius-md); display: flex; justify-content: center;">
          <div id="cms-print-area" style="background: #FFFFFF; color: #222222; width: 100%; max-width: 650px; padding: 36px 40px; border: 2px solid #146B5C; border-radius: 12px; box-shadow: var(--shadow-md); font-family: 'Inter', sans-serif;">
            <div style="text-align: center; border-bottom: 2px solid #146B5C; padding-bottom: 14px; margin-bottom: 24px;">
              <div class="font-display" style="font-size: 24px; font-weight: 800; color: #146B5C; letter-spacing: -0.5px;">Dhyey Clinic &amp; Nursing Home</div>
              <div style="font-size: 12px; color: #666666; font-weight: 600; margin-top: 4px;">Shop No. 1, Mahavir Heights, New Kosad Road, Amroli, Surat</div>
              <div style="font-size: 13px; font-weight: 800; color: #333333; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">Medical Certificate</div>
            </div>

            <div style="font-size: 14.5px; line-height: 2.2; text-align: justify; margin: 30px 0;">
              This is to certify that <b><span id="preview-cert-pat" style="text-decoration: underline;">${certPat || '_______________________________'}</span></b> was under my personal medical care and treatment for <b><span id="preview-cert-diag" style="text-decoration: underline;">${certDiag}</span></b> from <b><span id="preview-cert-from">${fmtDate(certFromDate)}</span></b> to <b><span id="preview-cert-to">${fmtDate(certToDate)}</span></b>.
              The patient was advised complete rest during this period and is now clinically recovered and fit to resume their duties.
            </div>

            <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 13px;">
              <div>
                <div><b>Date:</b> ${fmtDate(todayISO())}</div>
                <div><b>Place:</b> Surat</div>
              </div>
              <div style="text-align: right;">
                <div style="margin-bottom: 40px;">___________________________________</div>
                <div style="font-weight: 800; color: #146B5C;">Dr. Chirag Paghdal</div>
                <div style="font-size: 11px; color: #555555;">Authorized Medical Officer (Reg. No. G-9035)</div>
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
          <button type="button" id="btn-print-certificate" class="cms-btn cms-btn-primary" style="padding: 10px 24px;">
            <span>🖨️</span>
            <span>Print Medical Certificate</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Dynamic Live Preview Updates
  const patInput = container.querySelector('#cert-patient-name');
  const diagInput = container.querySelector('#cert-diagnosis');
  const fromInput = container.querySelector('#cert-from-date');
  const toInput = container.querySelector('#cert-to-date');

  patInput.addEventListener('input', (e) => {
    container.querySelector('#preview-cert-pat').textContent = e.target.value.toUpperCase() || '_______________________________';
  });
  diagInput.addEventListener('input', (e) => {
    container.querySelector('#preview-cert-diag').textContent = e.target.value || '_______________________________';
  });
  fromInput.addEventListener('change', (e) => {
    container.querySelector('#preview-cert-from').textContent = fmtDate(e.target.value);
  });
  toInput.addEventListener('change', (e) => {
    container.querySelector('#preview-cert-to').textContent = fmtDate(e.target.value);
  });

  container.querySelector('#btn-print-certificate').addEventListener('click', async () => {
    if (!patInput.value.trim()) {
      showToast('Please enter patient name', 'error');
      return;
    }

    try {
      await apiFetch('/certificates', {
        method: 'POST',
        body: {
          patientName: patInput.value.trim().toUpperCase(),
          diagnosis: diagInput.value.trim(),
          fromDate: fromInput.value,
          toDate: toInput.value,
        },
      });
    } catch (e) {}

    window.print();
  });
}
