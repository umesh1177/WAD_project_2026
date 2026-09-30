/**
 * =========================================================
 * PRESCRIPTION & PRINT MODAL CONTROLLER
 * Multi-Language (English, Gujarati, Hindi) A5 Letterpad Print
 * =========================================================
 */

import { fmtDate, getLocalDB, getAuthSession, showToast } from './api.js';

export function openPrescriptionModal(patient, visit, onClose) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  let currentLang = 'EN';
  let dietaryInput = '';

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'cms-overlay';
  modalOverlay.style.zIndex = '9999';

  const I18N = {
    EN: {
      med: 'Medicine',
      qty: 'Qty',
      inst: 'Dosage Instructions',
      diet: 'Dietary Advice:',
      mor: 'Morning',
      noon: 'Noon',
      eve: 'Evening',
      ngt: 'Night',
      bf: 'Before Food',
      af: 'After Food',
    },
    GU: {
      med: 'દવા',
      qty: 'માત્રા',
      inst: 'લેવાની રીત',
      diet: 'ખાવાની પરેજી:',
      mor: 'સવારે',
      noon: 'બપોરે',
      eve: 'સાંજે',
      ngt: 'રાત્રે',
      bf: 'જમ્યા પહેલા',
      af: 'જમ્યા પછી',
    },
    HI: {
      med: 'दवा',
      qty: 'मात्रा',
      inst: 'खुराक का विवरण',
      diet: 'आहार संबंधी सलाह:',
      mor: 'सुबह',
      noon: 'दोपहर',
      eve: 'शाम',
      ngt: 'रात',
      bf: 'खाने से पहले',
      af: 'खाने के बाद',
    },
  };

  const renderModalContent = () => {
    const t = I18N[currentLang];

    const parseDosage = (p) => {
      const parts = [];
      if (p.mor && p.mor !== '0') parts.push(`${p.mor} ${t.mor}`);
      if (p.noon && p.noon !== '0') parts.push(`${p.noon} ${t.noon}`);
      if (p.eve && p.eve !== '0') parts.push(`${p.eve} ${t.eve}`);
      if (p.ngt && p.ngt !== '0') parts.push(`${p.ngt} ${t.ngt}`);

      let timing = '';
      if (p.timing === 'BF') timing = ` (${t.bf})`;
      else if (p.timing === 'AF') timing = ` (${t.af})`;
      else if (p.timing && p.timing.trim()) timing = ` (${p.timing})`;

      if (parts.length === 0) return timing ? timing.trim() : '-';
      return parts.join(', ') + timing;
    };

    const renderDietaryText = () => {
      if (!dietaryInput.trim()) return '';
      const codes = dietaryInput.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
      const expanded = [];
      for (const c of codes) {
        if (db.dietary && db.dietary[c]) {
          expanded.push(db.dietary[c].text);
        } else {
          expanded.push(c);
        }
      }
      return expanded.join('\n\n');
    };

    modalOverlay.innerHTML = `
      <div class="cms-modal" style="width: 15.5cm; max-width: 95vw; padding: 0;" onclick="event.stopPropagation()">
        <!-- Top Toolbar (Hidden on Print) -->
        <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-bottom: 1px solid var(--border); background: var(--surface);">
          <div class="font-display" style="font-weight: 800; font-size: 15px;">
            Prescription Print Preview &middot; Case ${visit.caseId}
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <select id="modal-lang-select" class="cms-select cms-input-sm" style="width: 120px;">
              <option value="EN" ${currentLang === 'EN' ? 'selected' : ''}>English</option>
              <option value="GU" ${currentLang === 'GU' ? 'selected' : ''}>ગુજરાતી</option>
              <option value="HI" ${currentLang === 'HI' ? 'selected' : ''}>हिंदी</option>
            </select>
            <button type="button" id="modal-close-btn" class="cms-btn cms-btn-ghost" style="padding: 6px 10px;">✕</button>
          </div>
        </div>

        <!-- Dietary Advice Input Tool (Hidden on Print) -->
        <div class="no-print" style="padding: 12px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 14px; background: var(--surface-alt);">
          <div style="flex: 1;">
            <label class="cms-label" style="margin-bottom: 3px;">Dietary Advice Shortcut Codes</label>
            <input type="text" id="modal-dietary-input" class="cms-input cms-input-sm" placeholder="e.g. DB, SUGAR, BP, ACID, CV, LQ..." value="${dietaryInput}" />
          </div>
          <div style="text-align: right; margin-top: 14px;">
            <button type="button" id="modal-print-btn" class="cms-btn cms-btn-primary" style="padding: 8px 18px;">
              <span>🖨️</span>
              <span>Print A5 Letterpad</span>
            </button>
          </div>
        </div>

        <!-- Printable A5 Sheet Content Area -->
        <div id="cms-print-area" class="cms-print-preview-box">
          <!-- Doctor & Clinic Letterhead -->
          <div class="cms-print-header">
            <div>
              <div style="font-size: 26pt; font-weight: 800; color: #146B5C; letter-spacing: -0.5px; line-height: 1.1;">Dr. Chirag Paghdal</div>
              <div style="font-size: 13pt; font-weight: 800; color: #146B5C; letter-spacing: 0.5px;">
                FAMILY PHYSICIAN <span style="font-size: 10.5pt; color: #333; font-weight: bold;">(B.H.M.S.)</span>
              </div>
            </div>
            <div style="text-align: right; font-size: 9.5pt; color: #333; font-weight: bold; line-height: 1.4;">
              <div>Mo.: +91 98793 80508</div>
              <div>Reg. No. G-9035</div>
            </div>
          </div>

          <!-- Banner -->
          <div class="cms-print-banner">
            Dhyey Clinic &amp; Nursing Home : Shop No. 1, Mahavir Heights, New Kosad Road, Amroli, Surat.
          </div>

          <!-- Patient Header -->
          <div class="cms-print-patient-bar">
            <div>FOR: <span style="font-weight: 600; text-transform: uppercase;">${patient.name}</span> (Age: ${patient.age || '-'}, ${patient.bloodGroup || ''})</div>
            <div>DATE: <span style="font-weight: 600;">${fmtDate(visit.date)}</span> &middot; <span style="font-size: 10pt;">Case: ${visit.caseId}</span></div>
          </div>

          <!-- Clinical Vitals -->
          <div style="display: flex; gap: 16px; font-size: 10.5pt; color: #444; margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 6px;">
            ${visit.bp ? `<div>BP: <b>${visit.bp}</b></div>` : ''}
            ${visit.weight ? `<div>Weight: <b>${visit.weight} kg</b></div>` : ''}
            ${visit.sugar ? `<div>Blood Sugar: <b>${visit.sugar}</b></div>` : ''}
            ${visit.complaint ? `<div>Complaint: <b>${visit.complaint}</b></div>` : ''}
            ${visit.diagnosis ? `<div>Diagnosis: <b>${visit.diagnosis}</b></div>` : ''}
          </div>

          <!-- Prescription Table (Rx) -->
          <div style="flex: 1;">
            <div style="font-size: 18pt; font-weight: 900; font-family: 'Times New Roman', serif; color: #146B5C; margin-bottom: 4px;">℞</div>
            <table class="cms-print-table">
              <thead>
                <tr>
                  <th style="width: 40%; text-align: left;">${t.med}</th>
                  <th style="width: 15%; text-align: center;">${t.qty}</th>
                  <th style="width: 45%; text-align: left;">${t.inst}</th>
                </tr>
              </thead>
              <tbody>
                ${
                  (visit.prescription || []).length === 0
                    ? `<tr><td colspan="3" style="text-align: center; color: #666; padding: 12px;">No medicines prescribed.</td></tr>`
                    : (visit.prescription || [])
                        .map(
                          (p) => `
                        <tr>
                          <td>${p.name}</td>
                          <td style="text-align: center;">${p.qty}</td>
                          <td>${parseDosage(p)}</td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>

            <!-- Dietary Advice Block -->
            ${
              dietaryInput.trim()
                ? `
              <div style="margin-top: 18px; border-top: 1px dashed #ccc; padding-top: 8px;">
                <div style="font-size: 11pt; font-weight: bold; text-decoration: underline; margin-bottom: 4px;">${t.diet}</div>
                <div style="font-size: 10.5pt; white-space: pre-wrap; line-height: 1.5; color: #333;">${renderDietaryText()}</div>
              </div>
            `
                : ''
            }
          </div>

          <!-- Footer Chemist Note -->
          <div class="cms-print-footer">
            + Harsh Medical &amp; General Stores +
          </div>
        </div>
      </div>
    `;

    // Rebind Events
    const langSelect = modalOverlay.querySelector('#modal-lang-select');
    langSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      renderModalContent();
    });

    const dietaryEl = modalOverlay.querySelector('#modal-dietary-input');
    dietaryEl.addEventListener('input', (e) => {
      dietaryInput = e.target.value;
      const previewArea = modalOverlay.querySelector('#cms-print-area');
      // Re-render only text
    });
    dietaryEl.addEventListener('change', () => {
      renderModalContent();
    });

    const closeBtn = modalOverlay.querySelector('#modal-close-btn');
    closeBtn.addEventListener('click', () => {
      modalOverlay.remove();
      if (onClose) onClose();
    });

    const printBtn = modalOverlay.querySelector('#modal-print-btn');
    printBtn.addEventListener('click', () => {
      window.print();
    });
  };

  renderModalContent();
  document.body.appendChild(modalOverlay);
}
