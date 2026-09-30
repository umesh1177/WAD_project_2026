/**
 * =========================================================
 * MEDICAL HISTORY & LAB REPORT MODAL CONTROLLER
 * =========================================================
 */

import { apiFetch, showToast } from './api.js';

export function openLabReportModal(patient, visit, initialData = {}, onSave, onClose) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'cms-overlay';
  modalOverlay.style.zIndex = '9999';

  let activeTab = 'hematology';
  let formData = { ...(initialData || {}) };

  const renderContent = () => {
    modalOverlay.innerHTML = `
      <div class="cms-modal" style="width: 820px; max-width: 95vw; padding: 0;" onclick="event.stopPropagation()">
        <!-- Header -->
        <div style="background: var(--surface); padding: 14px 20px; border-bottom: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div class="font-display" style="font-weight: 800; font-size: 16px; color: var(--primary);">
              Laboratory Investigation Reports &middot; ${patient ? patient.name : 'Patient'}
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">
              Case: ${visit ? visit.caseId : 'New Entry'} &middot; Date: ${visit ? visit.date : 'Today'}
            </div>
          </div>
          <button type="button" id="lab-close-x" class="cms-btn-ghost" style="padding: 4px 8px;">✕</button>
        </div>

        <!-- Meta Inputs -->
        <div style="padding: 12px 20px; background: var(--surface-alt); border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 1.5fr 1.5fr 1fr; gap: 12px;">
          <div class="cms-form-group">
            <label class="cms-label">Lab Name</label>
            <input type="text" id="lab-name-input" class="cms-input cms-input-sm" value="${formData.labName || ''}" placeholder="e.g. Surat Diagnostic Centre" />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">Pathologist / Dr. Name</label>
            <input type="text" id="lab-dr-input" class="cms-input cms-input-sm" value="${formData.drName || ''}" placeholder="e.g. Dr. K. Mehta" />
          </div>
          <div class="cms-form-group">
            <label class="cms-label">Report Date</label>
            <input type="date" id="lab-date-input" class="cms-input cms-input-sm" value="${formData.reportDate || (visit ? visit.date : '')}" />
          </div>
        </div>

        <!-- Tabs -->
        <div style="display: flex; gap: 4px; padding: 10px 20px 0; background: var(--surface-alt); border-bottom: 2px solid var(--border);">
          <button type="button" class="cms-btn ${activeTab === 'hematology' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="tab-btn-hemo" style="border-radius: 8px 8px 0 0; padding: 6px 14px; font-size: 13px;">Hematology (CBC)</button>
          <button type="button" class="cms-btn ${activeTab === 'biochem' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="tab-btn-bio" style="border-radius: 8px 8px 0 0; padding: 6px 14px; font-size: 13px;">Biochemistry &amp; Sugar</button>
          <button type="button" class="cms-btn ${activeTab === 'thyroid' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="tab-btn-thy" style="border-radius: 8px 8px 0 0; padding: 6px 14px; font-size: 13px;">Thyroid Profile</button>
        </div>

        <!-- Tab Content Body -->
        <div style="padding: 20px; max-height: 50vh; overflow-y: auto; background: var(--surface);">
          ${
            activeTab === 'hematology'
              ? `
            <table class="cms-lab-table">
              <thead>
                <tr>
                  <th style="text-align: right; width: 160px;">Parameter</th>
                  <th style="text-align: center; width: 120px;">Result</th>
                  <th style="text-align: left;">Normal Reference Range</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="param-name">Hemoglobin (Hb)</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="hemo" value="${formData.hemo || ''}" placeholder="gm%" /></td>
                  <td class="param-range">12.0 - 16.0 gm%</td>
                </tr>
                <tr>
                  <td class="param-name">RBC Count</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="rbc" value="${formData.rbc || ''}" placeholder="mill/cmm" /></td>
                  <td class="param-range">4.2 - 5.4 mill /c.mm</td>
                </tr>
                <tr>
                  <td class="param-name">Total WBC Count</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="wbc" value="${formData.wbc || ''}" placeholder="/cmm" /></td>
                  <td class="param-range">4,000 - 10,000 /c.mm</td>
                </tr>
                <tr>
                  <td class="param-name">Platelet Count</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="platelets" value="${formData.platelets || ''}" placeholder="/cmm" /></td>
                  <td class="param-range">1,50,000 - 4,00,000 /c.mm</td>
                </tr>
                <tr>
                  <td class="param-name">ESR (1st Hr)</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="esr" value="${formData.esr || ''}" placeholder="mm/hr" /></td>
                  <td class="param-range">2 - 20 mm/hr</td>
                </tr>
                <tr>
                  <td colspan="3" style="font-weight: 800; font-size: 13px; color: var(--primary); padding-top: 14px;">Differential Leukocyte Count (DLC)</td>
                </tr>
                <tr>
                  <td class="param-name">Neutrophils</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="neutrophils" value="${formData.neutrophils || ''}" placeholder="%" /></td>
                  <td class="param-range">55 - 70 %</td>
                </tr>
                <tr>
                  <td class="param-name">Lymphocytes</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="lymphocytes" value="${formData.lymphocytes || ''}" placeholder="%" /></td>
                  <td class="param-range">20 - 40 %</td>
                </tr>
                <tr>
                  <td class="param-name">Eosinophils</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="eosinophils" value="${formData.eosinophils || ''}" placeholder="%" /></td>
                  <td class="param-range">1 - 6 %</td>
                </tr>
              </tbody>
            </table>
          `
              : activeTab === 'biochem'
              ? `
            <table class="cms-lab-table">
              <thead>
                <tr>
                  <th style="text-align: right; width: 160px;">Parameter</th>
                  <th style="text-align: center; width: 120px;">Result</th>
                  <th style="text-align: left;">Normal Reference Range</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="param-name">Random Blood Sugar (RBS)</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="rbs" value="${formData.rbs || ''}" placeholder="mg/dl" /></td>
                  <td class="param-range">Up to 140 mg/dl</td>
                </tr>
                <tr>
                  <td class="param-name">Fasting Blood Sugar (FBS)</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="fbs" value="${formData.fbs || ''}" placeholder="mg/dl" /></td>
                  <td class="param-range">70 - 100 mg/dl</td>
                </tr>
                <tr>
                  <td class="param-name">Post Prandial Sugar (PPBS)</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="ppbs" value="${formData.ppbs || ''}" placeholder="mg/dl" /></td>
                  <td class="param-range">Up to 140 mg/dl</td>
                </tr>
                <tr>
                  <td class="param-name">Serum Creatinine</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="creatinine" value="${formData.creatinine || ''}" placeholder="mg/dl" /></td>
                  <td class="param-range">0.5 - 1.5 mg/dl</td>
                </tr>
                <tr>
                  <td class="param-name">Vitamin B12</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="vitb12" value="${formData.vitb12 || ''}" placeholder="pg/ml" /></td>
                  <td class="param-range">200 - 900 pg/ml</td>
                </tr>
              </tbody>
            </table>
          `
              : `
            <table class="cms-lab-table">
              <thead>
                <tr>
                  <th style="text-align: right; width: 160px;">Parameter</th>
                  <th style="text-align: center; width: 120px;">Result</th>
                  <th style="text-align: left;">Normal Reference Range</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="param-name">Total T3</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="t3" value="${formData.t3 || ''}" placeholder="ng/ml" /></td>
                  <td class="param-range">82 - 200 ng/ml</td>
                </tr>
                <tr>
                  <td class="param-name">Total T4</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="t4" value="${formData.t4 || ''}" placeholder="mcg%" /></td>
                  <td class="param-range">4.5 - 12.5 mcg%</td>
                </tr>
                <tr>
                  <td class="param-name">TSH (Ultrasensitive)</td>
                  <td class="param-val"><input type="text" class="cms-input cms-input-sm lab-fld" data-key="tsh" value="${formData.tsh || ''}" placeholder="mlu/ml" /></td>
                  <td class="param-range">0.4 - 6.0 mlu/ml</td>
                </tr>
              </tbody>
            </table>
          `
          }
        </div>

        <!-- Footer -->
        <div class="cms-modal-footer">
          <button type="button" id="lab-cancel-btn" class="cms-btn cms-btn-ghost">Cancel</button>
          <button type="button" id="lab-save-btn" class="cms-btn cms-btn-primary">
            <span>💾</span>
            <span>Save Lab Results</span>
          </button>
        </div>
      </div>
    `;

    // Listeners
    modalOverlay.querySelector('#lab-name-input').addEventListener('input', (e) => (formData.labName = e.target.value));
    modalOverlay.querySelector('#lab-dr-input').addEventListener('input', (e) => (formData.drName = e.target.value));
    modalOverlay.querySelector('#lab-date-input').addEventListener('input', (e) => (formData.reportDate = e.target.value));

    modalOverlay.querySelectorAll('.lab-fld').forEach((fld) => {
      fld.addEventListener('input', (e) => (formData[fld.dataset.key] = e.target.value));
    });

    modalOverlay.querySelector('#tab-btn-hemo').addEventListener('click', () => {
      activeTab = 'hematology';
      renderContent();
    });
    modalOverlay.querySelector('#tab-btn-bio').addEventListener('click', () => {
      activeTab = 'biochem';
      renderContent();
    });
    modalOverlay.querySelector('#tab-btn-thy').addEventListener('click', () => {
      activeTab = 'thyroid';
      renderContent();
    });

    modalOverlay.querySelector('#lab-close-x').addEventListener('click', () => {
      modalOverlay.remove();
      if (onClose) onClose();
    });
    modalOverlay.querySelector('#lab-cancel-btn').addEventListener('click', () => {
      modalOverlay.remove();
      if (onClose) onClose();
    });

    modalOverlay.querySelector('#lab-save-btn').addEventListener('click', () => {
      if (onSave) onSave(formData);
      showToast('Lab report saved');
      modalOverlay.remove();
    });
  };

  renderContent();
  document.body.appendChild(modalOverlay);
}
