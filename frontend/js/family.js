/**
 * =========================================================
 * FAMILY MANAGEMENT CONTROLLER
 * Family Head Registration, Auto-ID Generation & Tree View
 * =========================================================
 */

import { apiFetch, getLocalDB, saveLocalDB, getAuthSession, pad, todayISO, showToast } from './api.js';

export function renderFamilyRegistration(container, onSelectPatient, onAddedFamily) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  let filterQuery = '';
  let expandedFamId = null;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
        <!-- Left: Register Family Head Form -->
        <form id="form-new-family" class="cms-card" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="font-display" style="font-weight: 800; font-size: 16px;">Step 1 &middot; Register Family Head</div>
          <div style="font-size: 13px; color: var(--text-muted); margin-top: -6px; line-height: 1.5;">
            Enter the family head's name and area. A numeric Family ID is generated instantly. Then add each family member through the member form.
          </div>

          <div class="cms-form-group">
            <label class="cms-label">Family Head Name *</label>
            <input type="text" id="head-name-input" class="cms-input" required placeholder="(SURNAME NAME FATHER'S NAME)" autofocus />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="cms-form-group">
              <label class="cms-label">Area / Location</label>
              <input type="text" id="head-area-input" class="cms-input" list="dl-area-list" placeholder="e.g. Vastrapur, Satellite" />
            </div>
            <div class="cms-form-group">
              <label class="cms-label">Phone Number</label>
              <input type="tel" id="head-phone-input" class="cms-input" placeholder="10-digit mobile" />
            </div>
          </div>

          <div style="margin-top: 6px;">
            <button type="submit" class="cms-btn cms-btn-primary" style="width: 100%;">
              <span>💾</span>
              <span>Generate Family ID &amp; Continue</span>
              <span class="cms-kbd">Enter</span>
            </button>
          </div>
        </form>

        <!-- Right: Registered Families Directory -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px; max-height: 580px; overflow-y: auto;">
          <div class="cms-card-header" style="margin-bottom: 0;">
            <div class="cms-card-title">Registered Families Directory</div>
          </div>

          <div style="position: relative;">
            <input type="text" id="family-search-input" class="cms-input cms-input-sm" placeholder="Search by head name, area, or FAM ID..." />
          </div>

          <div id="family-cards-list" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Dynamically Rendered -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Autocomplete Datalists
  renderAreaDatalist(container, db);

  // Form Submit Handler
  const form = container.querySelector('#form-new-family');
  const headNameInput = container.querySelector('#head-name-input');
  const areaInput = container.querySelector('#head-area-input');
  const phoneInput = container.querySelector('#head-phone-input');

  headNameInput.addEventListener('input', (e) => {
    headNameInput.value = e.target.value.replace(/,/g, ' ').replace(/\s+/g, ' ').toUpperCase();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const headName = headNameInput.value.trim().toUpperCase();
    const area = areaInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!headName) {
      showToast('Please enter family head name', 'error');
      return;
    }

    // Try backend API first
    let createdFamId = null;
    let createdPatId = null;

    try {
      const res = await apiFetch('/families', {
        method: 'POST',
        body: { headName, area, phone },
      });
      if (res && res.success && res.data) {
        createdFamId = res.data.family.famId;
        createdPatId = res.data.headPatient.patId;
      }
    } catch (e) {}

    // Fallback to local DB sync
    if (!createdFamId) {
      const nextFamId = pad(db.counters.family, 4);
      const nextPatId = pad(db.counters.patient, 4);

      const pat = {
        id: nextPatId,
        patId: nextPatId,
        familyId: nextFamId,
        name: headName,
        relation: 'Head',
        age: '',
        bloodGroup: '',
        allergy: '',
        phone,
        visits: [],
      };

      const fam = {
        id: nextFamId,
        famId: nextFamId,
        headName,
        area,
        phone,
        createdAt: todayISO(),
        patients: { [nextPatId]: pat },
      };

      db.counters.family += 1;
      db.counters.patient += 1;
      db.families[nextFamId] = fam;
      saveLocalDB(db, clinicId);

      createdFamId = nextFamId;
      createdPatId = nextPatId;
    }

    showToast(`Family ID ${createdFamId} generated successfully!`);
    form.reset();

    if (onAddedFamily) {
      onAddedFamily(createdFamId, createdPatId);
    } else if (onSelectPatient) {
      onSelectPatient(createdFamId, createdPatId);
    }

    renderFamilyList();
  });

  // Search Filter Handler
  const searchInput = container.querySelector('#family-search-input');
  searchInput.addEventListener('input', (e) => {
    filterQuery = e.target.value.toLowerCase().trim();
    renderFamilyList();
  });

  function renderFamilyList() {
    const listContainer = container.querySelector('#family-cards-list');
    const families = Object.values(db.families || {}).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const filtered = families.filter((f) => {
      if (!filterQuery) return true;
      if (f.headName.toLowerCase().includes(filterQuery)) return true;
      if ((f.id || '').includes(filterQuery)) return true;
      if ((f.area || '').toLowerCase().includes(filterQuery)) return true;
      return Object.values(f.patients || {}).some((p) => p.name.toLowerCase().includes(filterQuery));
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">No matching families found.</div>`;
      return;
    }

    listContainer.innerHTML = filtered
      .map((f) => {
        const isExpanded = expandedFamId === f.id || (filterQuery.length > 0 && filtered.length === 1);
        const memberCount = Object.keys(f.patients || {}).length;

        const membersHTML = Object.values(f.patients || {})
          .map(
            (p) => `
          <div class="cms-member-item cms-clickable" data-famid="${f.id}" data-patid="${p.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 4px; font-size: 13px;">
            <div>
              <b>${p.name}</b>
              <span style="color: var(--text-muted); font-size: 11.5px; margin-left: 6px;">(${p.relation || 'Member'})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="cms-kbd">PT ${p.id}</span>
              <span style="color: var(--primary); font-weight: 700;">➔</span>
            </div>
          </div>
        `
          )
          .join('');

        return `
        <div class="cms-family-block" style="border: 1px solid var(--border); border-radius: 12px; background: var(--surface-alt); overflow: hidden;">
          <div class="cms-family-header" data-toggle="${f.id}" style="padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 14px; color: var(--text);">${f.headName}</div>
              <div style="font-size: 11.5px; color: var(--text-muted);">
                ${f.area || 'No Area Specified'} &middot; ${memberCount} Member(s) &middot; 📞 ${f.phone || 'N/A'}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="cms-pill cms-badge-paid font-mono">FAM ${f.id}</span>
              <button type="button" class="cms-btn-danger cms-btn-del-fam" data-famid="${f.id}" style="padding: 4px 8px;" title="Delete Family">🗑️</button>
            </div>
          </div>

          ${
            isExpanded
              ? `
            <div style="padding: 8px 12px 12px; background: rgba(0,0,0,0.02); border-top: 1px solid var(--border-subtle);">
              <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Family Members:</div>
              ${membersHTML}
            </div>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');

    // Accordion Toggle Handlers
    listContainer.querySelectorAll('.cms-family-header').forEach((hdr) => {
      hdr.addEventListener('click', (e) => {
        if (e.target.closest('.cms-btn-del-fam')) return;
        const famId = hdr.getAttribute('data-toggle');
        expandedFamId = expandedFamId === famId ? null : famId;
        renderFamilyList();
      });
    });

    // Member Click Handlers (Navigate to patient case record)
    listContainer.querySelectorAll('.cms-member-item').forEach((item) => {
      item.addEventListener('click', () => {
        const famId = item.getAttribute('data-famid');
        const patId = item.getAttribute('data-patid');
        if (famId && patId && onSelectPatient) {
          onSelectPatient(famId, patId);
        }
      });
    });

    // Delete Family Handler
    listContainer.querySelectorAll('.cms-btn-del-fam').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const famId = btn.getAttribute('data-famid');
        if (confirm(`Are you sure you want to permanently delete Family ID ${famId}? This will erase all members and visits.`)) {
          try {
            await apiFetch(`/families/${famId}`, { method: 'DELETE' });
          } catch (err) {}
          delete db.families[famId];
          saveLocalDB(db, clinicId);
          showToast(`Deleted Family ID ${famId}`, 'error');
          renderFamilyList();
        }
      });
    });
  }

  function renderAreaDatalist(parent, db) {
    const existing = document.getElementById('dl-area-list');
    if (existing) existing.remove();

    const areas = new Set(['Vastrapur', 'Satellite', 'Navrangpura', 'Bopal', 'Thaltej', 'Amroli', 'Varachha']);
    Object.values(db.families || {}).forEach((f) => {
      if (f.area) areas.add(f.area);
    });

    const dl = document.createElement('datalist');
    dl.id = 'dl-area-list';
    areas.forEach((a) => {
      const opt = document.createElement('option');
      opt.value = a;
      dl.appendChild(opt);
    });
    document.body.appendChild(dl);
  }

  // Initial List Render
  renderFamilyList();
}
