/**
 * =========================================================
 * CLINIC API CLIENT & DATA ADAPTER
 * Unified native fetch() API wrapper with offline fallback
 * =========================================================
 */

const API_BASE_URL = window.location.origin.includes('5000')
  ? ''
  : window.location.port === '' || window.location.port === '80'
  ? ''
  : 'http://localhost:5000';

/* ---- Storage & Helpers ---- */
export const pad = (n, len = 4) => String(n || 0).padStart(len, '0');
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`;
};
export const fmtDate = (iso) => {
  if (!iso) return '-';
  const parts = String(iso).slice(0, 10).split('-');
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};
export const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const uid = () => Math.random().toString(36).slice(2, 10);
export const makeCaseId = (famId, patId, visitNum) => {
  const f = pad(String(famId).replace(/\D/g, '') || famId, 2);
  const p = pad(String(patId).replace(/\D/g, '') || patId, 2);
  const v = pad(String(visitNum).replace(/\D/g, '') || visitNum, 2);
  return `${f}${p}${v}`;
};

/* ---- Global Toast Trigger ---- */
export function showToast(msg, type = 'success') {
  const existing = document.getElementById('cms-global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cms-global-toast';
  toast.className = `cms-toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '✓'}</span>
    <span>${msg}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3500);
}

/* ---- HTTP Headers Builder ---- */
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const session = getAuthSession();
  if (session && session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  if (session && session.profile && session.profile.activeClinicId) {
    headers['x-clinic-id'] = session.profile.activeClinicId;
  }
  return headers;
}

/* ---- Session Management ---- */
export function getAuthSession() {
  try {
    const raw = localStorage.getItem('clinic-auth-session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAuthSession(data) {
  if (!data) {
    localStorage.removeItem('clinic-auth-session');
  } else {
    localStorage.setItem('clinic-auth-session', JSON.stringify(data));
  }
}

/* ---- Native Fetch API Calls ---- */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const config = {
    method: options.method || 'GET',
    headers: { ...getHeaders(), ...(options.headers || {}) },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API Network fallback for ${endpoint}]:`, err.message);
    return fallbackLocalHandler(endpoint, config);
  }
}

/* ---- Offline/Local DB Fallback Engine ---- */
export function getLocalDB(clinicId = 'demo') {
  const key = `clinic-db-${clinicId}`;
  let db = null;
  try {
    const stored = localStorage.getItem(key);
    if (stored) db = JSON.parse(stored);
  } catch (e) {}

  if (!db) {
    db = seedLocalDatabase();
    localStorage.setItem(key, JSON.stringify(db));
  }
  return db;
}

export function saveLocalDB(db, clinicId = 'demo') {
  const key = `clinic-db-${clinicId}`;
  localStorage.setItem(key, JSON.stringify(db));
}

function seedLocalDatabase() {
  return {
    counters: { family: 6, patient: 11, visit: 1 },
    dietary: {
      DB: { code: 'DB', text: 'Diabetic diet: avoid sugar, sweets and fried food. Prefer high-fibre meals, eat on time.' },
      CV: { code: 'CV', text: 'Low-salt, low-oil diet. Avoid red meat and packaged/processed food.' },
      LQ: { code: 'LQ', text: 'Plenty of fluids and light, easily digestible food until fever/cough settles.' },
      SUGAR: { code: 'SUGAR', text: 'Avoid direct sugar, jaggery, sweets, sweet fruits like mango & banana.' },
      BP: { code: 'BP', text: 'Strict low salt diet. Avoid pickles, papad, processed cheese and salty snacks.' },
      ACID: { code: 'ACID', text: 'Avoid spicy food, oily dishes, tea, coffee, citrus fruits.' },
    },
    families: {
      '0001': {
        id: '0001',
        famId: '0001',
        headName: 'PATEL RAMESHBHAI GOVINDBHAI',
        area: 'VASTRAPUR',
        phone: '9876543210',
        createdAt: todayISO(),
        patients: {
          '0001': {
            id: '0001',
            patId: '0001',
            familyId: '0001',
            name: 'PATEL RAMESHBHAI GOVINDBHAI',
            relation: 'Head',
            age: '45',
            bloodGroup: 'O+',
            allergy: '',
            visits: [
              {
                id: 'v1',
                caseId: '0001000101',
                visitNum: 1,
                date: todayISO(),
                time: '10:15',
                weight: '75',
                bp: '130/80',
                refDr: 'Dr. Shah',
                diagnosis: 'Viral Infection',
                complaint: 'Cough and Cold',
                treatment: [{ name: 'Checkup', qty: '1' }],
                prescription: [{ name: 'Paracetamol 650mg', qty: '10', mor: '1', noon: '1', eve: '1', ngt: '0', timing: 'AF' }],
                charge: 800,
                received: 500,
                due: 300,
              },
            ],
          },
          '0002': {
            id: '0002',
            patId: '0002',
            familyId: '0001',
            name: 'PATEL SHARDABEN RAMESHBHAI',
            relation: 'Wife',
            age: '43',
            bloodGroup: 'B+',
            allergy: 'DUST',
            visits: [],
          },
        },
      },
      '0002': {
        id: '0002',
        famId: '0002',
        headName: 'SHARMA AMITBHAI DINESHBHAI',
        area: 'NAVRANGPURA',
        phone: '9876543211',
        createdAt: todayISO(),
        patients: {
          '0003': {
            id: '0003',
            patId: '0003',
            familyId: '0002',
            name: 'SHARMA AMITBHAI DINESHBHAI',
            relation: 'Head',
            age: '50',
            bloodGroup: 'A+',
            allergy: '',
            visits: [],
          },
          '0004': {
            id: '0004',
            patId: '0004',
            familyId: '0002',
            name: 'SHARMA NEHABEN AMITBHAI',
            relation: 'Wife',
            age: '48',
            bloodGroup: 'A+',
            allergy: '',
            visits: [
              {
                id: 'v2',
                caseId: '0002000401',
                visitNum: 1,
                date: todayISO(),
                time: '11:00',
                weight: '62',
                bp: '110/70',
                refDr: 'Self',
                diagnosis: 'Acidity',
                complaint: 'Stomach pain',
                treatment: [{ name: 'Consultation', qty: '1' }],
                prescription: [{ name: 'Pantoprazole 40mg', qty: '5', mor: '1', noon: '0', eve: '0', ngt: '0', timing: 'BF' }],
                charge: 400,
                received: 400,
                due: 0,
              },
            ],
          },
        },
      },
    },
  };
}

function fallbackLocalHandler(endpoint, config) {
  const session = getAuthSession();
  const clinicId = session?.profile?.activeClinicId || 'demo';
  const db = getLocalDB(clinicId);

  // Fallback for families
  if (endpoint.startsWith('/families')) {
    const list = Object.values(db.families);
    return { success: true, count: list.length, data: list };
  }

  // Fallback for stats
  if (endpoint.startsWith('/reports/stats')) {
    const allPats = [];
    const allVisits = [];
    Object.values(db.families).forEach((f) => {
      Object.values(f.patients).forEach((p) => {
        allPats.push(p);
        p.visits.forEach((v) => allVisits.push({ ...v, famHead: f.headName, famId: f.id, patName: p.name }));
      });
    });

    const targetDate = todayISO();
    const targetVisits = allVisits.filter((v) => v.date === targetDate);
    const dateCollection = targetVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const totalDue = allVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);

    return {
      success: true,
      data: {
        totalFamilies: Object.keys(db.families).length,
        totalPatients: allPats.length,
        visitsCount: targetVisits.length,
        dateCollection,
        totalDue,
        drCounts: { Self: allVisits.length },
        diagCounts: {},
        areaCounts: {},
      },
    };
  }

  return { success: true, data: [] };
}
