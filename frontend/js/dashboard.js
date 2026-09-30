/**
 * =========================================================
 * DASHBOARD VIEW CONTROLLER
 * Statistics, Date filtering, and Clinic overview tables
 * =========================================================
 */

import { apiFetch, todayISO, fmtDate, fmtMoney, getLocalDB, getAuthSession } from './api.js';

export async function renderDashboard(container, onSelectPatient) {
  let dateFilter = todayISO();
  let activeTab = 'visits'; // 'visits' | 'families' | 'patients' | 'dues'

  container.innerHTML = `
    <div class="cms-dash-container">
      <!-- Date Filter Bar -->
      <div class="cms-dash-header">
        <div class="cms-dash-date-filter">
          <span style="font-size: 18px;">📅</span>
          <span class="font-display" style="font-weight: 800; font-size: 16px;">Dashboard Filter Date:</span>
          <input type="date" id="dash-date-picker" class="cms-input cms-dash-date-input" value="${dateFilter}" />
        </div>
        <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">
          Click any stat card below to view detailed breakdown
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="cms-stat-grid" id="dash-stat-grid">
        <div class="cms-stat-card" id="card-families" data-tab="families">
          <div class="cms-stat-top">
            <div class="cms-stat-icon">👥</div>
            <span class="cms-kbd">All</span>
          </div>
          <div class="cms-stat-value" id="stat-families">-</div>
          <div class="cms-stat-label">Registered Families</div>
        </div>

        <div class="cms-stat-card" id="card-patients" data-tab="patients">
          <div class="cms-stat-top">
            <div class="cms-stat-icon">🩺</div>
            <span class="cms-kbd">All</span>
          </div>
          <div class="cms-stat-value" id="stat-patients">-</div>
          <div class="cms-stat-label">Total Patients</div>
        </div>

        <div class="cms-stat-card active tone-accent" id="card-visits" data-tab="visits">
          <div class="cms-stat-top">
            <div class="cms-stat-icon" style="color: var(--accent);">📋</div>
            <span class="cms-kbd" id="stat-date-badge">Today</span>
          </div>
          <div class="cms-stat-value" id="stat-visits">-</div>
          <div class="cms-stat-label">Date's Visits</div>
        </div>

        <div class="cms-stat-card">
          <div class="cms-stat-top">
            <div class="cms-stat-icon" style="color: var(--success);">💰</div>
            <span class="cms-kbd">Collection</span>
          </div>
          <div class="cms-stat-value" id="stat-collection">-</div>
          <div class="cms-stat-label">Date's Collection</div>
        </div>

        <div class="cms-stat-card tone-danger" id="card-dues" data-tab="dues">
          <div class="cms-stat-top">
            <div class="cms-stat-icon" style="color: var(--danger);">⚠️</div>
            <span class="cms-kbd">Pending</span>
          </div>
          <div class="cms-stat-value" id="stat-dues" style="color: var(--danger);">-</div>
          <div class="cms-stat-label">Total Outstanding Dues</div>
        </div>
      </div>

      <!-- Main Overview Area -->
      <div class="cms-dash-main-grid">
        <div class="cms-card" id="dash-main-card">
          <div class="cms-card-header">
            <div class="cms-card-title" id="dash-table-title">Visits</div>
          </div>
          <div class="cms-table-wrapper" id="dash-table-container">
            <div style="padding: 30px; text-align: center; color: var(--text-muted);">Loading records...</div>
          </div>
        </div>

        <div class="cms-card" id="dash-side-dues-card">
          <div class="cms-card-header">
            <div class="cms-card-title" style="color: var(--danger);">Top Outstanding Dues</div>
          </div>
          <div id="dash-dues-list" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="padding: 20px; text-align: center; color: var(--text-muted);">Loading dues...</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  const datePicker = container.querySelector('#dash-date-picker');
  datePicker.addEventListener('change', (e) => {
    dateFilter = e.target.value;
    activeTab = 'visits';
    updateDashboardUI();
  });

  const cards = container.querySelectorAll('.cms-stat-card[data-tab]');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      activeTab = card.getAttribute('data-tab');
      cards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      updateDashboardUI();
    });
  });

  async function updateDashboardUI() {
    const session = getAuthSession();
    const clinicId = session?.profile?.activeClinicId || 'demo';
    const db = getLocalDB(clinicId);

    // Fetch live stats or use local DB
    let stats = null;
    try {
      const res = await apiFetch(`/reports/stats?date=${dateFilter}`);
      if (res && res.data) stats = res.data;
    } catch (e) {}

    // Extract flat records from local DB
    const families = Object.values(db.families || {});
    const flatPatients = [];
    const allVisits = [];

    families.forEach((fam) => {
      Object.values(fam.patients || {}).forEach((pat) => {
        const totalDue = (pat.visits || []).reduce((s, v) => s + (Number(v.due) || 0), 0);
        const lastVisit = pat.visits && pat.visits.length > 0 ? pat.visits[pat.visits.length - 1] : null;
        flatPatients.push({ fam, pat, totalDue, lastVisit });

        (pat.visits || []).forEach((v) => {
          allVisits.push({
            ...v,
            famId: fam.id,
            famHead: fam.headName,
            patId: pat.id,
            patName: pat.name,
          });
        });
      });
    });

    const targetVisits = allVisits.filter((v) => v.date === dateFilter);
    const dateCollection = targetVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const totalDuesAmount = flatPatients.reduce((s, p) => s + p.totalDue, 0);

    // Update Counter Elements
    container.querySelector('#stat-families').textContent = families.length;
    container.querySelector('#stat-patients').textContent = flatPatients.length;
    container.querySelector('#stat-visits').textContent = targetVisits.length;
    container.querySelector('#stat-collection').textContent = fmtMoney(dateCollection);
    container.querySelector('#stat-dues').textContent = fmtMoney(totalDuesAmount);
    container.querySelector('#stat-date-badge').textContent = dateFilter === todayISO() ? 'Today' : fmtDate(dateFilter);

    // Update Main Table based on active tab
    const titleEl = container.querySelector('#dash-table-title');
    const tableEl = container.querySelector('#dash-table-container');

    if (activeTab === 'visits') {
      titleEl.textContent = `Visits on ${fmtDate(dateFilter)} (${targetVisits.length})`;
      if (targetVisits.length === 0) {
        tableEl.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">No visits recorded on this date.</div>`;
      } else {
        tableEl.innerHTML = `
          <table class="cms-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Case ID</th>
                <th>Patient</th>
                <th>Complaint</th>
                <th>Diagnosis</th>
                <th>Charge</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              ${targetVisits
                .map(
                  (v) => `
                <tr class="cms-clickable" data-famid="${v.famId}" data-patid="${v.patId}">
                  <td class="font-mono">${v.time || '-'}</td>
                  <td class="font-mono" style="font-weight: 700; color: var(--primary);">${v.caseId}</td>
                  <td>
                    <b>${v.patName}</b>
                    <div style="font-size: 11px; color: var(--text-muted);">${v.famHead}</div>
                  </td>
                  <td>${v.complaint || '-'}</td>
                  <td><span class="cms-pill cms-badge-neutral">${v.diagnosis || '-'}</span></td>
                  <td class="font-mono">${fmtMoney(v.charge)}</td>
                  <td class="font-mono" style="color: var(--success); font-weight: 700;">${fmtMoney(v.received)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      }
    } else if (activeTab === 'families') {
      titleEl.textContent = `All Registered Families (${families.length})`;
      tableEl.innerHTML = `
        <table class="cms-table">
          <thead>
            <tr>
              <th>Fam ID</th>
              <th>Head Name</th>
              <th>Area</th>
              <th>Phone</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            ${families
              .map(
                (f) => `
              <tr class="cms-clickable" data-famid="${f.id}" data-patid="${Object.keys(f.patients || {})[0] || ''}">
                <td class="font-mono" style="font-weight: 700;">FAM ${f.id}</td>
                <td><b>${f.headName}</b></td>
                <td>${f.area || '-'}</td>
                <td class="font-mono">${f.phone || '-'}</td>
                <td><span class="cms-pill cms-badge-paid">${Object.keys(f.patients || {}).length} Members</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'patients') {
      titleEl.textContent = `All Registered Patients (${flatPatients.length})`;
      tableEl.innerHTML = `
        <table class="cms-table">
          <thead>
            <tr>
              <th>Pat ID</th>
              <th>Patient Name</th>
              <th>Relation</th>
              <th>Family Head</th>
              <th>Blood Grp</th>
              <th>Allergy</th>
            </tr>
          </thead>
          <tbody>
            ${flatPatients
              .map(
                ({ fam, pat }) => `
              <tr class="cms-clickable" data-famid="${fam.id}" data-patid="${pat.id}">
                <td class="font-mono" style="font-weight: 700;">PT ${pat.id}</td>
                <td><b>${pat.name}</b></td>
                <td>${pat.relation || 'Head'}</td>
                <td>${fam.headName}</td>
                <td><span class="font-mono">${pat.bloodGroup || '-'}</span></td>
                <td><span style="color: var(--danger);">${pat.allergy || '-'}</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'dues') {
      const duesOnly = flatPatients.filter((p) => p.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue);
      titleEl.textContent = `Outstanding Dues (${duesOnly.length} Patients)`;
      if (duesOnly.length === 0) {
        tableEl.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--success); font-weight: 600;">✨ All accounts are fully settled. No pending dues!</div>`;
      } else {
        tableEl.innerHTML = `
          <table class="cms-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Family Head</th>
                <th>Last Visit</th>
                <th style="text-align: right;">Pending Due</th>
              </tr>
            </thead>
            <tbody>
              ${duesOnly
                .map(
                  ({ fam, pat, totalDue, lastVisit }) => `
                <tr class="cms-clickable" data-famid="${fam.id}" data-patid="${pat.id}">
                  <td><b>${pat.name}</b> <span class="cms-kbd" style="margin-left: 6px;">PT ${pat.id}</span></td>
                  <td>${fam.headName}</td>
                  <td class="font-mono">${lastVisit ? fmtDate(lastVisit.date) : '-'}</td>
                  <td class="font-mono" style="text-align: right; color: var(--danger); font-weight: 800;">${fmtMoney(totalDue)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      }
    }

    // Attach row click handlers for navigating to Case Entry
    tableEl.querySelectorAll('tr.cms-clickable').forEach((row) => {
      row.addEventListener('click', () => {
        const famId = row.getAttribute('data-famid');
        const patId = row.getAttribute('data-patid');
        if (famId && patId && onSelectPatient) {
          onSelectPatient(famId, patId);
        }
      });
    });

    // Populate Top Dues Sidebar
    const duesListEl = container.querySelector('#dash-dues-list');
    const topDues = flatPatients.filter((p) => p.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue).slice(0, 6);

    if (topDues.length === 0) {
      duesListEl.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px;">No outstanding dues.</div>`;
    } else {
      duesListEl.innerHTML = topDues
        .map(
          ({ fam, pat, totalDue }) => `
        <div class="cms-due-item" data-famid="${fam.id}" data-patid="${pat.id}">
          <div>
            <div style="font-size: 13px; font-weight: 700;">${pat.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${fam.headName} &middot; FAM ${fam.id}</div>
          </div>
          <span class="cms-pill cms-badge-due font-mono">${fmtMoney(totalDue)}</span>
        </div>
      `
        )
        .join('');

      duesListEl.querySelectorAll('.cms-due-item').forEach((item) => {
        item.addEventListener('click', () => {
          const famId = item.getAttribute('data-famid');
          const patId = item.getAttribute('data-patid');
          if (famId && patId && onSelectPatient) {
            onSelectPatient(famId, patId);
          }
        });
      });
    }
  }

  // Initial Load
  updateDashboardUI();
}
