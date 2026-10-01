/**
 * =========================================================
 * CLINIC REPORTS & ANALYTICS CONTROLLER
 * Day-wise, Patient-wise, Area-wise, Ref Dr, and Collections
 * =========================================================
 */

import { apiFetch, getLocalDB, getAuthSession, fmtDate, fmtMoney, todayISO } from './api.js';

export function renderReportsView(container) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  let activeTab = 'area'; // 'area' | 'refdr' | 'diagnosis' | 'patient' | 'collection'

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Reports Sub-nav -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button type="button" class="cms-btn ${activeTab === 'area' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-area"><i class="fa-solid fa-location-dot"></i> Area-wise</button>
        <button type="button" class="cms-btn ${activeTab === 'refdr' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-refdr"><i class="fa-solid fa-user-doctor"></i> Ref. Doctor</button>
        <button type="button" class="cms-btn ${activeTab === 'diagnosis' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-diag"><i class="fa-solid fa-stethoscope"></i> Diagnosis-wise</button>
        <button type="button" class="cms-btn ${activeTab === 'patient' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-pat"><i class="fa-solid fa-user"></i> Patient History</button>
        <button type="button" class="cms-btn ${activeTab === 'collection' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-col"><i class="fa-solid fa-indian-rupee-sign"></i> Daily Collections</button>
      </div>

      <!-- Report Content Card -->
      <div class="cms-card" id="rpt-content-box" style="padding: 20px;">
        <!-- Dynamic Report Body -->
      </div>
    </div>
  `;

  // Aggregate Data
  const families = Object.values(db.families || {});
  const allVisits = [];
  const allPatients = [];

  families.forEach((fam) => {
    Object.values(fam.patients || {}).forEach((pat) => {
      allPatients.push({ ...pat, famHead: fam.headName, famArea: fam.area });
      (pat.visits || []).forEach((v) => {
        allVisits.push({
          ...v,
          famHead: fam.headName,
          famArea: fam.area,
          patName: pat.name,
        });
      });
    });
  });

  const renderCurrentReport = () => {
    const box = container.querySelector('#rpt-content-box');

    if (activeTab === 'area') {
      const areaMap = {};
      families.forEach((f) => {
        const area = f.area || 'Unknown';
        if (!areaMap[area]) areaMap[area] = { families: 0, patients: 0, visits: 0 };
        areaMap[area].families += 1;
        areaMap[area].patients += Object.keys(f.patients || {}).length;
      });

      allVisits.forEach((v) => {
        const a = v.famArea || 'Unknown';
        if (areaMap[a]) areaMap[a].visits += 1;
      });

      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title">Area-wise Patient &amp; Family Distribution</div>
        </div>
        <div class="cms-table-wrapper">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Area / Locality</th>
                <th>Registered Families</th>
                <th>Total Patients</th>
                <th>Total Consultations</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(areaMap)
                .map(
                  ([area, data]) => `
                <tr>
                  <td><b>${area}</b></td>
                  <td class="font-mono">${data.families}</td>
                  <td class="font-mono">${data.patients}</td>
                  <td class="font-mono">${data.visits}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'refdr') {
      const drMap = {};
      allVisits.forEach((v) => {
        const dr = v.reference || 'Self';
        drMap[dr] = (drMap[dr] || 0) + 1;
      });

      const maxCount = Math.max(...Object.values(drMap), 1);

      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title">Visits by Referring Doctor</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${Object.entries(drMap)
            .map(
              ([dr, count]) => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 6px;">
                <span style="font-weight: 700;">${dr}</span>
                <span class="font-mono" style="font-weight: 800; color: var(--primary);">${count} Visits</span>
              </div>
              <div style="height: 10px; border-radius: 6px; background: var(--surface-alt); overflow: hidden;">
                <div style="height: 10px; border-radius: 6px; background: var(--primary); width: ${(count / maxCount) * 100}%;"></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else if (activeTab === 'diagnosis') {
      const diagMap = {};
      allVisits.forEach((v) => {
        const d = v.diagnosis || 'Unspecified';
        diagMap[d] = (diagMap[d] || 0) + 1;
      });

      const sorted = Object.entries(diagMap).sort((a, b) => b[1] - a[1]);
      const maxCount = sorted.length > 0 ? sorted[0][1] : 1;

      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title">Visits by Diagnosis Frequency</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${sorted
            .map(
              ([diag, count]) => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 6px;">
                <span style="font-weight: 700;">${diag}</span>
                <span class="font-mono" style="font-weight: 800; color: var(--accent);">${count} Cases</span>
              </div>
              <div style="height: 10px; border-radius: 6px; background: var(--surface-alt); overflow: hidden;">
                <div style="height: 10px; border-radius: 6px; background: var(--accent); width: ${(count / maxCount) * 100}%;"></div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else if (activeTab === 'patient') {
      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title">Patient Visit History Finder</div>
        </div>
        <input type="text" id="rpt-pat-search" class="cms-input" placeholder="Type patient name or ID to filter visit history..." style="margin-bottom: 14px;" />
        <div class="cms-table-wrapper">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Case ID</th>
                <th>Patient Name</th>
                <th>Diagnosis</th>
                <th>Complaint</th>
                <th>Charge</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody id="rpt-pat-tbody">
              ${allVisits
                .map(
                  (v) => `
                <tr>
                  <td class="font-mono">${fmtDate(v.date)}</td>
                  <td class="font-mono" style="font-weight: 700; color: var(--primary);">${v.caseId}</td>
                  <td><b>${v.patName}</b></td>
                  <td><span class="cms-pill cms-badge-neutral">${v.diagnosis || '-'}</span></td>
                  <td>${v.complaint || '-'}</td>
                  <td class="font-mono">${fmtMoney(v.charge)}</td>
                  <td class="font-mono" style="color: var(--success); font-weight: 700;">${fmtMoney(v.received)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;

      box.querySelector('#rpt-pat-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const tbody = box.querySelector('#rpt-pat-tbody');
        const filtered = allVisits.filter((v) => v.patName.toLowerCase().includes(q) || (v.caseId || '').includes(q));
        tbody.innerHTML = filtered
          .map(
            (v) => `
          <tr>
            <td class="font-mono">${fmtDate(v.date)}</td>
            <td class="font-mono" style="font-weight: 700; color: var(--primary);">${v.caseId}</td>
            <td><b>${v.patName}</b></td>
            <td><span class="cms-pill cms-badge-neutral">${v.diagnosis || '-'}</span></td>
            <td>${v.complaint || '-'}</td>
            <td class="font-mono">${fmtMoney(v.charge)}</td>
            <td class="font-mono" style="color: var(--success); font-weight: 700;">${fmtMoney(v.received)}</td>
          </tr>
        `
          )
          .join('');
      });
    } else if (activeTab === 'collection') {
      const todayVisits = allVisits.filter((v) => Number(v.received) > 0);
      const totalCollected = todayVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);

      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title">Payment Collections Log</div>
          <div class="font-mono" style="font-size: 18px; font-weight: 800; color: var(--success);">
            Total: ${fmtMoney(totalCollected)}
          </div>
        </div>
        <div class="cms-table-wrapper">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Case ID</th>
                <th>Patient</th>
                <th>Family Head</th>
                <th>Received Amount</th>
              </tr>
            </thead>
            <tbody>
              ${todayVisits
                .map(
                  (v) => `
                <tr>
                  <td class="font-mono">${fmtDate(v.date)}</td>
                  <td class="font-mono" style="font-weight: 700;">${v.caseId}</td>
                  <td><b>${v.patName}</b></td>
                  <td>${v.famHead}</td>
                  <td class="font-mono" style="color: var(--success); font-weight: 800;">${fmtMoney(v.received)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  };

  // Attach Sub-nav Tab Listeners
  container.querySelector('#rpt-tab-area').addEventListener('click', () => {
    activeTab = 'area';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-refdr').addEventListener('click', () => {
    activeTab = 'refdr';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-diag').addEventListener('click', () => {
    activeTab = 'diagnosis';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-pat').addEventListener('click', () => {
    activeTab = 'patient';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-col').addEventListener('click', () => {
    activeTab = 'collection';
    updateActiveButtons();
    renderCurrentReport();
  });

  function updateActiveButtons() {
    container.querySelectorAll('[id^="rpt-tab-"]').forEach((btn) => {
      btn.className = 'cms-btn cms-btn-ghost';
    });
    const current = container.querySelector(`#rpt-tab-${activeTab === 'collection' ? 'col' : activeTab === 'diagnosis' ? 'diag' : activeTab === 'patient' ? 'pat' : activeTab}`);
    if (current) current.className = 'cms-btn cms-btn-primary';
  }

  renderCurrentReport();
}
