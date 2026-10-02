/**
 * =========================================================
 * CLINICAL DASHBOARD & KPI MANAGEMENT CONTROLLER
 * 5 High-Impact KPI Metrics, Date Filtering, OPD Visits,
 * Appointments, Follow-ups, Financial Cashflow, and Analytics
 * =========================================================
 */

import { apiFetch, todayISO, fmtDate, fmtMoney, getLocalDB, getAuthSession } from './api.js';

export async function renderDashboard(container, onSelectPatient) {
  let dateFilter = todayISO();
  let datePreset = 'today'; // 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  let activeTab = 'visits'; // 'visits' | 'appointments' | 'followups' | 'billing' | 'patients' | 'dues'
  let searchQuery = '';

  function getYesterdayISO() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  function getDaysAgoISO(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }

  function getMonthStartISO() {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }

  async function loadData() {
    const session = getAuthSession();
    const clinicId = session?.profile?.activeClinicId || 'demo';
    const db = getLocalDB(clinicId);

    let appointments = [];
    let followUps = [];
    let bills = [];

    try {
      const aptRes = await apiFetch('/appointments');
      if (aptRes && aptRes.data && aptRes.data.length > 0) appointments = aptRes.data;
      else appointments = db.appointments || [];
    } catch (e) {
      appointments = db.appointments || [];
    }

    try {
      const fuRes = await apiFetch('/followups');
      if (fuRes && fuRes.data && fuRes.data.length > 0) followUps = fuRes.data;
      else followUps = db.followups || [];
    } catch (e) {
      followUps = db.followups || [];
    }

    try {
      const billRes = await apiFetch('/billing');
      if (billRes && billRes.data && billRes.data.length > 0) bills = billRes.data;
      else bills = db.bills || [];
    } catch (e) {
      bills = db.bills || [];
    }

    const families = Object.values(db.families || {});
    const flatPatients = [];
    const allVisits = [];

    families.forEach((fam) => {
      Object.values(fam.patients || {}).forEach((pat) => {
        const visits = pat.visits || [];
        const totalDue = visits.reduce((s, v) => s + (Number(v.due) || 0), 0);
        const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;

        flatPatients.push({
          fam,
          pat,
          totalDue,
          lastVisit,
          visitCount: visits.length,
        });

        visits.forEach((v, idx) => {
          allVisits.push({
            ...v,
            isFirstVisit: idx === 0,
            famId: fam.id,
            famHead: fam.headName,
            patId: pat.id,
            patName: pat.name,
            patAge: pat.age,
            patGender: pat.gender,
            patPhone: pat.phone || fam.phone || '',
            area: fam.area || '',
          });
        });
      });
    });

    return {
      db,
      families,
      flatPatients,
      allVisits,
      appointments,
      followUps,
      bills,
    };
  }

  async function render() {
    const data = await loadData();
    const { families, flatPatients, allVisits, appointments, followUps, bills } = data;

    let targetVisits = [];
    if (datePreset === 'week') {
      const weekAgo = getDaysAgoISO(7);
      targetVisits = allVisits.filter((v) => v.date >= weekAgo && v.date <= dateFilter);
    } else if (datePreset === 'month') {
      const monthStart = getMonthStartISO();
      targetVisits = allVisits.filter((v) => v.date >= monthStart && v.date <= dateFilter);
    } else {
      targetVisits = allVisits.filter((v) => v.date === dateFilter);
    }

    const newPatientsCount = targetVisits.filter((v) => v.isFirstVisit).length;
    const reVisitsCount = targetVisits.length - newPatientsCount;

    const dateBilled = targetVisits.reduce((s, v) => s + (Number(v.charge) || 0), 0);
    const dateReceived = targetVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const dateDue = targetVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);
    const totalClinicDue = flatPatients.reduce((s, p) => s + p.totalDue, 0);
    const defaultersCount = flatPatients.filter((p) => p.totalDue > 0).length;

    const targetApts = appointments.filter((a) => (a.date || a.appointmentDate) === dateFilter);
    const aptsPending = targetApts.filter((a) => (a.status || '').toLowerCase() !== 'completed').length;
    const aptsCompleted = targetApts.length - aptsPending;

    const targetFollowUps = followUps.filter((f) => {
      const fDate = f.date || f.followUpDate || f.scheduledDate;
      return fDate === dateFilter || (fDate <= dateFilter && (f.status || '').toLowerCase() !== 'completed');
    });

    const diagCountMap = {};
    allVisits.forEach((v) => {
      const d = (v.diagnosis || v.complaint || '').trim();
      if (d) {
        diagCountMap[d] = (diagCountMap[d] || 0) + 1;
      }
    });
    const topDiagnoses = Object.entries(diagCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxDiagCount = topDiagnoses.length > 0 ? topDiagnoses[0][1] : 1;

    const topDuesPatients = flatPatients
      .filter((p) => p.totalDue > 0)
      .sort((a, b) => b.totalDue - a.totalDue)
      .slice(0, 5);

    container.innerHTML = `
      <div class="cms-dash-container">
        
        <!-- Header Controls & Date Presets -->
        <div class="cms-dash-header">
          <div class="cms-dash-filter-group">
            <span class="font-display" style="font-weight: 800; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; color: var(--primary);">
              <i class="fa-solid fa-chart-pie"></i> Clinical Dashboard
            </span>

            <div class="cms-dash-presets">
              <button type="button" class="cms-dash-preset-btn ${datePreset === 'today' ? 'active' : ''}" data-preset="today">Today</button>
              <button type="button" class="cms-dash-preset-btn ${datePreset === 'yesterday' ? 'active' : ''}" data-preset="yesterday">Yesterday</button>
              <button type="button" class="cms-dash-preset-btn ${datePreset === 'week' ? 'active' : ''}" data-preset="week">Last 7 Days</button>
              <button type="button" class="cms-dash-preset-btn ${datePreset === 'month' ? 'active' : ''}" data-preset="month">This Month</button>
            </div>

            <div class="cms-dash-date-picker-wrap">
              <input type="date" id="dash-date-picker" class="cms-input cms-dash-date-input" value="${dateFilter}" title="Choose specific date" />
            </div>
          </div>

          <div class="cms-dash-quick-actions">
            <button type="button" class="cms-btn cms-btn-primary" id="btn-quick-new-visit" style="padding: 6px 14px; font-size: 12.5px; font-weight: 700; gap: 6px;">
              <i class="fa-solid fa-notes-medical"></i>
              <span>+ New Consultation</span>
              <span class="cms-kbd" style="background: rgba(255,255,255,0.25); color: #fff; font-size: 10px; padding: 1px 5px;">F3</span>
            </button>
            <button type="button" class="cms-btn cms-btn-ghost" id="btn-quick-add-patient" style="border: 1px solid var(--border); padding: 6px 12px; font-size: 12.5px; gap: 6px;">
              <i class="fa-solid fa-user-plus"></i>
              <span>Add Patient</span>
              <span class="cms-kbd font-mono" style="font-size: 10px; opacity: 0.7;">F2</span>
            </button>
            <button type="button" class="cms-btn cms-btn-ghost" id="btn-quick-add-family" style="border: 1px solid var(--border); padding: 6px 12px; font-size: 12.5px; gap: 6px;">
              <i class="fa-solid fa-people-roof"></i>
              <span>Family Head</span>
              <span class="cms-kbd font-mono" style="font-size: 10px; opacity: 0.7;">F1</span>
            </button>
          </div>
        </div>

        <!-- 5 Balanced High-Impact KPI Cards (Pending Follow-up removed as requested) -->
        <div class="cms-dash-kpi-grid">
          
          <!-- KPI 1: OPD Visits -->
          <div class="cms-kpi-card tone-opd ${activeTab === 'visits' ? 'active' : ''}" data-tab="visits">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-stethoscope"></i></div>
              <span class="cms-kpi-badge" style="background: #e0f2fe; color: #0369a1;">${datePreset === 'today' ? 'Today' : datePreset.toUpperCase()}</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val">${targetVisits.length} <span style="font-size: 13.5px; font-weight: 600; color: var(--text-muted);">Visits</span></div>
              <div class="cms-kpi-title">OPD Consultations</div>
            </div>
            <div class="cms-kpi-meta">
              <span><b>${newPatientsCount}</b> New</span>
              <span>&bull;</span>
              <span><b>${reVisitsCount}</b> Re-visits</span>
            </div>
          </div>

          <!-- KPI 2: Cashflow & Collection -->
          <div class="cms-kpi-card tone-revenue ${activeTab === 'billing' ? 'active' : ''}" data-tab="billing">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
              <span class="cms-kpi-badge" style="background: #d1fae5; color: #047857;">Received</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val" style="color: #059669;">${fmtMoney(dateReceived)}</div>
              <div class="cms-kpi-title">Revenue Collected</div>
            </div>
            <div class="cms-kpi-meta">
              <span>Billed: <b>${fmtMoney(dateBilled)}</b></span>
              <span>&bull;</span>
              <span style="color: #dc2626;">Due: <b>${fmtMoney(dateDue)}</b></span>
            </div>
          </div>

          <!-- KPI 3: Appointments & Queue -->
          <div class="cms-kpi-card tone-apts ${activeTab === 'appointments' ? 'active' : ''}" data-tab="appointments">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-calendar-check"></i></div>
              <span class="cms-kpi-badge" style="background: #e0e7ff; color: #4338ca;">Queue</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val">${targetApts.length} <span style="font-size: 13.5px; font-weight: 600; color: var(--text-muted);">Slots</span></div>
              <div class="cms-kpi-title">Booked Appointments</div>
            </div>
            <div class="cms-kpi-meta">
              <span style="color: #4f46e5;"><b>${aptsPending}</b> Pending</span>
              <span>&bull;</span>
              <span><b>${aptsCompleted}</b> Done</span>
            </div>
          </div>

          <!-- KPI 4: Patient Community -->
          <div class="cms-kpi-card tone-patients ${activeTab === 'patients' ? 'active' : ''}" data-tab="patients">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-people-roof"></i></div>
              <span class="cms-kpi-badge" style="background: #ede9fe; color: #6d28d9;">Network</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val">${flatPatients.length} <span style="font-size: 13.5px; font-weight: 600; color: var(--text-muted);">Total</span></div>
              <div class="cms-kpi-title">Registered Patients</div>
            </div>
            <div class="cms-kpi-meta">
              <span><b>${families.length}</b> Families Registered</span>
            </div>
          </div>

          <!-- KPI 5: Outstanding Dues -->
          <div class="cms-kpi-card tone-dues ${activeTab === 'dues' ? 'active' : ''}" data-tab="dues">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <span class="cms-kpi-badge" style="background: #fee2e2; color: #b91c1c;">Critical</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val" style="color: #dc2626;">${fmtMoney(totalClinicDue)}</div>
              <div class="cms-kpi-title">Outstanding Dues</div>
            </div>
            <div class="cms-kpi-meta">
              <span style="color: #dc2626;"><b>${defaultersCount}</b> Defaulters</span>
              <span>&bull;</span>
              <span>Recovery Pending</span>
            </div>
          </div>

        </div>

        <!-- Main Workspace Layout: 1.75fr Table Section, 1fr Analytics Widgets -->
        <div class="cms-dash-layout-grid">
          
          <div class="cms-dash-table-card">
            
            <div class="cms-dash-tab-nav">
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'visits' ? 'active' : ''}" data-tab="visits">
                <i class="fa-solid fa-stethoscope"></i>
                <span>OPD Consultations</span>
                <span class="cms-dash-tab-count">${targetVisits.length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'appointments' ? 'active' : ''}" data-tab="appointments">
                <i class="fa-solid fa-calendar-check"></i>
                <span>Appointments Queue</span>
                <span class="cms-dash-tab-count">${targetApts.length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'followups' ? 'active' : ''}" data-tab="followups">
                <i class="fa-solid fa-bell"></i>
                <span>Follow-ups</span>
                <span class="cms-dash-tab-count">${targetFollowUps.length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'billing' ? 'active' : ''}" data-tab="billing">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>Invoices &amp; Receipts</span>
                <span class="cms-dash-tab-count">${bills.length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'patients' ? 'active' : ''}" data-tab="patients">
                <i class="fa-solid fa-user-group"></i>
                <span>Patient Directory</span>
                <span class="cms-dash-tab-count">${flatPatients.length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'dues' ? 'active' : ''}" data-tab="dues">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Dues Recovery</span>
                <span class="cms-dash-tab-count" style="color: #dc2626;">${defaultersCount}</span>
              </button>
            </div>

            <div class="cms-dash-toolbar">
              <div style="font-weight: 800; font-size: 13px; color: var(--text);">
                ${
                  activeTab === 'visits' ? `OPD Consultations on ${fmtDate(dateFilter)}` :
                  activeTab === 'appointments' ? `Appointments Scheduled on ${fmtDate(dateFilter)}` :
                  activeTab === 'followups' ? `Pending Follow-up Consultations` :
                  activeTab === 'billing' ? `Recent Patient Invoices &amp; Cashflow` :
                  activeTab === 'patients' ? `Registered Patient Population` :
                  `Outstanding Patient Balance &amp; Defaulters`
                }
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="text" id="dash-tab-search" class="cms-input cms-dash-search-input" placeholder="Search table..." value="${searchQuery}" />
              </div>
            </div>

            <div class="cms-table-wrapper cms-dash-table-body" id="dash-active-table-body">
              ${renderActiveTableHTML(data, targetVisits, targetApts, targetFollowUps)}
            </div>

          </div>

          <div class="cms-dash-side-col">
            
            <div class="cms-dash-widget-card">
              <div class="cms-widget-header">
                <div class="cms-widget-title" style="color: #dc2626;">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  <span>Top Outstanding Dues</span>
                </div>
                <span class="cms-pill font-mono" style="background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 800;">
                  Total: ${fmtMoney(totalClinicDue)}
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${
                  topDuesPatients.length === 0
                    ? `<div style="padding: 20px; text-align: center; color: var(--success); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> All accounts settled!</div>`
                    : topDuesPatients
                        .map(
                          ({ fam, pat, totalDue, lastVisit }) => `
                      <div class="cms-due-item-row" data-famid="${fam.id}" data-patid="${pat.id}" title="Click to view patient case consultation">
                        <div>
                          <div style="font-weight: 800; font-size: 13px;">${pat.name} <span class="cms-kbd" style="font-size: 10px; margin-left: 4px;">PT ${pat.id}</span></div>
                          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                            Head: <b>${fam.headName}</b> &middot; Last: ${lastVisit ? fmtDate(lastVisit.date) : '—'}
                          </div>
                        </div>
                        <div style="text-align: right;">
                          <span class="cms-pill font-mono" style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 12px;">${fmtMoney(totalDue)}</span>
                        </div>
                      </div>
                    `
                        )
                        .join('')
                }
              </div>
            </div>

            <div class="cms-dash-widget-card">
              <div class="cms-widget-header">
                <div class="cms-widget-title" style="color: #0284c7;">
                  <i class="fa-solid fa-chart-simple"></i>
                  <span>Top Clinical Diagnoses</span>
                </div>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Overall Trends</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${
                  topDiagnoses.length === 0
                    ? `<div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 12px;">No diagnosis records available.</div>`
                    : topDiagnoses
                        .map(([diag, count]) => {
                          const pct = Math.round((count / maxDiagCount) * 100);
                          return `
                        <div class="cms-diag-bar-row">
                          <div class="cms-diag-bar-labels">
                            <span style="color: var(--text); font-weight: 700;">${diag}</span>
                            <span class="font-mono" style="color: var(--primary); font-weight: 800;">${count} Cases</span>
                          </div>
                          <div class="cms-diag-progress-track">
                            <div class="cms-diag-progress-fill" style="width: ${pct}%;"></div>
                          </div>
                        </div>
                      `;
                        })
                        .join('')
                }
              </div>
            </div>

            <div class="cms-dash-widget-card">
              <div class="cms-widget-header">
                <div class="cms-widget-title" style="color: var(--text);">
                  <i class="fa-solid fa-bolt"></i>
                  <span>Quick Action Center</span>
                </div>
              </div>

              <div class="cms-dash-shortcut-grid">
                <button type="button" class="cms-dash-action-btn" id="act-btn-case">
                  <span><i class="fa-solid fa-clipboard-user" style="color: var(--primary); margin-right: 6px;"></i> Case Entry</span>
                  <span class="cms-kbd font-mono">F3</span>
                </button>
                <button type="button" class="cms-dash-action-btn" id="act-btn-family">
                  <span><i class="fa-solid fa-people-roof" style="color: #059669; margin-right: 6px;"></i> Family Reg</span>
                  <span class="cms-kbd font-mono">F1</span>
                </button>
                <button type="button" class="cms-dash-action-btn" id="act-btn-member">
                  <span><i class="fa-solid fa-user-plus" style="color: #7c3aed; margin-right: 6px;"></i> Add Member</span>
                  <span class="cms-kbd font-mono">F2</span>
                </button>
                <button type="button" class="cms-dash-action-btn" id="act-btn-cert">
                  <span><i class="fa-solid fa-certificate" style="color: #d97706; margin-right: 6px;"></i> Medical Cert</span>
                  <span class="cms-kbd font-mono">F6</span>
                </button>
                <button type="button" class="cms-dash-action-btn" id="act-btn-reports">
                  <span><i class="fa-solid fa-chart-line" style="color: #0284c7; margin-right: 6px;"></i> Reports</span>
                  <span class="cms-kbd font-mono">F5</span>
                </button>
                <button type="button" class="cms-dash-action-btn" id="act-btn-masters">
                  <span><i class="fa-solid fa-layer-group" style="color: #dc2626; margin-right: 6px;"></i> Master Data</span>
                  <span class="cms-kbd font-mono">F7</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    attachEventListeners(data);
  }

  function renderActiveTableHTML(data, targetVisits, targetApts, targetFollowUps) {
    const { flatPatients, bills } = data;
    const q = searchQuery.toLowerCase().trim();

    if (activeTab === 'visits') {
      let list = targetVisits;
      if (q) {
        list = list.filter(
          (v) =>
            v.patName.toLowerCase().includes(q) ||
            v.caseId.toLowerCase().includes(q) ||
            (v.complaint || '').toLowerCase().includes(q) ||
            (v.diagnosis || '').toLowerCase().includes(q) ||
            v.patId.toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-clipboard-question" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>No patient visits recorded on this date.</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 85px;">Time</th>
              <th style="width: 130px;">Case ID</th>
              <th>Patient Name</th>
              <th style="width: 80px;">Age/Sex</th>
              <th>Chief Complaint</th>
              <th>Diagnosis</th>
              <th style="text-align: right; width: 90px;">Total Fee</th>
              <th style="text-align: right; width: 90px;">Received</th>
              <th style="text-align: right; width: 85px;">Due</th>
              <th style="text-align: right; width: 110px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (v) => `
              <tr class="cms-clickable-row" data-famid="${v.famId}" data-patid="${v.patId}">
                <td class="font-mono" style="font-weight: 700; white-space: nowrap;">${v.time || '—'}</td>
                <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">${v.caseId}</td>
                <td>
                  <b>${v.patName}</b>
                  <div style="font-size: 11px; color: var(--text-muted);">${v.famHead} &middot; PT ${v.patId}</div>
                </td>
                <td style="white-space: nowrap;">${v.patAge || '—'} / ${v.patGender ? v.patGender[0] : '—'}</td>
                <td>${v.complaint || '—'}</td>
                <td><span class="cms-pill cms-badge-neutral">${v.diagnosis || '—'}</span></td>
                <td class="font-mono" style="text-align: right; white-space: nowrap;">${fmtMoney(v.charge)}</td>
                <td class="font-mono" style="text-align: right; color: #059669; font-weight: 800; white-space: nowrap;">${fmtMoney(v.received)}</td>
                <td class="font-mono" style="text-align: right; color: ${Number(v.due) > 0 ? '#dc2626' : 'var(--text-muted)'}; font-weight: ${Number(v.due) > 0 ? '800' : '500'}; white-space: nowrap;">${fmtMoney(v.due)}</td>
                <td style="text-align: right; white-space: nowrap;">
                  <button type="button" class="cms-btn cms-btn-ghost btn-open-case-direct" data-famid="${v.famId}" data-patid="${v.patId}" style="padding: 4px 8px; font-size: 11.5px; color: var(--primary); font-weight: 700;">
                    Case <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (activeTab === 'appointments') {
      let list = targetApts;
      if (q) {
        list = list.filter(
          (a) =>
            (a.patientName || a.name || '').toLowerCase().includes(q) ||
            (a.reason || '').toLowerCase().includes(q) ||
            (a.phone || '').toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-calendar-xmark" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>No appointments booked for this date.</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 100px;">Time Slot</th>
              <th>Patient Name</th>
              <th style="width: 120px;">Phone</th>
              <th>Clinical Reason</th>
              <th style="width: 110px;">Status</th>
              <th style="text-align: right; width: 120px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map((a) => {
                const patName = a.patientName || a.name || 'Patient';
                const matchedPat = flatPatients.find(
                  (p) => p.pat.name.toLowerCase() === patName.toLowerCase() || (a.patientId && p.pat.id === a.patientId)
                );
                return `
                <tr>
                  <td class="font-mono" style="font-weight: 700; color: var(--primary); white-space: nowrap;">${a.time || a.appointmentTime || '10:00 AM'}</td>
                  <td><b>${patName}</b></td>
                  <td class="font-mono" style="white-space: nowrap;">${a.phone || '—'}</td>
                  <td>${a.reason || 'General Checkup'}</td>
                  <td><span class="cms-pill ${a.status === 'Completed' ? 'cms-badge-paid' : 'cms-badge-neutral'}">${a.status || 'Scheduled'}</span></td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button type="button" class="cms-btn cms-btn-primary btn-start-apt-consultation" data-famid="${matchedPat ? matchedPat.fam.id : ''}" data-patid="${matchedPat ? matchedPat.pat.id : ''}" data-name="${encodeURIComponent(patName)}" style="padding: 3px 10px; font-size: 11.5px;">
                      Start Visit <i class="fa-solid fa-stethoscope"></i>
                    </button>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (activeTab === 'followups') {
      let list = targetFollowUps;
      if (q) {
        list = list.filter(
          (f) =>
            (f.patientName || f.name || '').toLowerCase().includes(q) ||
            (f.patientId || '').toLowerCase().includes(q) ||
            (f.reason || '').toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-bell-slash" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>No pending follow-ups.</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 120px;">Follow-up Date</th>
              <th style="width: 100px;">Patient ID</th>
              <th>Patient Name</th>
              <th>Clinical Purpose</th>
              <th style="width: 110px;">Status</th>
              <th style="text-align: right; width: 120px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map((f) => {
                const matchedPat = flatPatients.find((p) => p.pat.id === f.patientId || p.pat.name.toLowerCase() === (f.patientName || '').toLowerCase());
                return `
                <tr>
                  <td class="font-mono" style="font-weight: 700; white-space: nowrap;">${fmtDate(f.date || f.followUpDate || f.scheduledDate)}</td>
                  <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">PT ${f.patientId || '—'}</td>
                  <td><b>${f.patientName || matchedPat?.pat?.name || 'Patient'}</b></td>
                  <td>${f.reason || 'Review / Follow-up'}</td>
                  <td><span class="cms-pill cms-badge-neutral">${f.status || 'Pending'}</span></td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button type="button" class="cms-btn cms-btn-ghost btn-open-fu-case" data-famid="${matchedPat ? matchedPat.fam.id : ''}" data-patid="${matchedPat ? matchedPat.pat.id : ''}" style="padding: 3px 8px; font-size: 11.5px; color: var(--primary); font-weight: 700;">
                      Open Record <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (activeTab === 'billing') {
      let list = bills;
      if (q) {
        list = list.filter(
          (b) =>
            (b.billNo || '').toLowerCase().includes(q) ||
            (b.patientName || '').toLowerCase().includes(q) ||
            (b.caseId || '').toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-file-invoice" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>No invoices recorded.</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 130px;">Bill No.</th>
              <th style="width: 110px;">Date</th>
              <th>Patient Name</th>
              <th style="text-align: right; width: 100px;">Total Charge</th>
              <th style="text-align: right; width: 100px;">Paid Amount</th>
              <th style="text-align: right; width: 100px;">Due Amount</th>
              <th style="width: 90px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                (b) => `
              <tr>
                <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">${b.billNo}</td>
                <td class="font-mono" style="white-space: nowrap;">${fmtDate(b.billDate || b.createdAt)}</td>
                <td><b>${b.patientName}</b></td>
                <td class="font-mono" style="text-align: right; white-space: nowrap;">${fmtMoney(b.totalCharge)}</td>
                <td class="font-mono" style="text-align: right; color: #059669; font-weight: 800; white-space: nowrap;">${fmtMoney(b.paidAmount)}</td>
                <td class="font-mono" style="text-align: right; color: ${Number(b.dueAmount) > 0 ? '#dc2626' : 'var(--text-muted)'}; font-weight: ${Number(b.dueAmount) > 0 ? '800' : '500'}; white-space: nowrap;">${fmtMoney(b.dueAmount)}</td>
                <td style="text-align: center;"><span class="cms-pill ${b.status === 'Paid' ? 'cms-badge-paid' : 'cms-badge-due'}">${b.status}</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (activeTab === 'patients') {
      let list = flatPatients;
      if (q) {
        list = list.filter(
          ({ fam, pat }) =>
            pat.name.toLowerCase().includes(q) ||
            pat.id.toLowerCase().includes(q) ||
            fam.headName.toLowerCase().includes(q) ||
            (fam.area || '').toLowerCase().includes(q) ||
            (pat.phone || fam.phone || '').includes(q)
        );
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 100px;">Patient ID</th>
              <th>Patient Name</th>
              <th style="width: 90px;">Relation</th>
              <th>Family Head</th>
              <th>Area / Locality</th>
              <th style="width: 110px;">Phone</th>
              <th style="width: 80px;">Blood Grp</th>
              <th style="width: 70px; text-align: center;">Visits</th>
              <th style="text-align: right; width: 110px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                ({ fam, pat, visitCount }) => `
              <tr class="cms-clickable-row" data-famid="${fam.id}" data-patid="${pat.id}">
                <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">PT ${pat.id}</td>
                <td><b>${pat.name}</b></td>
                <td>${pat.relation || 'Head'}</td>
                <td>${fam.headName}</td>
                <td>${fam.area || '—'}</td>
                <td class="font-mono" style="white-space: nowrap;">${pat.phone || fam.phone || '—'}</td>
                <td><span class="font-mono">${pat.bloodGroup || '—'}</span></td>
                <td style="text-align: center;"><span class="cms-pill cms-badge-neutral font-mono">${visitCount}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                  <button type="button" class="cms-btn cms-btn-ghost btn-open-case-direct" data-famid="${fam.id}" data-patid="${pat.id}" style="padding: 4px 8px; font-size: 11.5px; color: var(--primary); font-weight: 700;">
                    Case <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    if (activeTab === 'dues') {
      let list = flatPatients.filter((p) => p.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue);
      if (q) {
        list = list.filter(
          ({ fam, pat }) =>
            pat.name.toLowerCase().includes(q) ||
            pat.id.toLowerCase().includes(q) ||
            fam.headName.toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--success); font-weight: 700;"><i class="fa-solid fa-circle-check" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>All patient accounts are fully settled. No pending dues!</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 100px;">Patient ID</th>
              <th>Patient Name</th>
              <th>Family Head</th>
              <th>Area / Locality</th>
              <th style="width: 120px;">Last Visit Date</th>
              <th style="text-align: right; width: 110px;">Total Due</th>
              <th style="text-align: right; width: 110px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                ({ fam, pat, totalDue, lastVisit }) => `
              <tr class="cms-clickable-row" data-famid="${fam.id}" data-patid="${pat.id}">
                <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">PT ${pat.id}</td>
                <td><b>${pat.name}</b></td>
                <td>${fam.headName}</td>
                <td>${fam.area || '—'}</td>
                <td class="font-mono" style="white-space: nowrap;">${lastVisit ? fmtDate(lastVisit.date) : '—'}</td>
                <td class="font-mono" style="text-align: right; color: #dc2626; font-weight: 800; font-size: 13px; white-space: nowrap;">${fmtMoney(totalDue)}</td>
                <td style="text-align: right; white-space: nowrap;">
                  <button type="button" class="cms-btn cms-btn-ghost btn-open-case-direct" data-famid="${fam.id}" data-patid="${pat.id}" style="padding: 4px 8px; font-size: 11.5px; color: #dc2626; font-weight: 700;">
                    Settle <i class="fa-solid fa-arrow-right"></i>
                  </button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    return '';
  }

  function attachEventListeners(data) {
    container.querySelectorAll('.cms-dash-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        datePreset = preset;
        if (preset === 'today') dateFilter = todayISO();
        else if (preset === 'yesterday') dateFilter = getYesterdayISO();
        else if (preset === 'week') dateFilter = todayISO();
        else if (preset === 'month') dateFilter = todayISO();
        render();
      });
    });

    const dateInput = container.querySelector('#dash-date-picker');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        dateFilter = e.target.value;
        datePreset = 'custom';
        render();
      });
    }

    container.querySelectorAll('.cms-kpi-card[data-tab]').forEach((card) => {
      card.addEventListener('click', () => {
        activeTab = card.getAttribute('data-tab');
        searchQuery = '';
        render();
      });
    });

    container.querySelectorAll('.cms-dash-tab-btn[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        searchQuery = '';
        render();
      });
    });

    const searchInput = container.querySelector('#dash-tab-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const tableMount = container.querySelector('#dash-active-table-body');
        if (tableMount) {
          const targetVisits = data.allVisits.filter((v) => v.date === dateFilter);
          const targetApts = data.appointments.filter((a) => (a.date || a.appointmentDate) === dateFilter);
          const targetFollowUps = data.followUps.filter((f) => (f.date || f.followUpDate) === dateFilter);
          tableMount.innerHTML = renderActiveTableHTML(data, targetVisits, targetApts, targetFollowUps);
          attachTableInteractions();
        }
      });
    }

    container.querySelector('#btn-quick-new-visit')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="case"]')?.click();
    });

    container.querySelector('#btn-quick-add-patient')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="patient"]')?.click();
    });

    container.querySelector('#btn-quick-add-family')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="family"]')?.click();
    });

    container.querySelector('#act-btn-case')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="case"]')?.click();
    });
    container.querySelector('#act-btn-family')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="family"]')?.click();
    });
    container.querySelector('#act-btn-member')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="patient"]')?.click();
    });
    container.querySelector('#act-btn-cert')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="certificates"]')?.click();
    });
    container.querySelector('#act-btn-reports')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="reports"]')?.click();
    });
    container.querySelector('#act-btn-masters')?.addEventListener('click', () => {
      document.querySelector('.cms-nav-item[data-view="masters"]')?.click();
    });

    container.querySelectorAll('.cms-due-item-row').forEach((row) => {
      row.addEventListener('click', () => {
        const famId = row.getAttribute('data-famid');
        const patId = row.getAttribute('data-patid');
        if (famId && patId && onSelectPatient) {
          onSelectPatient(famId, patId);
        }
      });
    });

    attachTableInteractions();
  }

  function attachTableInteractions() {
    container.querySelectorAll('.cms-clickable-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const famId = row.getAttribute('data-famid');
        const patId = row.getAttribute('data-patid');
        if (famId && patId && onSelectPatient) {
          onSelectPatient(famId, patId);
        }
      });
    });

    container.querySelectorAll('.btn-open-case-direct, .btn-open-fu-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        const famId = btn.getAttribute('data-famid');
        const patId = btn.getAttribute('data-patid');
        if (famId && patId && onSelectPatient) {
          onSelectPatient(famId, patId);
        }
      });
    });

    container.querySelectorAll('.btn-start-apt-consultation').forEach((btn) => {
      btn.addEventListener('click', () => {
        const famId = btn.getAttribute('data-famid');
        const patId = btn.getAttribute('data-patid');
        if (famId && patId && onSelectPatient) {
          onSelectPatient(famId, patId);
        } else {
          document.querySelector('.cms-nav-item[data-view="case"]')?.click();
        }
      });
    });
  }

  await render();
}
