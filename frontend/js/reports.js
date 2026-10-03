/**
 * =========================================================
 * CLINIC REPORTS & FINANCIAL ANALYTICS CONTROLLER
 * Comprehensive Real-Time Database Reports:
 * 1) Area-wise Patient Population & Due Balances
 * 2) Referring Doctor Consultation & Referral Summary
 * 3) Complete Patient History Finder (All historical records)
 * 4) Daily Payment Collections Log
 * 5) Monthly Financial Income & Filtered Statement
 * =========================================================
 */

import { apiFetch, getAuthSession, fmtDate, fmtMoney, todayISO } from './api.js';

export async function renderReportsView(container) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';

  let activeTab = 'area'; // 'area' | 'refdr' | 'patient' | 'collection' | 'monthly'

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Reports Sub-nav -->
      <div class="no-print" style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="cms-btn ${activeTab === 'area' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-area"><i class="fa-solid fa-location-dot"></i> Area-wise</button>
          <button type="button" class="cms-btn ${activeTab === 'refdr' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-refdr"><i class="fa-solid fa-user-doctor"></i> Ref. Doctor</button>
          <button type="button" class="cms-btn ${activeTab === 'patient' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-pat"><i class="fa-solid fa-user-clock"></i> Patient History</button>
          <button type="button" class="cms-btn ${activeTab === 'collection' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-col"><i class="fa-solid fa-indian-rupee-sign"></i> Daily Collections</button>
          <button type="button" class="cms-btn ${activeTab === 'monthly' ? 'cms-btn-primary' : 'cms-btn-ghost'}" id="rpt-tab-monthly"><i class="fa-solid fa-calendar-days"></i> Monthly Income</button>
        </div>
        <button type="button" class="cms-btn cms-btn-outline" onclick="const s = document.createElement('style'); s.innerHTML = '@page { size: A4 landscape !important; margin: 12mm !important; }'; document.head.appendChild(s); window.print(); setTimeout(() => s.remove(), 1000);">
          <i class="fa-solid fa-print"></i> Print Report
        </button>
      </div>

      <!-- Report Content Card -->
      <div id="cms-report-print-area" style="width: 100%;">
        <div class="cms-card" id="rpt-content-box" style="padding: 20px;">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 8px;"></i>
            <div>Loading live clinic reports from database...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Aggregate Data from API
  let allPatients = [];
  let allVisits = [];

  try {
    const [fRes, pRes, cRes] = await Promise.all([
      apiFetch('/families').catch(() => ({ data: [] })),
      apiFetch('/patients').catch(() => ({ data: [] })),
      apiFetch('/consultations').catch(() => ({ data: [] }))
    ]);

    const famMap = {};
    (fRes?.data || []).forEach((f) => {
      const fid = f.famId || f._id || f.id;
      famMap[fid] = f;
      if (f._id) famMap[String(f._id)] = f;
      if (f.famId) famMap[String(f.famId)] = f;
    });

    const patMap = {};
    (pRes?.data || []).forEach((p) => {
      const famKey = p.familyId ? (p.familyId.famId || p.familyId._id || p.familyId) : null;
      const fam = famMap[famKey] || famMap[p.familyId] || {};
      const patId = p.patId || p.id || p._id || '';

      const patObj = {
        ...p,
        id: patId,
        patId: patId,
        name: p.name || 'Patient',
        relation: p.relation || 'Head',
        phone: p.phone || fam.phone || '',
        famHead: fam.headName || fam.name || (p.relation === 'Head' ? p.name : 'Family Head'),
        famArea: fam.area || fam.society || p.area || p.society || 'General',
        visits: []
      };

      allPatients.push(patObj);
      if (patId) patMap[patId] = patObj;
      if (p._id) patMap[String(p._id)] = patObj;
      if (p.id) patMap[p.id] = patObj;
    });

    (cRes?.data || []).forEach((c) => {
      const cPatId = String(c.patientId?._id || c.patientId?.patId || c.patientId || '').trim();
      const cCaseId = String(c.caseId || '').trim();
      
      let matchedPat = patMap[cPatId] || allPatients.find(
        (p) =>
          (cPatId && (p.patId === cPatId || String(p._id) === cPatId || p.id === cPatId)) ||
          (p.patId && cCaseId.startsWith(p.patId))
      );

      const charge = Number(c.charge || 0);
      const received = Number(c.received !== undefined ? c.received : (c.paid !== undefined ? c.paid : 0));
      const due = Math.max(0, charge - received);

      const vObj = {
        ...c,
        id: c._id || c.caseId || c.id,
        caseId: c.caseId || c._id || c.id,
        date: (c.date || '').slice(0, 10),
        time: c.time || '',
        charge,
        received,
        paid: received,
        due,
        patId: matchedPat?.patId || cPatId || '—',
        patName: matchedPat?.name || c.patientName || 'Patient',
        famHead: matchedPat?.famHead || c.familyHead || 'Family Head',
        famArea: matchedPat?.famArea || c.area || 'General',
        refDr: c.refDr || c.reference || 'Self / Direct',
        complaint: c.complaint || '',
        diagnosis: c.diagnosis || ''
      };

      allVisits.push(vObj);
      if (matchedPat) {
        matchedPat.visits.push(vObj);
      }
    });

    // Calculate totals for each patient
    allPatients.forEach((p) => {
      p.visits.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      p.totalBilled = p.visits.reduce((s, v) => s + Number(v.charge || 0), 0);
      p.totalPaid = p.visits.reduce((s, v) => s + Number(v.received || 0), 0);
      p.totalDue = Math.max(0, p.totalBilled - p.totalPaid);
    });

    allVisits.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } catch (e) {
    console.warn('Reports load error:', e);
  }

  const renderCurrentReport = () => {
    const box = container.querySelector('#rpt-content-box');
    if (!box) return;

    if (activeTab === 'area') {
      const grandTotalBilled = allPatients.reduce((s, p) => s + p.totalBilled, 0);
      const grandTotalPaid = allPatients.reduce((s, p) => s + p.totalPaid, 0);
      const grandTotalDue = allPatients.reduce((s, p) => s + p.totalDue, 0);

      box.innerHTML = `
        <div class="cms-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div class="cms-card-title"><i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> Area-wise Patient Population & Due Balances</div>
        </div>

        <!-- Summary KPIs -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid var(--border); padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Total Patients</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${allPatients.length}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #166534; font-weight: 700;">Total Collections</div>
            <div style="font-size: 18px; font-weight: 800; color: #15803d;">${fmtMoney(grandTotalPaid)}</div>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #991b1b; font-weight: 700;">Total Outstanding Due</div>
            <div style="font-size: 18px; font-weight: 800; color: #dc2626;">${fmtMoney(grandTotalDue)}</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 220px;">
            <input type="text" id="rpt-area-search" class="cms-input" placeholder="Search by area name or patient..." />
          </div>
        </div>
        <div id="rpt-area-results" style="display: flex; flex-direction: column; gap: 20px;">
        </div>
      `;

      const renderAreaResults = () => {
        const areaQuery = (box.querySelector('#rpt-area-search')?.value || '').toLowerCase().trim();
        const areaMap = {};

        allPatients.forEach((pat) => {
          const area = pat.famArea || 'General / Unknown';
          if (areaQuery && !area.toLowerCase().includes(areaQuery) && !pat.name.toLowerCase().includes(areaQuery)) return;

          if (!areaMap[area]) {
            areaMap[area] = [];
          }
          areaMap[area].push(pat);
        });

        const resultsContainer = box.querySelector('#rpt-area-results');
        if (!resultsContainer) return;

        if (Object.keys(areaMap).length === 0) {
          resultsContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border); border-radius: 8px;">No records found for the selected search filter.</div>';
          return;
        }

        resultsContainer.innerHTML = Object.entries(areaMap)
          .map(([area, patients]) => {
            const areaBilled = patients.reduce((s, p) => s + p.totalBilled, 0);
            const areaPaid = patients.reduce((s, p) => s + p.totalPaid, 0);
            const areaDue = patients.reduce((s, p) => s + p.totalDue, 0);

            return `
            <div class="cms-card" style="padding: 16px; background: var(--surface); border: 1px solid var(--border);">
              <div style="font-size: 15px; font-weight: 800; color: var(--primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span><i class="fa-solid fa-location-dot" style="margin-right: 8px;"></i>${area} (${patients.length} Patients)</span>
                <div style="font-size: 12px; font-family: var(--font-mono); font-weight: 700;">
                  <span style="color: #15803d; margin-right: 12px;">Collected: ${fmtMoney(areaPaid)}</span>
                  <span style="color: ${areaDue > 0 ? '#dc2626' : 'var(--text-muted)'};">Due: ${fmtMoney(areaDue)}</span>
                </div>
              </div>
              <div class="cms-table-wrapper">
                <table class="cms-table">
                  <thead>
                    <tr>
                      <th style="width: 140px;">Patient ID</th>
                      <th>Patient Name</th>
                      <th style="width: 90px;">Relation</th>
                      <th>Family Head</th>
                      <th style="width: 110px;">Phone</th>
                      <th style="width: 70px; text-align: center;">Visits</th>
                      <th style="text-align: right; width: 95px;">Billed</th>
                      <th style="text-align: right; width: 95px;">Paid</th>
                      <th style="text-align: right; width: 95px;">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${patients
                      .map(
                        (p) => `
                      <tr>
                        <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">PT ${p.patId || p.id}</td>
                        <td><b>${p.name}</b></td>
                        <td>${p.relation || 'Head'}</td>
                        <td>${p.famHead}</td>
                        <td class="font-mono">${p.phone || '—'}</td>
                        <td style="text-align: center;"><span class="cms-pill cms-badge-neutral font-mono">${p.visits.length}</span></td>
                        <td class="font-mono" style="text-align: right;">${fmtMoney(p.totalBilled)}</td>
                        <td class="font-mono" style="text-align: right; color: #15803d; font-weight: 700;">${fmtMoney(p.totalPaid)}</td>
                        <td class="font-mono" style="text-align: right; font-weight: 800; color: ${p.totalDue > 0 ? '#dc2626' : 'var(--text-muted)'};">
                          ${p.totalDue > 0 ? fmtMoney(p.totalDue) : 'Nil'}
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
          })
          .join('');
      };

      box.querySelector('#rpt-area-search')?.addEventListener('input', renderAreaResults);
      renderAreaResults();
    } else if (activeTab === 'refdr') {
      const grandTotalColl = allVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
      const grandTotalDue = allVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);

      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title"><i class="fa-solid fa-user-doctor" style="color: var(--primary);"></i> Referring Doctor Consultation & Referral Summary</div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <input type="text" id="rpt-ref-dr-search" class="cms-input" placeholder="Search by Referring Doctor..." />
          </div>
          <div style="flex: 1; min-width: 200px;">
            <input type="text" id="rpt-ref-pat-search" class="cms-input" placeholder="Search by Patient Name..." />
          </div>
        </div>
        <div id="rpt-ref-results" style="display: flex; flex-direction: column; gap: 20px;">
        </div>
      `;

      const renderRefResults = () => {
        const drQuery = (box.querySelector('#rpt-ref-dr-search')?.value || '').toLowerCase().trim();
        const patQuery = (box.querySelector('#rpt-ref-pat-search')?.value || '').toLowerCase().trim();

        const drMap = {};
        allVisits.forEach((v) => {
          const doc = v.refDr || v.reference || 'Self / Direct';
          if (drQuery && !doc.toLowerCase().includes(drQuery)) return;
          if (patQuery && !v.patName.toLowerCase().includes(patQuery)) return;

          if (!drMap[doc]) drMap[doc] = [];
          drMap[doc].push(v);
        });

        const resultsContainer = box.querySelector('#rpt-ref-results');
        if (!resultsContainer) return;

        if (Object.keys(drMap).length === 0) {
          resultsContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border); border-radius: 8px;">No referral records found for the selected search filters.</div>';
          return;
        }

        resultsContainer.innerHTML = Object.entries(drMap)
          .map(([doc, visits]) => {
            const totalFee = visits.reduce((s, v) => s + (Number(v.charge) || 0), 0);
            const totalRec = visits.reduce((s, v) => s + (Number(v.received) || 0), 0);
            const totalDue = visits.reduce((s, v) => s + (Number(v.due) || 0), 0);

            return `
            <div class="cms-card" style="padding: 16px; background: var(--surface); border: 1px solid var(--border);">
              <div style="font-size: 15px; font-weight: 800; color: var(--primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span><i class="fa-solid fa-user-doctor" style="margin-right: 8px;"></i>${doc} (${visits.length} Visits)</span>
                <div style="font-size: 12px; font-family: var(--font-mono); font-weight: 700;">
                  <span style="color: #15803d; margin-right: 12px;">Collected: ${fmtMoney(totalRec)}</span>
                  <span style="color: ${totalDue > 0 ? '#dc2626' : 'var(--text-muted)'};">Due: ${fmtMoney(totalDue)}</span>
                </div>
              </div>
              <div class="cms-table-wrapper">
                <table class="cms-table">
                  <thead>
                    <tr>
                      <th style="width: 90px;">Date</th>
                      <th style="width: 120px;">Case ID</th>
                      <th>Patient Name</th>
                      <th>Diagnosis</th>
                      <th style="text-align: right; width: 90px;">Charge</th>
                      <th style="text-align: right; width: 90px;">Collected</th>
                      <th style="text-align: right; width: 90px;">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${visits
                      .map(
                        (v) => `
                      <tr>
                        <td class="font-mono">${fmtDate(v.date)}</td>
                        <td class="font-mono" style="font-weight: 700; color: var(--primary);">${v.caseId}</td>
                        <td><b>${v.patName}</b> <span style="font-size: 11px; color: var(--text-muted);">&middot; PT ${v.patId}</span></td>
                        <td><span class="cms-pill cms-badge-neutral">${v.diagnosis || '—'}</span></td>
                        <td class="font-mono" style="text-align: right;">${fmtMoney(v.charge)}</td>
                        <td class="font-mono" style="text-align: right; color: #15803d; font-weight: 700;">${fmtMoney(v.received)}</td>
                        <td class="font-mono" style="text-align: right; color: ${v.due > 0 ? '#dc2626' : 'var(--text-muted)'}; font-weight: 700;">
                          ${v.due > 0 ? fmtMoney(v.due) : 'Nil'}
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
          })
          .join('');
      };

      box.querySelector('#rpt-ref-dr-search')?.addEventListener('input', renderRefResults);
      box.querySelector('#rpt-ref-pat-search')?.addEventListener('input', renderRefResults);
      renderRefResults();
    } else if (activeTab === 'patient') {
      const grandTotalColl = allVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
      const grandTotalDue = allVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);
      const grandTotalBilled = allVisits.reduce((s, v) => s + (Number(v.charge) || 0), 0);

      box.innerHTML = `
        <div class="cms-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div class="cms-card-title"><i class="fa-solid fa-user-clock" style="color: var(--primary);"></i> Complete Patient Visit History Finder</div>
        </div>

        <!-- Summary KPIs -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid var(--border); padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Total Clinical Visits Recorded</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);" id="rpt-pat-total-count">${allVisits.length}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #166534; font-weight: 700;">Total Fees Collected</div>
            <div style="font-size: 18px; font-weight: 800; color: #15803d;" id="rpt-pat-total-paid">${fmtMoney(grandTotalColl)}</div>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #991b1b; font-weight: 700;">Total Pending Due</div>
            <div style="font-size: 18px; font-weight: 800; color: #dc2626;" id="rpt-pat-total-due">${fmtMoney(grandTotalDue)}</div>
          </div>
        </div>

        <input type="text" id="rpt-pat-search" class="cms-input" placeholder="Type patient name, Patient ID (PT ...), Case ID, or diagnosis..." style="margin-bottom: 14px;" />
        
        <div class="cms-table-wrapper">
          <table class="cms-table">
            <thead>
              <tr>
                <th style="width: 90px;">Date</th>
                <th style="width: 130px;">Case ID</th>
                <th>Patient Name</th>
                <th>Family Head</th>
                <th>Diagnosis</th>
                <th>Complaint</th>
                <th style="text-align: right; width: 90px;">Fee</th>
                <th style="text-align: right; width: 90px;">Paid</th>
                <th style="text-align: right; width: 90px;">Due</th>
              </tr>
            </thead>
            <tbody id="rpt-pat-tbody">
            </tbody>
          </table>
        </div>
      `;

      const renderPatientHistoryTable = () => {
        const q = (box.querySelector('#rpt-pat-search')?.value || '').toLowerCase().trim();
        const tbody = box.querySelector('#rpt-pat-tbody');
        if (!tbody) return;

        const filtered = allVisits.filter(
          (v) =>
            !q ||
            v.patName.toLowerCase().includes(q) ||
            v.caseId.toLowerCase().includes(q) ||
            v.patId.toLowerCase().includes(q) ||
            (v.famHead || '').toLowerCase().includes(q) ||
            (v.diagnosis || '').toLowerCase().includes(q) ||
            (v.complaint || '').toLowerCase().includes(q)
        );

        const curBilled = filtered.reduce((s, v) => s + (Number(v.charge) || 0), 0);
        const curPaid = filtered.reduce((s, v) => s + (Number(v.received) || 0), 0);
        const curDue = filtered.reduce((s, v) => s + (Number(v.due) || 0), 0);

        const countEl = box.querySelector('#rpt-pat-total-count');
        const paidEl = box.querySelector('#rpt-pat-total-paid');
        const dueEl = box.querySelector('#rpt-pat-total-due');
        if (countEl) countEl.textContent = filtered.length;
        if (paidEl) paidEl.textContent = fmtMoney(curPaid);
        if (dueEl) dueEl.textContent = fmtMoney(curDue);

        if (filtered.length === 0) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 30px; color: var(--text-muted);">No consultation visits found matching your search.</td></tr>`;
          return;
        }

        tbody.innerHTML = filtered
          .map(
            (v) => `
          <tr>
            <td class="font-mono">${fmtDate(v.date)}</td>
            <td class="font-mono" style="font-weight: 800; color: var(--primary);">${v.caseId}</td>
            <td>
              <b>${v.patName}</b>
              <div style="font-size: 11px; color: var(--text-muted);">PT ${v.patId}</div>
            </td>
            <td>${v.famHead}</td>
            <td><span class="cms-pill cms-badge-neutral">${v.diagnosis || '—'}</span></td>
            <td>${v.complaint || '—'}</td>
            <td class="font-mono" style="text-align: right;">${fmtMoney(v.charge)}</td>
            <td class="font-mono" style="text-align: right; color: #15803d; font-weight: 700;">${fmtMoney(v.received)}</td>
            <td class="font-mono" style="text-align: right; font-weight: 800; color: ${v.due > 0 ? '#dc2626' : 'var(--text-muted)'};">
              ${v.due > 0 ? fmtMoney(v.due) : 'Nil'}
            </td>
          </tr>
        `
          )
          .join('');
      };

      box.querySelector('#rpt-pat-search')?.addEventListener('input', renderPatientHistoryTable);
      renderPatientHistoryTable();
    } else if (activeTab === 'collection') {
      box.innerHTML = `
        <div class="cms-card-header" style="justify-content: space-between; align-items: center; display: flex; flex-wrap: wrap; gap: 14px;">
          <div class="cms-card-title"><i class="fa-solid fa-indian-rupee-sign" style="color: #15803d;"></i> Daily Payment Collections & Transactions Log</div>
          <div>
            <input type="date" id="rpt-col-date" class="cms-input" style="width: auto;" value="${todayISO()}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #166534; font-weight: 700;">Total Collections on Date</div>
            <div style="font-size: 20px; font-weight: 800; color: #15803d;" id="rpt-col-summary">₹0</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid var(--border); padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Total Billed Amount</div>
            <div style="font-size: 20px; font-weight: 800; color: var(--primary);" id="rpt-col-billed">₹0</div>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #991b1b; font-weight: 700;">Remaining Due Left</div>
            <div style="font-size: 20px; font-weight: 800; color: #dc2626;" id="rpt-col-due">₹0</div>
          </div>
        </div>

        <div class="cms-table-wrapper" id="rpt-col-wrapper">
        </div>
      `;

      const renderCollection = () => {
        const dateQuery = box.querySelector('#rpt-col-date')?.value || todayISO();
        const visits = allVisits.filter((v) => (v.date || '').slice(0, 10) === dateQuery);

        const totalCollected = visits.reduce((s, v) => s + (Number(v.received) || 0), 0);
        const totalBilled = visits.reduce((s, v) => s + (Number(v.charge) || 0), 0);
        const totalDue = visits.reduce((s, v) => s + (Number(v.due) || 0), 0);

        const summaryEl = box.querySelector('#rpt-col-summary');
        const billedEl = box.querySelector('#rpt-col-billed');
        const dueEl = box.querySelector('#rpt-col-due');
        if (summaryEl) summaryEl.innerText = fmtMoney(totalCollected);
        if (billedEl) billedEl.innerText = fmtMoney(totalBilled);
        if (dueEl) dueEl.innerText = fmtMoney(totalDue);

        const wrapper = box.querySelector('#rpt-col-wrapper');
        if (!wrapper) return;

        if (visits.length === 0) {
          wrapper.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border); border-radius: 8px;">No payment collections or consultation visits found on <b>${fmtDate(dateQuery)}</b>.</div>`;
          return;
        }

        wrapper.innerHTML = `
          <table class="cms-table">
            <thead>
              <tr>
                <th style="width: 85px;">Time</th>
                <th style="width: 130px;">Case ID</th>
                <th>Patient Name</th>
                <th>Family Head</th>
                <th>Area</th>
                <th style="text-align: right; width: 100px;">Fee Charged</th>
                <th style="text-align: right; width: 100px;">Received</th>
                <th style="text-align: right; width: 90px;">Due Left</th>
              </tr>
            </thead>
            <tbody>
              ${visits
                .map(
                  (v) => `
                <tr>
                  <td class="font-mono">${v.time || '—'}</td>
                  <td class="font-mono" style="font-weight: 800; color: var(--primary);">${v.caseId}</td>
                  <td><b>${v.patName}</b> <span style="font-size: 11px; color: var(--text-muted);">&middot; PT ${v.patId}</span></td>
                  <td>${v.famHead}</td>
                  <td>${v.famArea || '—'}</td>
                  <td class="font-mono" style="text-align: right;">${fmtMoney(v.charge)}</td>
                  <td class="font-mono" style="color: #15803d; font-weight: 800; text-align: right;">${fmtMoney(v.received)}</td>
                  <td class="font-mono" style="text-align: right; font-weight: ${v.due > 0 ? '800' : '500'}; color: ${v.due > 0 ? '#dc2626' : 'var(--text-muted)'};">
                    ${v.due > 0 ? fmtMoney(v.due) : 'Nil'}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      };

      box.querySelector('#rpt-col-date')?.addEventListener('change', renderCollection);
      renderCollection();
    } else if (activeTab === 'monthly') {
      box.innerHTML = `
        <div class="cms-card-header">
          <div class="cms-card-title"><i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i> Monthly Income & Financial Summary Report</div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; display: block;">Select Month</label>
            <input type="month" id="rpt-mon-month" class="cms-input" value="${todayISO().slice(0, 7)}" />
          </div>
          <div style="flex: 1; min-width: 150px;">
            <label style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; display: block;">Filter by Area</label>
            <input type="text" id="rpt-mon-area" class="cms-input" placeholder="All areas..." />
          </div>
          <div style="flex: 1; min-width: 180px; display: flex; align-items: flex-end; padding-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text); font-weight: 700; font-size: 13px;">
              <input type="checkbox" id="rpt-mon-due" style="width: 18px; height: 18px;" />
              Only show records with Due
            </label>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid var(--border); padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Visits in Month</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);" id="rpt-mon-visits-count">0</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid var(--border); padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700;">Total Billed</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);" id="rpt-mon-total-billed">₹0</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #166534; font-weight: 700;">Total Collected (Income)</div>
            <div style="font-size: 18px; font-weight: 800; color: #15803d;" id="rpt-mon-collected">₹0</div>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 8px;">
            <div style="font-size: 11.5px; color: #991b1b; font-weight: 700;">Total Pending Due</div>
            <div style="font-size: 18px; font-weight: 800; color: #dc2626;" id="rpt-mon-total-due">₹0</div>
          </div>
        </div>

        <div class="cms-table-wrapper" id="rpt-mon-wrapper">
        </div>
      `;

      const renderMonthly = () => {
        const monthQuery = box.querySelector('#rpt-mon-month')?.value || todayISO().slice(0, 7);
        const areaQuery = (box.querySelector('#rpt-mon-area')?.value || '').toLowerCase().trim();
        const dueOnly = box.querySelector('#rpt-mon-due')?.checked;

        const filtered = allVisits.filter((v) => {
          if (monthQuery && !String(v.date).startsWith(monthQuery)) return false;
          if (areaQuery && !(v.famArea || '').toLowerCase().includes(areaQuery)) return false;
          if (dueOnly && !(Number(v.due) > 0)) return false;
          return true;
        });

        const totalBilled = filtered.reduce((s, v) => s + (Number(v.charge) || 0), 0);
        const totalColl = filtered.reduce((s, v) => s + (Number(v.received) || 0), 0);
        const totalDue = filtered.reduce((s, v) => s + (Number(v.due) || 0), 0);

        const countEl = box.querySelector('#rpt-mon-visits-count');
        const billedEl = box.querySelector('#rpt-mon-total-billed');
        const collEl = box.querySelector('#rpt-mon-collected');
        const dueEl = box.querySelector('#rpt-mon-total-due');

        if (countEl) countEl.innerText = filtered.length;
        if (billedEl) billedEl.innerText = fmtMoney(totalBilled);
        if (collEl) collEl.innerText = fmtMoney(totalColl);
        if (dueEl) dueEl.innerText = fmtMoney(totalDue);

        const wrapper = box.querySelector('#rpt-mon-wrapper');
        if (!wrapper) return;

        if (filtered.length === 0) {
          wrapper.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border); border-radius: 8px;">No records found for the selected month and filters.</div>`;
          return;
        }

        wrapper.innerHTML = `
          <table class="cms-table">
            <thead>
              <tr>
                <th style="width: 90px;">Date</th>
                <th style="width: 130px;">Case ID</th>
                <th>Patient Name</th>
                <th>Area</th>
                <th style="text-align: right; width: 95px;">Charge</th>
                <th style="text-align: right; width: 95px;">Received</th>
                <th style="text-align: right; width: 95px;">Due</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (v) => `
                <tr>
                  <td class="font-mono">${fmtDate(v.date)}</td>
                  <td class="font-mono" style="font-weight: 800; color: var(--primary);">${v.caseId}</td>
                  <td><b>${v.patName}</b> <span style="font-size: 11px; color: var(--text-muted);">&middot; PT ${v.patId}</span></td>
                  <td>${v.famArea || '—'}</td>
                  <td class="font-mono" style="text-align: right;">${fmtMoney(v.charge)}</td>
                  <td class="font-mono" style="color: #15803d; font-weight: 700; text-align: right;">${fmtMoney(v.received)}</td>
                  <td class="font-mono" style="text-align: right; font-weight: ${v.due > 0 ? '800' : '500'}; color: ${v.due > 0 ? '#dc2626' : 'var(--text-muted)'};">
                    ${v.due > 0 ? fmtMoney(v.due) : 'Nil'}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      };

      box.querySelector('#rpt-mon-month')?.addEventListener('change', renderMonthly);
      box.querySelector('#rpt-mon-area')?.addEventListener('input', renderMonthly);
      box.querySelector('#rpt-mon-due')?.addEventListener('change', renderMonthly);

      renderMonthly();
    }
  };

  // Attach Sub-nav Tab Listeners
  container.querySelector('#rpt-tab-area')?.addEventListener('click', () => {
    activeTab = 'area';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-refdr')?.addEventListener('click', () => {
    activeTab = 'refdr';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-pat')?.addEventListener('click', () => {
    activeTab = 'patient';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-col')?.addEventListener('click', () => {
    activeTab = 'collection';
    updateActiveButtons();
    renderCurrentReport();
  });
  container.querySelector('#rpt-tab-monthly')?.addEventListener('click', () => {
    activeTab = 'monthly';
    updateActiveButtons();
    renderCurrentReport();
  });

  function updateActiveButtons() {
    container.querySelectorAll('[id^="rpt-tab-"]').forEach((btn) => {
      btn.className = 'cms-btn cms-btn-ghost';
    });
    const current = container.querySelector(
      `#rpt-tab-${activeTab === 'collection' ? 'col' : activeTab === 'patient' ? 'pat' : activeTab}`
    );
    if (current) current.className = 'cms-btn cms-btn-primary';
  }

  renderCurrentReport();
}
