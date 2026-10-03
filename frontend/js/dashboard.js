/**
 * =========================================================
 * CLINICAL DASHBOARD & KPI MANAGEMENT CONTROLLER
 * 5 High-Impact KPI Metrics, Date Filtering, OPD Visits,
 * Appointments, Follow-ups, Financial Cashflow, and Analytics
 * =========================================================
 */

import { apiFetch, todayISO, fmtDate, fmtMoney, getLocalDB, getAuthSession } from './api.js';

export async function renderDashboard(container, onSelectPatient, onNavigate) {
  let dateFilter = todayISO();
  let datePreset = 'today'; // 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  let activeTab = 'visits'; // 'visits' | 'collections' | 'dues' | 'patients'
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
    let bills = [];
    let familiesMap = {};
    let backendVisits = [];

    // Real-time Database: Fetch live Families & Patients for active clinic
    try {
      const [famRes, patRes] = await Promise.all([
        apiFetch('/families').catch(() => ({ data: [] })),
        apiFetch('/patients').catch(() => ({ data: [] }))
      ]);

      if (famRes && famRes.data && Array.isArray(famRes.data)) {
        famRes.data.forEach((f) => {
          const fid = f.famId || f.id || f._id;
          if (fid) {
            familiesMap[fid] = {
              ...f,
              id: fid,
              headName: f.headName || f.name,
              patients: f.patients || [],
            };
          }
        });
      }

      if (patRes && patRes.data && Array.isArray(patRes.data)) {
        patRes.data.forEach((p) => {
          const fId = p.familyId;
          const pId = p.patId || p.id || p._id;
          if (fId && familiesMap[fId]) {
            if (!familiesMap[fId].patients) familiesMap[fId].patients = [];
            if (Array.isArray(familiesMap[fId].patients)) {
              if (!familiesMap[fId].patients.some((ep) => (ep.patId || ep.id || ep._id) === pId)) {
                familiesMap[fId].patients.push(p);
              }
            } else if (typeof familiesMap[fId].patients === 'object') {
              familiesMap[fId].patients[pId] = p;
            }
          }
        });
      }
    } catch (e) {}

    // Real-time Database: Fetch live Consultations / Visits
    try {
      const conRes = await apiFetch('/consultations');
      if (conRes && conRes.data && Array.isArray(conRes.data)) {
        backendVisits = conRes.data;
      }
    } catch (e) {}

    // Real-time Database: Fetch Appointments
    try {
      const aptRes = await apiFetch('/appointments');
      if (aptRes && aptRes.data && Array.isArray(aptRes.data) && aptRes.data.length > 0) {
        appointments = aptRes.data;
      } else {
        appointments = db.appointments || [];
      }
    } catch (e) {
      appointments = db.appointments || [];
    }

    const families = Object.values(familiesMap);
    const flatPatients = [];
    const visitMap = new Map();

    // Map all backend visits
    backendVisits.forEach((bv, idx) => {
      const vKey = bv.caseId || bv._id || bv.id || `bv-${idx}`;
      const vDate = (bv.date || '').slice(0, 10);
      const vCharge = Number(bv.charge || 0);
      const vReceived = Number(bv.received !== undefined ? bv.received : (bv.paid !== undefined ? bv.paid : 0));
      const vDue = Math.max(0, vCharge - vReceived);

      visitMap.set(vKey, {
        ...bv,
        date: vDate,
        charge: vCharge,
        received: vReceived,
        due: vDue,
        caseId: bv.caseId || vKey,
        famId: bv.familyId || '',
        patId: bv.patientId || '',
        patName: bv.patientName || 'Patient',
        patAge: bv.patientAge || '',
        patGender: bv.patientGender || '',
        patPhone: bv.patientPhone || '',
        complaint: bv.complaint || '',
        diagnosis: bv.diagnosis || '',
        area: '',
      });
    });

    families.forEach((fam) => {
      const famId = fam.famId || fam.id || fam._id || '';
      const famHead = fam.headName || fam.name || 'Family Head';
      const famArea = fam.area || fam.society || '';
      const patList = Array.isArray(fam.patients) ? fam.patients : Object.values(fam.patients || {});

      patList.forEach((pat) => {
        const patId = pat.patId || pat.id || pat._id || '';
        const patName = pat.name || 'Patient';
        const patPhone = pat.phone || fam.phone || '';
        const patAge = pat.age || '';
        const patGender = pat.gender || 'Male';
        const patRelation = pat.relation || 'Head';
        const patBloodGroup = pat.bloodGroup || '';

        // Match visits for this patient
        const patVisits = Array.from(visitMap.values()).filter(
          (v) =>
            (patId && (v.patId === patId || String(v.patientId) === String(patId))) ||
            (pat._id && (String(v.patientId) === String(pat._id) || String(v.patId) === String(pat._id)))
        );

        if (Array.isArray(pat.visits)) {
          pat.visits.forEach((v, idx) => {
            const vKey = v.caseId || v.id || `${famId}-${patId}-${v.date}-${idx}`;
            if (!visitMap.has(vKey)) {
              const vDate = (v.date || '').slice(0, 10);
              const vCharge = Number(v.charge || 0);
              const vReceived = Number(v.received !== undefined ? v.received : (v.paid !== undefined ? v.paid : 0));
              const vDue = Math.max(0, vCharge - vReceived);
              const vObj = {
                ...v,
                date: vDate,
                charge: vCharge,
                received: vReceived,
                due: vDue,
                caseId: v.caseId || vKey,
                isFirstVisit: idx === 0,
                famId,
                famHead,
                patId,
                patName,
                patAge,
                patGender,
                patPhone,
                area: famArea,
              };
              visitMap.set(vKey, vObj);
              patVisits.push(vObj);
            }
          });
        }

        // Link metadata for any visits
        patVisits.forEach((v) => {
          v.famId = famId;
          v.famHead = famHead;
          v.patId = patId;
          v.patName = patName;
          v.patAge = patAge;
          v.patGender = patGender;
          v.patPhone = patPhone;
          v.area = famArea;
        });

        const totalDue = patVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);
        const lastVisit = patVisits.length > 0 ? patVisits[0] : null;

        flatPatients.push({
          fam: { ...fam, id: famId, famId, headName: famHead, area: famArea },
          pat: {
            ...pat,
            id: patId,
            patId: patId,
            name: patName,
            relation: patRelation,
            age: patAge,
            gender: patGender,
            phone: patPhone,
            area: famArea,
            bloodGroup: patBloodGroup,
          },
          totalDue,
          lastVisit,
          visitCount: patVisits.length,
        });
      });
    });

    const allVisits = Array.from(visitMap.values());
    allVisits.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return {
      db,
      families,
      flatPatients,
      allVisits,
      appointments,
      bills,
    };
  }

  function getTargetVisits(allVisits) {
    const curToday = todayISO();
    if (datePreset === 'yesterday') {
      const yDate = getYesterdayISO();
      return allVisits.filter((v) => (v.date || '').slice(0, 10) === yDate);
    } else if (datePreset === 'week') {
      const weekAgo = getDaysAgoISO(7);
      return allVisits.filter((v) => {
        const d = (v.date || '').slice(0, 10);
        return d >= weekAgo && d <= curToday;
      });
    } else if (datePreset === 'month') {
      const monthStart = getMonthStartISO();
      return allVisits.filter((v) => {
        const d = (v.date || '').slice(0, 10);
        return d >= monthStart && d <= curToday;
      });
    } else if (datePreset === 'today') {
      return allVisits.filter((v) => (v.date || '').slice(0, 10) === curToday);
    } else {
      return allVisits.filter((v) => (v.date || '').slice(0, 10) === dateFilter);
    }
  }

  function getPresetBadgeText() {
    if (datePreset === 'today') return 'Today';
    if (datePreset === 'yesterday') return 'Yesterday';
    if (datePreset === 'week') return 'Last 7 Days';
    if (datePreset === 'month') return 'This Month';
    return fmtDate(dateFilter);
  }

  function getCollectionsTitle() {
    if (datePreset === 'today') return 'Total Today Collections';
    if (datePreset === 'yesterday') return 'Yesterday Collections';
    if (datePreset === 'week') return 'Last 7 Days Collections';
    if (datePreset === 'month') return 'This Month Collections';
    return `Collections on ${fmtDate(dateFilter)}`;
  }

  function getToolbarTitle() {
    if (activeTab === 'visits') {
      if (datePreset === 'today') return `OPD Consultations Today (${fmtDate(todayISO())})`;
      if (datePreset === 'yesterday') return `OPD Consultations Yesterday (${fmtDate(getYesterdayISO())})`;
      if (datePreset === 'week') return `OPD Consultations in Last 7 Days`;
      if (datePreset === 'month') return `OPD Consultations in This Month`;
      return `OPD Consultations on ${fmtDate(dateFilter)}`;
    }
    if (activeTab === 'collections') {
      if (datePreset === 'today') return `Daily Collections Today (${fmtDate(todayISO())})`;
      if (datePreset === 'yesterday') return `Daily Collections Yesterday (${fmtDate(getYesterdayISO())})`;
      if (datePreset === 'week') return `Daily Collections in Last 7 Days`;
      if (datePreset === 'month') return `Daily Collections in This Month`;
      return `Daily Collections on ${fmtDate(dateFilter)}`;
    }
    if (activeTab === 'dues') {
      return `Outstanding Due Balance & Defaulters List`;
    }
    return `Registered Patient Population`;
  }

  async function render() {
    const data = await loadData();
    const { families, flatPatients, allVisits } = data;

    const targetVisits = getTargetVisits(allVisits);

    const newPatientsCount = targetVisits.filter((v) => v.isFirstVisit).length;
    const reVisitsCount = targetVisits.length - newPatientsCount;

    const dateBilled = targetVisits.reduce((s, v) => s + (Number(v.charge) || 0), 0);
    const dateReceived = targetVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const dateDue = targetVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);
    const totalClinicDue = flatPatients.reduce((s, p) => s + p.totalDue, 0);
    const defaultersCount = flatPatients.filter((p) => p.totalDue > 0).length;

    container.innerHTML = `
      <div class="cms-dash-container" style="max-width: 100%; width: 100%;">
        
        <!-- Header Controls & Date Presets -->
        <div class="cms-dash-header">
          <div class="cms-dash-filter-group">
            <span class="font-display" style="font-weight: 800; font-size: 16px; display: inline-flex; align-items: center; gap: 8px; color: var(--primary);">
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

        <!-- 4 High-Impact KPI Cards -->
        <div class="cms-dash-kpi-grid">
          
          <!-- KPI 1: OPD Visits -->
          <div class="cms-kpi-card tone-opd ${activeTab === 'visits' ? 'active' : ''}" data-tab="visits">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-stethoscope"></i></div>
              <span class="cms-kpi-badge" style="background: #e0f2fe; color: #0369a1;">${getPresetBadgeText()}</span>
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

          <!-- KPI 2: Total Collections -->
          <div class="cms-kpi-card tone-revenue ${activeTab === 'collections' ? 'active' : ''}" data-tab="collections">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
              <span class="cms-kpi-badge" style="background: #d1fae5; color: #059669;">Collected</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val" style="color: #059669;">${fmtMoney(dateReceived)}</div>
              <div class="cms-kpi-title">${getCollectionsTitle()}</div>
            </div>
            <div class="cms-kpi-meta">
              <span>Billed: <b>${fmtMoney(dateBilled)}</b></span>
              <span>&bull;</span>
              <span>Due: <b style="color: ${dateDue > 0 ? '#dc2626' : 'inherit'};">${fmtMoney(dateDue)}</b></span>
            </div>
          </div>

          <!-- KPI 3: Total Due Balance -->
          <div class="cms-kpi-card tone-dues ${activeTab === 'dues' ? 'active' : ''}" data-tab="dues">
            <div class="cms-kpi-top">
              <div class="cms-kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <span class="cms-kpi-badge" style="background: #fee2e2; color: #dc2626;">Outstanding</span>
            </div>
            <div class="cms-kpi-value-group">
              <div class="cms-kpi-val" style="color: #dc2626;">${fmtMoney(totalClinicDue)}</div>
              <div class="cms-kpi-title">Total Due Balance</div>
            </div>
            <div class="cms-kpi-meta">
              <span style="color: #dc2626;"><b>${defaultersCount}</b> Patients with Pending Due</span>
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

        </div>

        <!-- Expanded Full-Width Main Workspace Layout -->
        <div class="cms-dash-layout-grid" style="display: block; width: 100%;">
          
          <div class="cms-dash-table-card" style="width: 100%;">
            
            <div class="cms-dash-tab-nav">
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'visits' ? 'active' : ''}" data-tab="visits">
                <i class="fa-solid fa-stethoscope"></i>
                <span>OPD Consultations</span>
                <span class="cms-dash-tab-count">${targetVisits.length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'collections' ? 'active' : ''}" data-tab="collections">
                <i class="fa-solid fa-indian-rupee-sign"></i>
                <span>Daily Collections</span>
                <span class="cms-dash-tab-count">${targetVisits.filter(v => Number(v.received) > 0 || Number(v.charge) > 0).length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'dues' ? 'active' : ''}" data-tab="dues">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Due Defaulters</span>
                <span class="cms-dash-tab-count">${flatPatients.filter(p => p.totalDue > 0).length}</span>
              </button>
              <button type="button" class="cms-dash-tab-btn ${activeTab === 'patients' ? 'active' : ''}" data-tab="patients">
                <i class="fa-solid fa-user-group"></i>
                <span>Patient Directory</span>
                <span class="cms-dash-tab-count">${flatPatients.length}</span>
              </button>
            </div>

            <div class="cms-dash-toolbar">
              <div style="font-weight: 800; font-size: 13.5px; color: var(--text);">
                ${getToolbarTitle()}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="text" id="dash-tab-search" class="cms-input cms-dash-search-input" placeholder="Search table..." value="${searchQuery}" style="min-width: 250px;" />
              </div>
            </div>

            <div class="cms-table-wrapper cms-dash-table-body" id="dash-active-table-body">
              ${renderActiveTableHTML(data, targetVisits)}
            </div>

          </div>

        </div>

      </div>
    `;

    attachEventListeners(data);
  }

  function renderActiveTableHTML(data, targetVisits) {
    const { flatPatients } = data;
    const q = searchQuery.toLowerCase().trim();

    if (activeTab === 'visits') {
      let list = targetVisits;
      if (q) {
        list = list.filter(
          (v) =>
            (v.patName || '').toLowerCase().includes(q) ||
            (v.caseId || '').toLowerCase().includes(q) ||
            (v.complaint || '').toLowerCase().includes(q) ||
            (v.diagnosis || '').toLowerCase().includes(q) ||
            (v.patId || '').toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-clipboard-question" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>No patient visits recorded for this selected date filter.</div>`;
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
                  <div style="font-size: 11px; color: var(--text-muted);">${v.famHead} &middot; PT ${v.patId || '—'}</div>
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

    if (activeTab === 'collections') {
      let list = targetVisits.filter((v) => Number(v.received) > 0 || Number(v.charge) > 0);
      if (q) {
        list = list.filter(
          (v) =>
            (v.patName || '').toLowerCase().includes(q) ||
            (v.caseId || '').toLowerCase().includes(q) ||
            (v.famHead || '').toLowerCase().includes(q) ||
            (v.patId || '').toLowerCase().includes(q)
        );
      }

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-receipt" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>No payment collections or billings recorded for this date filter.</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 85px;">Time</th>
              <th style="width: 130px;">Case ID</th>
              <th>Patient Name</th>
              <th>Family Head</th>
              <th>Area / Locality</th>
              <th style="text-align: right; width: 100px;">Fee Charged</th>
              <th style="text-align: right; width: 100px;">Received</th>
              <th style="text-align: right; width: 90px;">Due Left</th>
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
                  <div style="font-size: 11px; color: var(--text-muted);">PT ${v.patId || '—'}</div>
                </td>
                <td>${v.famHead || '—'}</td>
                <td>${v.area || '—'}</td>
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

    if (activeTab === 'dues') {
      let list = flatPatients.filter((p) => p.totalDue > 0);
      if (q) {
        list = list.filter(
          ({ fam, pat }) =>
            (pat.name || '').toLowerCase().includes(q) ||
            (pat.patId || pat.id || '').toLowerCase().includes(q) ||
            (fam.headName || '').toLowerCase().includes(q) ||
            (fam.area || '').toLowerCase().includes(q) ||
            (pat.phone || fam.phone || '').includes(q)
        );
      }

      list.sort((a, b) => b.totalDue - a.totalDue);

      if (list.length === 0) {
        return `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-circle-check" style="font-size: 28px; margin-bottom: 8px; display: block; color: #059669;"></i>No pending dues! All patient accounts are completely settled.</div>`;
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 140px;">Patient ID</th>
              <th>Patient Name</th>
              <th style="width: 90px;">Relation</th>
              <th>Family Head</th>
              <th>Area / Locality</th>
              <th style="width: 120px;">Contact Phone</th>
              <th style="width: 100px; text-align: center;">Total Visits</th>
              <th style="text-align: right; width: 120px;">Total Due</th>
              <th style="text-align: right; width: 120px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list
              .map(
                ({ fam, pat, totalDue, visitCount }) => `
              <tr class="cms-clickable-row" data-famid="${fam.id}" data-patid="${pat.patId || pat.id}">
                <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">PT ${pat.patId || pat.id || '—'}</td>
                <td>
                  <b style="color: var(--text);">${pat.name}</b>
                </td>
                <td>${pat.relation || 'Head'}</td>
                <td>${fam.headName}</td>
                <td>${fam.area || '—'}</td>
                <td class="font-mono" style="white-space: nowrap;"><i class="fa-solid fa-phone" style="font-size: 10px; color: var(--text-muted);"></i> ${pat.phone || fam.phone || '—'}</td>
                <td style="text-align: center;"><span class="cms-pill cms-badge-neutral font-mono">${visitCount}</span></td>
                <td class="font-mono" style="text-align: right; font-weight: 800; color: #dc2626; font-size: 13.5px; white-space: nowrap;">${fmtMoney(totalDue)}</td>
                <td style="text-align: right; white-space: nowrap;">
                  <button type="button" class="cms-btn cms-btn-ghost btn-open-case-direct" data-famid="${fam.id}" data-patid="${pat.patId || pat.id}" style="padding: 4px 8px; font-size: 11.5px; color: #dc2626; font-weight: 700; border: 1px solid #fecaca; background: #fff5f5;">
                    Open Due <i class="fa-solid fa-arrow-right"></i>
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

    if (activeTab === 'patients') {
      let list = flatPatients;
      if (q) {
        list = list.filter(
          ({ fam, pat }) =>
            (pat.name || '').toLowerCase().includes(q) ||
            (pat.patId || pat.id || '').toLowerCase().includes(q) ||
            (fam.headName || '').toLowerCase().includes(q) ||
            (fam.area || '').toLowerCase().includes(q) ||
            (pat.phone || fam.phone || '').includes(q)
        );
      }

      return `
        <table class="cms-table">
          <thead>
            <tr>
              <th style="width: 140px;">Patient ID</th>
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
              <tr class="cms-clickable-row" data-famid="${fam.id}" data-patid="${pat.patId || pat.id}">
                <td class="font-mono" style="font-weight: 800; color: var(--primary); white-space: nowrap;">PT ${pat.patId || pat.id || '—'}</td>
                <td><b>${pat.name}</b></td>
                <td>${pat.relation || 'Head'}</td>
                <td>${fam.headName}</td>
                <td>${fam.area || '—'}</td>
                <td class="font-mono" style="white-space: nowrap;">${pat.phone || fam.phone || '—'}</td>
                <td><span class="font-mono">${pat.bloodGroup || '—'}</span></td>
                <td style="text-align: center;"><span class="cms-pill cms-badge-neutral font-mono">${visitCount}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                  <button type="button" class="cms-btn cms-btn-ghost btn-open-case-direct" data-famid="${fam.id}" data-patid="${pat.patId || pat.id}" style="padding: 4px 8px; font-size: 11.5px; color: var(--primary); font-weight: 700;">
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

    return '';
  }

  function attachEventListeners(data) {
    const handleNav = (viewName, sel = null) => {
      if (onNavigate) {
        onNavigate(viewName, sel);
      } else {
        const navItem = document.querySelector(`.cms-nav-item[data-view="${viewName}"]`);
        if (navItem) navItem.click();
      }
    };

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
        if (e.target.value) {
          dateFilter = e.target.value;
          datePreset = 'custom';
          render();
        }
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
          const targetVisits = getTargetVisits(data.allVisits);
          tableMount.innerHTML = renderActiveTableHTML(data, targetVisits);
          attachTableInteractions(handleNav);
        }
      });
    }

    container.querySelector('#btn-quick-new-visit')?.addEventListener('click', () => {
      handleNav('case');
    });

    container.querySelector('#btn-quick-add-patient')?.addEventListener('click', () => {
      handleNav('patient');
    });

    container.querySelector('#btn-quick-add-family')?.addEventListener('click', () => {
      handleNav('family');
    });

    attachTableInteractions(handleNav);
  }

  function attachTableInteractions(handleNav) {
    container.querySelectorAll('.cms-clickable-row').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const famId = row.getAttribute('data-famid');
        const patId = row.getAttribute('data-patid');
        if (famId && patId) {
          if (onSelectPatient) onSelectPatient(famId, patId);
          else if (handleNav) handleNav('case', { familyId: famId, patientId: patId });
        }
      });
    });

    container.querySelectorAll('.btn-open-case-direct, .btn-open-fu-case').forEach((btn) => {
      btn.addEventListener('click', () => {
        const famId = btn.getAttribute('data-famid');
        const patId = btn.getAttribute('data-patid');
        if (famId && patId) {
          if (onSelectPatient) onSelectPatient(famId, patId);
          else if (handleNav) handleNav('case', { familyId: famId, patientId: patId });
        }
      });
    });
  }

  await render();
}
