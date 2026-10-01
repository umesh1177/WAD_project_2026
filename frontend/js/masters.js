/**
 * =========================================================
 * CLINICAL MASTER DATA MANAGEMENT CONTROLLER
 * Dietary Suggestions (Shortcut, Disease, What to Eat, What Not to Eat),
 * Area/Locations, Medicine Catalogue, Known Allergies,
 * Relation Hierarchy, Society/Flat, and Keyboard Shortcuts Masters
 * =========================================================
 */

import { apiFetch, getLocalDB, saveLocalDB, getAuthSession, todayISO, fmtDate, fmtMoney, showToast } from './api.js';

export function renderMastersView(container) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  // Ensure all master structures exist in db
  if (!db.dietary) db.dietary = {};
  if (!db.masterAreas) db.masterAreas = [];
  if (!db.masterMedicines) db.masterMedicines = [];
  if (!db.masterAllergies) db.masterAllergies = [];
  if (!db.masterRelations) db.masterRelations = [];
  if (!db.masterSocieties) db.masterSocieties = [];
  if (!db.customShortcuts) {
    db.customShortcuts = [
      { id: 'sc1', key: 'F1', target: 'family', title: 'Family Head Registration', desc: 'Register family head with auto-generated ID & directory' },
      { id: 'sc2', key: 'F2', target: 'patient', title: 'Add Family Member', desc: 'Add family member under registered family with live search' },
      { id: 'sc3', key: 'F3', target: 'case', title: 'Patient Record & Case', desc: 'Manage vitals, symptoms, diagnosis, and prescription prints' },
      { id: 'sc4', key: 'F4', target: 'dashboard', title: 'Clinical Dashboard', desc: 'Overview of daily visits, revenue, and queue metrics' },
      { id: 'sc5', key: 'F5', target: 'reports', title: 'Clinical Reports', desc: 'Financial, daily register, and disease summary reports' },
      { id: 'sc6', key: 'F6', target: 'certificates', title: 'Medical Certificate', desc: 'Generate and print sickness & fitness medical certificates' },
      { id: 'sc7', key: 'F7', target: 'masters', title: 'Master Data Setup', desc: 'Manage dietary, areas, medicines, allergies, relations, shortcuts' },
      { id: 'sc8', key: '/', target: 'search', title: 'Quick Global Search', desc: 'Focus global search bar to search patients or families' },
      { id: 'sc9', key: 'Enter', target: 'submit', title: 'Form Quick Submit', desc: 'Instant submission on registration & consultation forms' },
      { id: 'sc10', key: 'Esc', target: 'close', title: 'Close Modal / Unfocus', desc: 'Close dialogs, print previews, or blur input focus' },
    ];
  }

  // Active sub-tab state: 'dietary' | 'areas' | 'medicines' | 'allergies' | 'relations' | 'societies' | 'shortcuts'
  let activeTab = 'dietary';
  let searchQuery = '';

  // Edit state object across all tabs
  let editItem = null; // { type: 'dietary'|'areas'|'medicines'|'allergies'|'relations'|'societies'|'shortcuts', data: {...} }

  function renderView() {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 18px; max-width: 1280px; margin: 0 auto; width: 100%;">
        
        <!-- Header Banner -->
        <div class="cms-card" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; background: linear-gradient(135deg, var(--surface), rgba(37,99,235,0.03)); border: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: var(--shadow-sm);">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <h1 class="font-display" style="font-size: 18px; font-weight: 800; margin: 0; color: var(--text);">Clinical Master Data &amp; Shortcuts</h1>
              <p style="font-size: 12.5px; color: var(--text-muted); margin: 2px 0 0 0;">Manage dietary templates (shortcut, disease, foods to eat &amp; avoid), area masters, medicines, allergies, relations &amp; navigation shortcuts.</p>
            </div>
          </div>
          <span class="cms-pill cms-badge-paid font-mono" style="font-size: 11px;">
            <i class="fa-solid fa-database"></i> Auto-Synced
          </span>
        </div>

        <!-- Horizontal Sub-Navigation Tabs Bar -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; border-bottom: 1.5px solid var(--border); scrollbar-width: none;" id="master-tabs-bar">
          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'dietary' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="dietary" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-utensils"></i>
            <span>Dietary Suggestions</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${Object.keys(db.dietary || {}).length}</span>
          </button>
          
          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'areas' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="areas" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-map-location-dot"></i>
            <span>Area / Location</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${db.masterAreas.length}</span>
          </button>

          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'medicines' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="medicines" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-pills"></i>
            <span>Medicine Catalogue</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${db.masterMedicines.length}</span>
          </button>

          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'allergies' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="allergies" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-shield-virus"></i>
            <span>Known Allergies</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${db.masterAllergies.length}</span>
          </button>

          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'relations' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="relations" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-people-arrows"></i>
            <span>Relation to Head</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${db.masterRelations.length}</span>
          </button>

          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'societies' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="societies" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-building"></i>
            <span>Society / Flat</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${db.masterSocieties.length}</span>
          </button>

          <button type="button" class="cms-btn cms-btn-sm ${activeTab === 'shortcuts' ? 'cms-btn-primary' : 'cms-btn-ghost'}" data-tab="shortcuts" style="padding: 8px 16px; border-radius: var(--radius-md); font-size: 13px;">
            <i class="fa-solid fa-keyboard"></i>
            <span>Navigation Shortcuts</span>
            <span class="cms-pill" style="font-size: 10px; padding: 1px 6px; background: rgba(0,0,0,0.08);">${(db.customShortcuts || []).length}</span>
          </button>
        </div>

        <!-- Dynamic Content Mount Point -->
        <div id="master-tab-content" style="display: flex; flex-direction: column; gap: 16px;">
          ${renderActiveTabContent()}
        </div>
      </div>
    `;

    attachTabEventListeners();
  }

  function renderActiveTabContent() {
    if (activeTab === 'dietary') return renderDietaryTab();
    if (activeTab === 'areas') return renderAreasTab();
    if (activeTab === 'medicines') return renderMedicinesTab();
    if (activeTab === 'allergies') return renderAllergiesTab();
    if (activeTab === 'relations') return renderRelationsTab();
    if (activeTab === 'societies') return renderSocietiesTab();
    if (activeTab === 'shortcuts') return renderShortcutsTab();
    return '';
  }

  // ==========================================
  // TAB 1: DIETARY SUGGESTIONS (4 Key Fields)
  // 1) Shortcut Code, 2) Disease Name, 3) What to Eat, 4) What Not to Eat
  // ==========================================
  function renderDietaryTab() {
    const isEdit = editItem && editItem.type === 'dietary';
    const cur = isEdit ? editItem.data : { code: '', disease: '', eat: '', avoid: '', text: '' };

    const list = Object.values(db.dietary || {}).map((item, idx) => ({
      seq: idx + 1,
      id: item.id || item.code,
      code: item.code,
      disease: item.disease || 'Clinical Condition',
      eat: item.eat || 'High-fibre nutritious diet',
      avoid: item.avoid || 'Oily and spicy foods',
      text: item.text || `${item.disease || ''}: Eat: ${item.eat || ''} | Avoid: ${item.avoid || ''}`,
      createdAt: item.createdAt || todayISO(),
    }));

    const filtered = list.filter((d) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.code.toLowerCase().includes(q) ||
        d.disease.toLowerCase().includes(q) ||
        d.eat.toLowerCase().includes(q) ||
        d.avoid.toLowerCase().includes(q)
      );
    });

    return `
      <div style="display: grid; grid-template-columns: 1.15fr 1.85fr; gap: 20px; align-items: start;">
        <!-- Left: Add / Edit Dietary Suggestion Form -->
        <form id="form-master-dietary" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Dietary Suggestion (${cur.code})` : 'Add Dietary Suggestion'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>
          
          <!-- Field 1: Shortcut Code -->
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px; font-weight: 700;">1. Shortcut Code * (e.g. DB, BP, THYROID, URIC, ACID)</label>
            <input type="text" id="dietary-code" class="cms-input" required placeholder="e.g. THYROID" value="${cur.code || ''}" ${isEdit ? 'readonly style="background: rgba(0,0,0,0.04); font-weight: 800;"' : 'autofocus'} style="text-transform: uppercase; font-family: var(--font-mono); font-weight: 700;" />
          </div>

          <!-- Field 2: For Which Disease / Condition -->
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px; font-weight: 700;">2. For Which Disease / Clinical Condition *</label>
            <input type="text" id="dietary-disease" class="cms-input" required placeholder="e.g. Diabetes Mellitus, Hypertension, Acidity" value="${cur.disease || ''}" />
          </div>

          <!-- Field 3: What to Eat (Recommended Foods) -->
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px; font-weight: 700; color: #059669;">
              <i class="fa-solid fa-circle-check"></i> 3. What to Eat (Recommended Diet) *
            </label>
            <textarea id="dietary-eat" class="cms-textarea" rows="3" required placeholder="e.g. Green leafy vegetables, whole grains, pulses, salads, bitter gourd, water...">${cur.eat || ''}</textarea>
          </div>

          <!-- Field 4: What NOT to Eat (Avoid List) -->
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px; font-weight: 700; color: #dc2626;">
              <i class="fa-solid fa-ban"></i> 4. What NOT to Eat (Restricted Foods) *
            </label>
            <textarea id="dietary-avoid" class="cms-textarea" rows="3" required placeholder="e.g. Direct sugar, sweets, jaggery, potatoes, bakery items, cold drinks...">${cur.avoid || ''}</textarea>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-dietary" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
            `
                : ''
            }
            <button type="submit" class="cms-btn ${isEdit ? 'cms-btn-warning' : 'cms-btn-primary'}" style="flex: 2;">
              <span><i class="fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}"></i></span>
              <span>${isEdit ? 'Update Dietary Suggestion' : 'Save Dietary Template'}</span>
            </button>
          </div>
        </form>

        <!-- Right: Dietary Suggestions Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div>
              <div class="cms-card-title">All Dietary Suggestions (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Prescription dietary template directory with sequence and food rules</div>
            </div>
            <div style="position: relative; min-width: 220px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 11px;"></i>
              <input type="text" id="master-search-input" class="cms-input cms-input-sm" style="padding-left: 28px;" placeholder="Search shortcut, disease or diet..." value="${searchQuery}" />
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 540px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th style="width: 85px;">Shortcut</th>
                  <th style="width: 130px;">Disease / Condition</th>
                  <th>Recommended (What to Eat)</th>
                  <th>Restricted (What NOT to Eat)</th>
                  <th style="width: 90px;">Added On</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filtered.length === 0
                    ? `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No dietary suggestions found.</td></tr>`
                    : filtered
                        .map(
                          (d) => `
                        <tr style="${isEdit && editItem.data.code === d.code ? 'background: rgba(245,158,11,0.08);' : ''}">
                          <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${d.seq}</td>
                          <td>
                            <span class="cms-pill cms-badge-paid font-mono" style="font-weight: 800; font-size: 11px;">${d.code}</span>
                          </td>
                          <td style="font-size: 12.5px; font-weight: 700; color: var(--text);">${d.disease}</td>
                          <td style="font-size: 12px; line-height: 1.35; color: #065f46;">
                            <div style="display: flex; gap: 5px; align-items: flex-start;">
                              <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 12px; margin-top: 2px;"></i>
                              <span>${d.eat}</span>
                            </div>
                          </td>
                          <td style="font-size: 12px; line-height: 1.35; color: #991b1b;">
                            <div style="display: flex; gap: 5px; align-items: flex-start;">
                              <i class="fa-solid fa-ban" style="color: #ef4444; font-size: 12px; margin-top: 2px;"></i>
                              <span>${d.avoid}</span>
                            </div>
                          </td>
                          <td class="font-mono" style="font-size: 11.5px; color: var(--text-muted);">${fmtDate(d.createdAt)}</td>
                          <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="dietary" data-id="${d.code}" style="padding: 4px 7px;" title="Edit Dietary Suggestion">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                              </button>
                              <button type="button" class="cms-btn-danger btn-del-master" data-type="dietary" data-id="${d.code}" style="padding: 4px 7px;" title="Delete Template">
                                <i class="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 2: AREA / LOCATION (with Edit & Delete)
  // ==========================================
  function renderAreasTab() {
    const isEdit = editItem && editItem.type === 'areas';
    const cur = isEdit ? editItem.data : { id: '', name: '', city: 'Ahmedabad', pincode: '' };

    const list = (db.masterAreas || []).map((item, idx) => ({
      seq: idx + 1,
      id: item.id || `a_${idx}`,
      name: item.name,
      city: item.city || 'Ahmedabad',
      pincode: item.pincode || '-',
      createdAt: item.createdAt || todayISO(),
    }));

    const filtered = list.filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || (a.pincode || '').includes(q);
    });

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 20px; align-items: start;">
        <!-- Left: Add / Edit Area Form -->
        <form id="form-master-area" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Area / Location` : 'Add Area / Location'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>
          
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Area / Location Name *</label>
            <input type="text" id="area-name" class="cms-input" required placeholder="e.g. Science City, Shela, Chandkheda" value="${cur.name || ''}" autofocus />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">City / District</label>
              <input type="text" id="area-city" class="cms-input" placeholder="e.g. Ahmedabad" value="${cur.city || 'Ahmedabad'}" />
            </div>
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Pincode (Optional)</label>
              <input type="text" id="area-pincode" class="cms-input" placeholder="e.g. 380060" value="${cur.pincode === '-' ? '' : cur.pincode || ''}" />
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-area" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
            `
                : ''
            }
            <button type="submit" class="cms-btn ${isEdit ? 'cms-btn-warning' : 'cms-btn-primary'}" style="flex: 2;">
              <span><i class="fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}"></i></span>
              <span>${isEdit ? 'Update Area Location' : 'Save Area Location'}</span>
            </button>
          </div>
        </form>

        <!-- Right: Area Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div>
              <div class="cms-card-title">All Areas / Locations (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">City areas and locations available across all patient registration datalists</div>
            </div>
            <div style="position: relative; min-width: 220px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 11px;"></i>
              <input type="text" id="master-search-input" class="cms-input cms-input-sm" style="padding-left: 28px;" placeholder="Search area name or city..." value="${searchQuery}" />
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 520px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th>Area / Location Name</th>
                  <th>City / District</th>
                  <th>Pincode</th>
                  <th style="width: 95px;">Added On</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filtered.length === 0
                    ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No area locations found.</td></tr>`
                    : filtered
                        .map(
                          (a) => `
                        <tr style="${isEdit && editItem.data.id === a.id ? 'background: rgba(245,158,11,0.08);' : ''}">
                          <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${a.seq}</td>
                          <td><b>${a.name}</b></td>
                          <td>${a.city}</td>
                          <td class="font-mono">${a.pincode}</td>
                          <td class="font-mono" style="font-size: 11.5px; color: var(--text-muted);">${fmtDate(a.createdAt)}</td>
                          <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="areas" data-id="${a.id}" style="padding: 4px 7px;" title="Edit Area">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                              </button>
                              <button type="button" class="cms-btn-danger btn-del-master" data-type="areas" data-id="${a.id}" style="padding: 4px 7px;" title="Delete Area">
                                <i class="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 3: MEDICINE CATALOGUE (with Edit & Delete)
  // ==========================================
  function renderMedicinesTab() {
    const isEdit = editItem && editItem.type === 'medicines';
    const cur = isEdit
      ? editItem.data
      : { id: '', name: '', form: 'Tablet', category: 'General', defaultDosage: '1-0-1 AF', unitPrice: 5 };

    const list = (db.masterMedicines || []).map((item, idx) => ({
      seq: idx + 1,
      id: item.id || `m_${idx}`,
      name: item.name,
      category: item.category || 'General',
      form: item.form || 'Tablet',
      defaultDosage: item.defaultDosage || '1-0-1',
      unitPrice: item.unitPrice || 0,
      createdAt: item.createdAt || todayISO(),
    }));

    const filtered = list.filter((m) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.form.toLowerCase().includes(q);
    });

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 20px; align-items: start;">
        <!-- Left: Add / Edit Medicine Form -->
        <form id="form-master-med" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Medicine` : 'Add Medicine to Catalogue'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>
          
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Medicine Brand / Generic Name *</label>
            <input type="text" id="med-name" class="cms-input" required placeholder="e.g. Paracetamol 650mg" value="${cur.name || ''}" autofocus />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Form</label>
              <select id="med-form" class="cms-select cms-input">
                <option value="Tablet" ${cur.form === 'Tablet' ? 'selected' : ''}>Tablet</option>
                <option value="Capsule" ${cur.form === 'Capsule' ? 'selected' : ''}>Capsule</option>
                <option value="Syrup" ${cur.form === 'Syrup' ? 'selected' : ''}>Syrup</option>
                <option value="Injection" ${cur.form === 'Injection' ? 'selected' : ''}>Injection</option>
                <option value="Ointment" ${cur.form === 'Ointment' ? 'selected' : ''}>Ointment</option>
                <option value="Drops" ${cur.form === 'Drops' ? 'selected' : ''}>Drops</option>
                <option value="Powder" ${cur.form === 'Powder' ? 'selected' : ''}>Powder</option>
              </select>
            </div>
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Therapeutic Category</label>
              <input type="text" id="med-cat" class="cms-input" placeholder="e.g. Antibiotic, Antacid" value="${cur.category || ''}" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Default Dosage / Timing</label>
              <input type="text" id="med-dosage" class="cms-input" placeholder="e.g. 1-0-1 AF, 1-0-0 BF" value="${cur.defaultDosage || '1-0-1 AF'}" />
            </div>
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Unit Price (₹)</label>
              <input type="number" id="med-price" class="cms-input" placeholder="5" min="0" step="0.5" value="${cur.unitPrice || 0}" />
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-med" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
            `
                : ''
            }
            <button type="submit" class="cms-btn ${isEdit ? 'cms-btn-warning' : 'cms-btn-primary'}" style="flex: 2;">
              <span><i class="fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}"></i></span>
              <span>${isEdit ? 'Update Medicine' : 'Save Medicine'}</span>
            </button>
          </div>
        </form>

        <!-- Right: Medicines Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div>
              <div class="cms-card-title">All Medicines (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Medicines used for prescription templates, dosage shortcuts, and billing</div>
            </div>
            <div style="position: relative; min-width: 220px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 11px;"></i>
              <input type="text" id="master-search-input" class="cms-input cms-input-sm" style="padding-left: 28px;" placeholder="Search medicine name..." value="${searchQuery}" />
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 520px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th>Medicine Name</th>
                  <th>Form</th>
                  <th>Category</th>
                  <th>Default Dosage</th>
                  <th>Price</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filtered.length === 0
                    ? `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No medicines found.</td></tr>`
                    : filtered
                        .map(
                          (m) => `
                        <tr style="${isEdit && editItem.data.id === m.id ? 'background: rgba(245,158,11,0.08);' : ''}">
                          <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${m.seq}</td>
                          <td><b>${m.name}</b></td>
                          <td><span class="cms-pill cms-badge-neutral">${m.form}</span></td>
                          <td>${m.category}</td>
                          <td class="font-mono">${m.defaultDosage}</td>
                          <td class="font-mono" style="font-weight: 700;">${fmtMoney(m.unitPrice)}</td>
                          <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="medicines" data-id="${m.id}" style="padding: 4px 7px;" title="Edit Medicine">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                              </button>
                              <button type="button" class="cms-btn-danger btn-del-master" data-type="medicines" data-id="${m.id}" style="padding: 4px 7px;" title="Delete Medicine">
                                <i class="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 4: KNOWN ALLERGIES (with Edit & Delete)
  // ==========================================
  function renderAllergiesTab() {
    const isEdit = editItem && editItem.type === 'allergies';
    const cur = isEdit ? editItem.data : { id: '', name: '', category: 'Drug Allergy', severity: 'Moderate' };

    const list = (db.masterAllergies || []).map((item, idx) => ({
      seq: idx + 1,
      id: item.id || `al_${idx}`,
      name: item.name,
      category: item.category || 'General',
      severity: item.severity || 'Moderate',
      createdAt: item.createdAt || todayISO(),
    }));

    const filtered = list.filter((al) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return al.name.toLowerCase().includes(q) || al.category.toLowerCase().includes(q) || al.severity.toLowerCase().includes(q);
    });

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 20px; align-items: start;">
        <!-- Left: Add / Edit Allergy Form -->
        <form id="form-master-allergy" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Known Allergy` : 'Add Known Allergy'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>
          
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Allergy Name / Substance *</label>
            <input type="text" id="allergy-name" class="cms-input" required placeholder="e.g. Penicillin, Ciprofloxacin, Peanuts" value="${cur.name || ''}" autofocus />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Category</label>
              <select id="allergy-category" class="cms-select cms-input">
                <option value="Drug Allergy" ${cur.category === 'Drug Allergy' ? 'selected' : ''}>Drug Allergy</option>
                <option value="Food Allergy" ${cur.category === 'Food Allergy' ? 'selected' : ''}>Food Allergy</option>
                <option value="Environmental" ${cur.category === 'Environmental' ? 'selected' : ''}>Environmental</option>
                <option value="Contact" ${cur.category === 'Contact' ? 'selected' : ''}>Contact</option>
                <option value="General" ${cur.category === 'General' ? 'selected' : ''}>General</option>
              </select>
            </div>
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Typical Severity</label>
              <select id="allergy-severity" class="cms-select cms-input">
                <option value="None" ${cur.severity === 'None' ? 'selected' : ''}>None</option>
                <option value="Mild" ${cur.severity === 'Mild' ? 'selected' : ''}>Mild</option>
                <option value="Moderate" ${cur.severity === 'Moderate' ? 'selected' : ''}>Moderate</option>
                <option value="Severe" ${cur.severity === 'Severe' ? 'selected' : ''}>Severe (Anaphylaxis)</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-allergy" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
            `
                : ''
            }
            <button type="submit" class="cms-btn ${isEdit ? 'cms-btn-warning' : 'cms-btn-primary'}" style="flex: 2;">
              <span><i class="fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}"></i></span>
              <span>${isEdit ? 'Update Known Allergy' : 'Save Known Allergy'}</span>
            </button>
          </div>
        </form>

        <!-- Right: Allergies Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div>
              <div class="cms-card-title">All Known Allergies (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Allergens with critical warning badges during prescription &amp; registration</div>
            </div>
            <div style="position: relative; min-width: 220px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 11px;"></i>
              <input type="text" id="master-search-input" class="cms-input cms-input-sm" style="padding-left: 28px;" placeholder="Search allergy name..." value="${searchQuery}" />
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 520px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th>Allergy Name</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th style="width: 95px;">Added On</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filtered.length === 0
                    ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No allergies found.</td></tr>`
                    : filtered
                        .map(
                          (al) => `
                        <tr style="${isEdit && editItem.data.id === al.id ? 'background: rgba(245,158,11,0.08);' : ''}">
                          <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${al.seq}</td>
                          <td><b>${al.name}</b></td>
                          <td><span class="cms-pill cms-badge-neutral">${al.category}</span></td>
                          <td><span class="cms-pill ${al.severity === 'Severe' ? 'cms-badge-danger' : al.severity === 'Moderate' ? 'cms-badge-warning' : 'cms-badge-neutral'}">${al.severity}</span></td>
                          <td class="font-mono" style="font-size: 11.5px; color: var(--text-muted);">${fmtDate(al.createdAt)}</td>
                          <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="allergies" data-id="${al.id}" style="padding: 4px 7px;" title="Edit Allergy">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                              </button>
                              <button type="button" class="cms-btn-danger btn-del-master" data-type="allergies" data-id="${al.id}" style="padding: 4px 7px;" title="Delete Allergy">
                                <i class="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 5: RELATION TO HEAD (with Edit & Delete)
  // ==========================================
  function renderRelationsTab() {
    const isEdit = editItem && editItem.type === 'relations';
    const cur = isEdit ? editItem.data : { id: '', name: '', category: 'Extended', description: '' };

    const list = (db.masterRelations || []).map((item, idx) => ({
      seq: idx + 1,
      id: item.id || `r_${idx}`,
      name: item.name,
      category: item.category || 'General',
      description: item.description || `${item.name} of Head`,
      createdAt: item.createdAt || todayISO(),
    }));

    const filtered = list.filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    });

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 20px; align-items: start;">
        <!-- Left: Add / Edit Relation Form -->
        <form id="form-master-rel" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Relation to Head` : 'Add Relation to Head'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>
          
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Relation Title * (e.g. Uncle, Aunt, Niece, Nephew)</label>
            <input type="text" id="rel-name" class="cms-input" required placeholder="e.g. Uncle, Aunt" value="${cur.name || ''}" autofocus />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Category</label>
              <select id="rel-category" class="cms-select cms-input">
                <option value="Primary" ${cur.category === 'Primary' ? 'selected' : ''}>Primary</option>
                <option value="Spouse" ${cur.category === 'Spouse' ? 'selected' : ''}>Spouse</option>
                <option value="Child" ${cur.category === 'Child' ? 'selected' : ''}>Child</option>
                <option value="Parent" ${cur.category === 'Parent' ? 'selected' : ''}>Parent</option>
                <option value="Sibling" ${cur.category === 'Sibling' ? 'selected' : ''}>Sibling</option>
                <option value="Grandparent" ${cur.category === 'Grandparent' ? 'selected' : ''}>Grandparent</option>
                <option value="In-Law" ${cur.category === 'In-Law' ? 'selected' : ''}>In-Law</option>
                <option value="Extended" ${cur.category === 'Extended' ? 'selected' : ''}>Extended</option>
              </select>
            </div>
            <div class="cms-form-group" style="margin-bottom: 0;">
              <label class="cms-label" style="font-size: 12px;">Description / Notes</label>
              <input type="text" id="rel-desc" class="cms-input" placeholder="e.g. Paternal Uncle" value="${cur.description || ''}" />
            </div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-rel" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
            `
                : ''
            }
            <button type="submit" class="cms-btn ${isEdit ? 'cms-btn-warning' : 'cms-btn-primary'}" style="flex: 2;">
              <span><i class="fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}"></i></span>
              <span>${isEdit ? 'Update Relation' : 'Save Relation Hierarchy'}</span>
            </button>
          </div>
        </form>

        <!-- Right: Relations Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div>
              <div class="cms-card-title">All Relations (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Standard relation hierarchy used in Add Member auto-suggestions</div>
            </div>
            <div style="position: relative; min-width: 220px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 11px;"></i>
              <input type="text" id="master-search-input" class="cms-input cms-input-sm" style="padding-left: 28px;" placeholder="Search relation name..." value="${searchQuery}" />
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 520px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th>Relation Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style="width: 95px;">Added On</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filtered.length === 0
                    ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No relations found.</td></tr>`
                    : filtered
                        .map(
                          (r) => `
                        <tr style="${isEdit && editItem.data.id === r.id ? 'background: rgba(245,158,11,0.08);' : ''}">
                          <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${r.seq}</td>
                          <td><b>${r.name}</b></td>
                          <td><span class="cms-pill cms-badge-neutral">${r.category}</span></td>
                          <td>${r.description}</td>
                          <td class="font-mono" style="font-size: 11.5px; color: var(--text-muted);">${fmtDate(r.createdAt)}</td>
                          <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="relations" data-id="${r.id}" style="padding: 4px 7px;" title="Edit Relation">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                              </button>
                              <button type="button" class="cms-btn-danger btn-del-master" data-type="relations" data-id="${r.id}" style="padding: 4px 7px;" title="Delete Relation">
                                <i class="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 6: SOCIETY / FLAT (with Edit & Delete)
  // ==========================================
  function renderSocietiesTab() {
    const isEdit = editItem && editItem.type === 'societies';
    const cur = isEdit ? editItem.data : { id: '', name: '', area: 'Ahmedabad' };

    const list = (db.masterSocieties || []).map((item, idx) => ({
      seq: idx + 1,
      id: item.id || `s_${idx}`,
      name: item.name,
      area: item.area || 'Ahmedabad',
      createdAt: item.createdAt || todayISO(),
    }));

    const filtered = list.filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q);
    });

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 20px; align-items: start;">
        <!-- Left: Add / Edit Society Form -->
        <form id="form-master-soc" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Society / Flat` : 'Add Society / Flat'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>
          
          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Society / Flat / Apartment Name *</label>
            <input type="text" id="soc-name" class="cms-input" required placeholder="e.g. Gokuldham Society, Shanti Niketan" value="${cur.name || ''}" autofocus />
          </div>

          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Associated Area / Location</label>
            <input type="text" id="soc-area" class="cms-input" list="dl-area-list" placeholder="e.g. Vastrapur, Satellite" value="${cur.area || ''}" />
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-soc" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
            `
                : ''
            }
            <button type="submit" class="cms-btn ${isEdit ? 'cms-btn-warning' : 'cms-btn-primary'}" style="flex: 2;">
              <span><i class="fa-solid ${isEdit ? 'fa-floppy-disk' : 'fa-plus'}"></i></span>
              <span>${isEdit ? 'Update Society' : 'Save Society'}</span>
            </button>
          </div>
        </form>

        <!-- Right: Societies Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div>
              <div class="cms-card-title">All Societies / Flats (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Societies &amp; residences auto-suggested during family head and member reg</div>
            </div>
            <div style="position: relative; min-width: 220px;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 11px;"></i>
              <input type="text" id="master-search-input" class="cms-input cms-input-sm" style="padding-left: 28px;" placeholder="Search society or area..." value="${searchQuery}" />
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 520px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th>Society / Flat Name</th>
                  <th>Associated Area</th>
                  <th style="width: 95px;">Added On</th>
                  <th style="width: 80px; text-align: center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  filtered.length === 0
                    ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No societies found.</td></tr>`
                    : filtered
                        .map(
                          (s) => `
                        <tr style="${isEdit && editItem.data.id === s.id ? 'background: rgba(245,158,11,0.08);' : ''}">
                          <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${s.seq}</td>
                          <td><b>${s.name}</b></td>
                          <td><span class="cms-pill cms-badge-neutral">${s.area}</span></td>
                          <td class="font-mono" style="font-size: 11.5px; color: var(--text-muted);">${fmtDate(s.createdAt)}</td>
                          <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="societies" data-id="${s.id}" style="padding: 4px 7px;" title="Edit Society">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                              </button>
                              <button type="button" class="cms-btn-danger btn-del-master" data-type="societies" data-id="${s.id}" style="padding: 4px 7px;" title="Delete Society">
                                <i class="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `
                        )
                        .join('')
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 7: KEYBOARD SHORTCUTS MANAGER
  // ==========================================
  function renderShortcutsTab() {
    const isEdit = editItem && editItem.type === 'shortcuts';
    const cur = isEdit
      ? editItem.data
      : { id: '', key: '', target: '', title: '', desc: '' };

    const list = (db.customShortcuts || []).map((sc, idx) => ({
      seq: idx + 1,
      id: sc.id || `sc_${idx}`,
      key: sc.key,
      target: sc.target,
      title: sc.title,
      desc: sc.desc || '',
    }));

    return `
      <div style="display: grid; grid-template-columns: 1fr 1.65fr; gap: 20px; align-items: start;">
        <!-- Left: Edit Shortcut Form -->
        <form id="form-master-shortcut" class="cms-card" style="display: flex; flex-direction: column; gap: 12px; border-top: 3px solid ${isEdit ? 'var(--warning)' : 'var(--primary)'};">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
            <div class="cms-card-title">
              <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-keyboard'}" style="color: ${isEdit ? 'var(--warning)' : 'var(--primary)'};"></i>
              <span>${isEdit ? `Edit Shortcut Key (${cur.key})` : 'Shortcut Information'}</span>
            </div>
            ${isEdit ? '<span class="cms-pill cms-badge-warning font-mono" style="font-size: 10px;">Editing Mode</span>' : ''}
          </div>

          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Key Combination *</label>
            <input type="text" id="sc-key" class="cms-input font-mono" required placeholder="e.g. F1, F2, F6, /" value="${cur.key || ''}" ${isEdit ? '' : 'placeholder="Select a shortcut from right to edit"'} style="font-weight: 800;" />
          </div>

          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Tab / Action Name *</label>
            <input type="text" id="sc-title" class="cms-input" required placeholder="e.g. Medical Certificate" value="${cur.title || ''}" />
          </div>

          <div class="cms-form-group" style="margin-bottom: 0;">
            <label class="cms-label" style="font-size: 12px;">Description / Purpose</label>
            <textarea id="sc-desc" class="cms-textarea" rows="3" placeholder="Describe workflow action...">${cur.desc || ''}</textarea>
          </div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            ${
              isEdit
                ? `
              <button type="button" id="btn-cancel-edit-sc" class="cms-btn cms-btn-ghost" style="flex: 1; border: 1px solid var(--border);">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
              <button type="submit" class="cms-btn cms-btn-warning" style="flex: 2;">
                <span><i class="fa-solid fa-floppy-disk"></i></span>
                <span>Update Shortcut</span>
              </button>
            `
                : `
              <div style="font-size: 11.5px; color: var(--text-muted); background: rgba(0,0,0,0.03); padding: 10px; border-radius: var(--radius-sm); width: 100%;">
                <i class="fa-solid fa-info-circle" style="color: var(--primary);"></i> Click the <b>Edit</b> button next to any shortcut on the right to customize its title or workflow notes.
              </div>
            `
            }
          </div>
        </form>

        <!-- Right: Shortcuts Table -->
        <div class="cms-card" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="cms-card-header" style="padding-bottom: 4px; margin-bottom: 0;">
            <div>
              <div class="cms-card-title">System Navigation Shortcuts (${list.length})</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Global instant hotkeys active across the entire clinic application</div>
            </div>
          </div>

          <div class="cms-table-wrapper" style="max-height: 520px; overflow-y: auto;">
            <table class="cms-table">
              <thead>
                <tr>
                  <th style="width: 45px;">#</th>
                  <th style="width: 90px;">Key</th>
                  <th>Action / Tab Title</th>
                  <th>Description</th>
                  <th style="width: 65px; text-align: center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .map(
                    (sc) => `
                  <tr style="${isEdit && editItem.data.id === sc.id ? 'background: rgba(245,158,11,0.08);' : ''}">
                    <td class="font-mono" style="color: var(--text-muted); font-weight: 700;">#${sc.seq}</td>
                    <td>
                      <span class="cms-kbd" style="font-size: 12px; padding: 4px 8px; font-weight: 800;">${sc.key}</span>
                    </td>
                    <td><b>${sc.title}</b></td>
                    <td style="font-size: 12px; color: var(--text-muted);">${sc.desc}</td>
                    <td style="text-align: center;">
                      <button type="button" class="cms-btn cms-btn-ghost btn-edit-master" data-type="shortcuts" data-id="${sc.id}" style="padding: 4px 8px;" title="Edit Shortcut">
                        <i class="fa-solid fa-pen-to-square" style="color: var(--primary);"></i>
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EVENT LISTENERS & FORM HANDLERS
  // ==========================================
  function attachTabEventListeners() {
    // Sub-tab button clicks
    container.querySelectorAll('#master-tabs-bar button').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        searchQuery = '';
        editItem = null;
        renderView();
      });
    });

    // Search input handler
    const searchInput = container.querySelector('#master-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const mount = container.querySelector('#master-tab-content');
        if (mount) {
          mount.innerHTML = renderActiveTabContent();
          attachTabEventListeners();
        }
      });
    }

    // Cancel Edit Handlers
    const cancelDietary = container.querySelector('#btn-cancel-edit-dietary');
    if (cancelDietary) {
      cancelDietary.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    const cancelArea = container.querySelector('#btn-cancel-edit-area');
    if (cancelArea) {
      cancelArea.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    const cancelMed = container.querySelector('#btn-cancel-edit-med');
    if (cancelMed) {
      cancelMed.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    const cancelAllergy = container.querySelector('#btn-cancel-edit-allergy');
    if (cancelAllergy) {
      cancelAllergy.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    const cancelRel = container.querySelector('#btn-cancel-edit-rel');
    if (cancelRel) {
      cancelRel.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    const cancelSoc = container.querySelector('#btn-cancel-edit-soc');
    if (cancelSoc) {
      cancelSoc.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    const cancelSc = container.querySelector('#btn-cancel-edit-sc');
    if (cancelSc) {
      cancelSc.addEventListener('click', () => {
        editItem = null;
        renderView();
      });
    }

    // Form 1: Dietary Form Submit (Add / Update)
    const formDietary = container.querySelector('#form-master-dietary');
    if (formDietary) {
      formDietary.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = container.querySelector('#dietary-code').value.trim().toUpperCase();
        const disease = container.querySelector('#dietary-disease').value.trim();
        const eat = container.querySelector('#dietary-eat').value.trim();
        const avoid = container.querySelector('#dietary-avoid').value.trim();
        if (!code || !disease || !eat || !avoid) return;

        if (!db.dietary) db.dietary = {};
        const isEdit = editItem && editItem.type === 'dietary';
        const existing = db.dietary[code];

        db.dietary[code] = {
          id: existing?.id || `d_${Date.now()}`,
          code,
          disease,
          eat,
          avoid,
          text: `${disease} - Recommended: ${eat} | Strictly Avoid: ${avoid}`,
          createdAt: existing?.createdAt || todayISO(),
          updatedAt: todayISO(),
        };

        saveLocalDB(db, clinicId);
        showToast(`✨ Dietary template "${code}" ${isEdit ? 'updated' : 'added'} successfully!`);
        editItem = null;
        renderView();
      });
    }

    // Form 2: Area Form Submit (Add / Update)
    const formArea = container.querySelector('#form-master-area');
    if (formArea) {
      formArea.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#area-name').value.trim();
        const city = container.querySelector('#area-city').value.trim() || 'Ahmedabad';
        const pincode = container.querySelector('#area-pincode').value.trim() || '';
        if (!name) return;

        if (!db.masterAreas) db.masterAreas = [];
        const isEdit = editItem && editItem.type === 'areas';

        if (isEdit) {
          const idx = db.masterAreas.findIndex((a) => a.id === editItem.data.id);
          if (idx !== -1) {
            db.masterAreas[idx] = {
              ...db.masterAreas[idx],
              name,
              city,
              pincode,
              updatedAt: todayISO(),
            };
          }
        } else {
          db.masterAreas.unshift({
            id: `a_${Date.now()}`,
            name,
            city,
            pincode,
            createdAt: todayISO(),
          });
        }

        if (!db.customAreas) db.customAreas = [];
        if (!db.customAreas.includes(name)) db.customAreas.push(name);

        saveLocalDB(db, clinicId);
        showToast(`✨ Area "${name}" ${isEdit ? 'updated' : 'added'} successfully!`);
        editItem = null;
        renderView();
      });
    }

    // Form 3: Medicine Form Submit (Add / Update)
    const formMed = container.querySelector('#form-master-med');
    if (formMed) {
      formMed.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = container.querySelector('#med-name').value.trim();
        const formType = container.querySelector('#med-form').value;
        const category = container.querySelector('#med-cat').value.trim() || 'General';
        const defaultDosage = container.querySelector('#med-dosage').value.trim() || '1-0-1 AF';
        const unitPrice = Number(container.querySelector('#med-price').value || 0);
        if (!name) return;

        if (!db.masterMedicines) db.masterMedicines = [];
        const isEdit = editItem && editItem.type === 'medicines';

        if (isEdit) {
          const idx = db.masterMedicines.findIndex((m) => m.id === editItem.data.id);
          if (idx !== -1) {
            db.masterMedicines[idx] = {
              ...db.masterMedicines[idx],
              name,
              form: formType,
              category,
              defaultDosage,
              unitPrice,
              updatedAt: todayISO(),
            };
          }
        } else {
          db.masterMedicines.unshift({
            id: `m_${Date.now()}`,
            name,
            form: formType,
            category,
            defaultDosage,
            unitPrice,
            createdAt: todayISO(),
          });
        }

        saveLocalDB(db, clinicId);
        showToast(`✨ Medicine "${name}" ${isEdit ? 'updated' : 'added to catalogue'}!`);
        editItem = null;
        renderView();
      });
    }

    // Form 4: Allergy Form Submit (Add / Update)
    const formAllergy = container.querySelector('#form-master-allergy');
    if (formAllergy) {
      formAllergy.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#allergy-name').value.trim();
        const category = container.querySelector('#allergy-category').value;
        const severity = container.querySelector('#allergy-severity').value;
        if (!name) return;

        if (!db.masterAllergies) db.masterAllergies = [];
        const isEdit = editItem && editItem.type === 'allergies';

        if (isEdit) {
          const idx = db.masterAllergies.findIndex((al) => al.id === editItem.data.id);
          if (idx !== -1) {
            db.masterAllergies[idx] = {
              ...db.masterAllergies[idx],
              name,
              category,
              severity,
              updatedAt: todayISO(),
            };
          }
        } else {
          db.masterAllergies.unshift({
            id: `al_${Date.now()}`,
            name,
            category,
            severity,
            createdAt: todayISO(),
          });
        }

        if (!db.customAllergies) db.customAllergies = [];
        if (!db.customAllergies.includes(name)) db.customAllergies.push(name);

        saveLocalDB(db, clinicId);
        showToast(`✨ Known allergy "${name}" ${isEdit ? 'updated' : 'added'}!`);
        editItem = null;
        renderView();
      });
    }

    // Form 5: Relation Form Submit (Add / Update)
    const formRel = container.querySelector('#form-master-rel');
    if (formRel) {
      formRel.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#rel-name').value.trim();
        const category = container.querySelector('#rel-category').value;
        const description = container.querySelector('#rel-desc').value.trim() || `${name} of Head`;
        if (!name) return;

        if (!db.masterRelations) db.masterRelations = [];
        const isEdit = editItem && editItem.type === 'relations';

        if (isEdit) {
          const idx = db.masterRelations.findIndex((r) => r.id === editItem.data.id);
          if (idx !== -1) {
            db.masterRelations[idx] = {
              ...db.masterRelations[idx],
              name,
              category,
              description,
              updatedAt: todayISO(),
            };
          }
        } else {
          db.masterRelations.unshift({
            id: `r_${Date.now()}`,
            name,
            category,
            description,
            createdAt: todayISO(),
          });
        }

        if (!db.customRelations) db.customRelations = [];
        if (!db.customRelations.includes(name)) db.customRelations.push(name);

        saveLocalDB(db, clinicId);
        showToast(`✨ Relation "${name}" ${isEdit ? 'updated' : 'added'}!`);
        editItem = null;
        renderView();
      });
    }

    // Form 6: Society Form Submit (Add / Update)
    const formSoc = container.querySelector('#form-master-soc');
    if (formSoc) {
      formSoc.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#soc-name').value.trim();
        const area = container.querySelector('#soc-area').value.trim() || 'Ahmedabad';
        if (!name) return;

        if (!db.masterSocieties) db.masterSocieties = [];
        const isEdit = editItem && editItem.type === 'societies';

        if (isEdit) {
          const idx = db.masterSocieties.findIndex((s) => s.id === editItem.data.id);
          if (idx !== -1) {
            db.masterSocieties[idx] = {
              ...db.masterSocieties[idx],
              name,
              area,
              updatedAt: todayISO(),
            };
          }
        } else {
          db.masterSocieties.unshift({
            id: `s_${Date.now()}`,
            name,
            area,
            createdAt: todayISO(),
          });
        }

        if (!db.customSocieties) db.customSocieties = [];
        if (!db.customSocieties.includes(name)) db.customSocieties.push(name);

        saveLocalDB(db, clinicId);
        showToast(`✨ Society "${name}" ${isEdit ? 'updated' : 'added'}!`);
        editItem = null;
        renderView();
      });
    }

    // Form 7: Shortcut Form Submit (Update)
    const formSc = container.querySelector('#form-master-shortcut');
    if (formSc) {
      formSc.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = container.querySelector('#sc-key').value.trim();
        const title = container.querySelector('#sc-title').value.trim();
        const desc = container.querySelector('#sc-desc').value.trim();
        if (!key || !title) return;

        if (!db.customShortcuts) db.customShortcuts = [];
        const isEdit = editItem && editItem.type === 'shortcuts';

        if (isEdit) {
          const idx = db.customShortcuts.findIndex((s) => s.id === editItem.data.id);
          if (idx !== -1) {
            db.customShortcuts[idx] = {
              ...db.customShortcuts[idx],
              key,
              title,
              desc,
            };
          }
        } else {
          db.customShortcuts.push({
            id: `sc_${Date.now()}`,
            key,
            title,
            desc,
          });
        }

        saveLocalDB(db, clinicId);
        showToast(`✨ Shortcut "${key}" updated!`);
        editItem = null;
        renderView();
      });
    }

    // Edit Handlers for All Master Types
    container.querySelectorAll('.btn-edit-master').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const id = btn.getAttribute('data-id');

        if (type === 'dietary') {
          const d = db.dietary[id];
          if (d) {
            editItem = {
              type: 'dietary',
              data: {
                id: d.id,
                code: d.code,
                disease: d.disease || '',
                eat: d.eat || '',
                avoid: d.avoid || '',
                text: d.text || '',
              },
            };
            renderView();
          }
        } else if (type === 'areas') {
          const a = (db.masterAreas || []).find((item) => item.id === id);
          if (a) {
            editItem = { type: 'areas', data: { ...a } };
            renderView();
          }
        } else if (type === 'medicines') {
          const m = (db.masterMedicines || []).find((item) => item.id === id);
          if (m) {
            editItem = { type: 'medicines', data: { ...m } };
            renderView();
          }
        } else if (type === 'allergies') {
          const al = (db.masterAllergies || []).find((item) => item.id === id);
          if (al) {
            editItem = { type: 'allergies', data: { ...al } };
            renderView();
          }
        } else if (type === 'relations') {
          const r = (db.masterRelations || []).find((item) => item.id === id);
          if (r) {
            editItem = { type: 'relations', data: { ...r } };
            renderView();
          }
        } else if (type === 'societies') {
          const s = (db.masterSocieties || []).find((item) => item.id === id);
          if (s) {
            editItem = { type: 'societies', data: { ...s } };
            renderView();
          }
        } else if (type === 'shortcuts') {
          const sc = (db.customShortcuts || []).find((item) => item.id === id);
          if (sc) {
            editItem = { type: 'shortcuts', data: { ...sc } };
            renderView();
          }
        }
      });
    });

    // Delete Handlers for All Master Types
    container.querySelectorAll('.btn-del-master').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const id = btn.getAttribute('data-id');

        if (type === 'dietary') {
          if (confirm(`Delete dietary suggestion template "${id}"?`)) {
            delete db.dietary[id];
            saveLocalDB(db, clinicId);
            showToast(`Deleted dietary template "${id}"`, 'error');
            if (editItem && editItem.data?.code === id) editItem = null;
            renderView();
          }
        } else if (type === 'areas') {
          db.masterAreas = (db.masterAreas || []).filter((a) => a.id !== id);
          saveLocalDB(db, clinicId);
          showToast('Deleted area from master list', 'error');
          if (editItem && editItem.data?.id === id) editItem = null;
          renderView();
        } else if (type === 'medicines') {
          db.masterMedicines = (db.masterMedicines || []).filter((m) => m.id !== id);
          saveLocalDB(db, clinicId);
          showToast('Deleted medicine from catalogue', 'error');
          if (editItem && editItem.data?.id === id) editItem = null;
          renderView();
        } else if (type === 'allergies') {
          db.masterAllergies = (db.masterAllergies || []).filter((al) => al.id !== id);
          saveLocalDB(db, clinicId);
          showToast('Deleted allergy from master list', 'error');
          if (editItem && editItem.data?.id === id) editItem = null;
          renderView();
        } else if (type === 'relations') {
          db.masterRelations = (db.masterRelations || []).filter((r) => r.id !== id);
          saveLocalDB(db, clinicId);
          showToast('Deleted relation from master list', 'error');
          if (editItem && editItem.data?.id === id) editItem = null;
          renderView();
        } else if (type === 'societies') {
          db.masterSocieties = (db.masterSocieties || []).filter((s) => s.id !== id);
          saveLocalDB(db, clinicId);
          showToast('Deleted society from master list', 'error');
          if (editItem && editItem.data?.id === id) editItem = null;
          renderView();
        }
      });
    });
  }

  // Initial render
  renderView();
}
