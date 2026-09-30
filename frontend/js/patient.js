/**
 * =========================================================
 * PATIENT & FAMILY MEMBER MANAGEMENT
 * Adding family members, blood group/allergy autocomplete
 * =========================================================
 */

import { apiFetch, getLocalDB, saveLocalDB, getAuthSession, pad, showToast } from './api.js';

export function renderPatientRegistration(container, presetFamId = null, onSelectPatient) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  let selectedFamId = presetFamId || '';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <form id="form-add-member" class="cms-card" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="font-display" style="font-weight: 800; font-size: 16px;">
          ${presetFamId ? 'Step 2 &middot; Add Member Details' : 'Add Member to Existing Family'}
        </div>

        ${
          presetFamId && db.families[presetFamId]
            ? `
          <div style="background: var(--primary-soft); color: var(--primary-dark); padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600;">
            Family ID <span class="font-mono">FAM ${presetFamId}</span> for <b>${db.families[presetFamId].headName}</b> selected.
          </div>
        `
            : `
          <div class="cms-form-group">
            <label class="cms-label">Select Family *</label>
            <select id="member-famid-select" class="cms-select" required>
              <option value="">-- Choose Family --</option>
              ${Object.values(db.families || {})
                .map((f) => `<option value="${f.id}" ${f.id === selectedFamId ? 'selected' : ''}>FAM ${f.id} - ${f.headName} (${f.area || 'No Area'})</option>`)
                .join('')}
            </select>
          </div>
        `
        }

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px;">
          <div class="cms-form-group">
            <label class="cms-label">Member Full Name *</label>
            <input type="text" id="member-name-input" class="cms-input" required placeholder="(SURNAME NAME FATHER/HUSBAND'S NAME)" autofocus />
          </div>

          <div class="cms-form-group">
            <label class="cms-label">Relation to Head *</label>
            <input type="text" id="member-rel-input" class="cms-input" list="dl-relation-list" required placeholder="e.g. Wife, Son, Daughter, Mother" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 14px;">
          <div class="cms-form-group">
            <label class="cms-label">Age</label>
            <input type="text" id="member-age-input" class="cms-input" placeholder="e.g. 35, 6M" />
          </div>

          <div class="cms-form-group">
            <label class="cms-label">Blood Group</label>
            <select id="member-blood-input" class="cms-select">
              <option value="">-- Blood Group --</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div class="cms-form-group">
            <label class="cms-label">Known Allergies</label>
            <input type="text" id="member-allergy-input" class="cms-input" placeholder="e.g. DUST, SULFA, PEANUTS" />
          </div>
        </div>

        <div style="margin-top: 6px;">
          <button type="submit" class="cms-btn cms-btn-primary" style="width: 100%;">
            <span>➕</span>
            <span>Save Member &amp; Open Patient Record</span>
            <span class="cms-kbd">Enter</span>
          </button>
        </div>
      </form>
    </div>
  `;

  // Autocomplete Datalist for Relations
  renderRelationDatalist();

  const form = container.querySelector('#form-add-member');
  const famSelect = container.querySelector('#member-famid-select');
  const nameInput = container.querySelector('#member-name-input');
  const relInput = container.querySelector('#member-rel-input');
  const ageInput = container.querySelector('#member-age-input');
  const bloodInput = container.querySelector('#member-blood-input');
  const allergyInput = container.querySelector('#member-allergy-input');

  nameInput.addEventListener('input', (e) => {
    nameInput.value = e.target.value.replace(/,/g, ' ').replace(/\s+/g, ' ').toUpperCase();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const famId = presetFamId || (famSelect ? famSelect.value : '');
    const name = nameInput.value.trim().toUpperCase();
    const relation = relInput.value.trim();
    const age = ageInput.value.trim();
    const bloodGroup = bloodInput.value;
    const allergy = allergyInput.value.trim().toUpperCase();

    if (!famId) {
      showToast('Please select a family', 'error');
      return;
    }
    if (!name) {
      showToast('Please enter member name', 'error');
      return;
    }

    let createdPatId = null;

    try {
      const res = await apiFetch('/patients/member', {
        method: 'POST',
        body: { familyId: famId, name, relation, age, bloodGroup, allergy },
      });
      if (res && res.success && res.data) {
        createdPatId = res.data.patId;
      }
    } catch (err) {}

    // Fallback sync to local DB
    if (!createdPatId) {
      const nextPatId = pad(db.counters.patient, 4);
      const pat = {
        id: nextPatId,
        patId: nextPatId,
        familyId: famId,
        name,
        relation,
        age,
        bloodGroup,
        allergy,
        visits: [],
      };

      db.counters.patient += 1;
      if (db.families[famId]) {
        if (!db.families[famId].patients) db.families[famId].patients = {};
        db.families[famId].patients[nextPatId] = pat;
      }
      saveLocalDB(db, clinicId);
      createdPatId = nextPatId;
    }

    showToast(`${name} added to Family ${famId}!`);
    form.reset();

    if (onSelectPatient) {
      onSelectPatient(famId, createdPatId);
    }
  });

  function renderRelationDatalist() {
    const existing = document.getElementById('dl-relation-list');
    if (existing) existing.remove();

    const dl = document.createElement('datalist');
    dl.id = 'dl-relation-list';
    ['Head', 'Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother'].forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r;
      dl.appendChild(opt);
    });
    document.body.appendChild(dl);
  }
}
