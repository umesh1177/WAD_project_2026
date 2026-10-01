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
export const getClinicPrefix = (clinicId = 'demo') => {
  if (!clinicId || clinicId === 'demo') return '0001';
  const digits = String(clinicId).replace(/\D/g, '');
  if (digits) return pad(digits, 4);
  const clean = String(clinicId).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.slice(0, 4).padStart(4, '0');
};

export const generateFamilyId = (clinicId, year, seq) => {
  const prefix = getClinicPrefix(clinicId);
  const y = String(year || new Date().getFullYear());
  const s = pad(seq || 1, 4);
  return `${prefix}${y}${s}`; // 4 digit clinic + 4 digit year + 4 digit sequence (e.g. 000120260001)
};

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
    <span>${type === 'error' ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>'}</span>
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

  // If DB is missing or has old legacy ID format, refresh
  if (!db || !db.families || Object.keys(db.families).length === 0 || Object.keys(db.families).some(k => k.includes('-') || k.length < 12)) {
    db = seedLocalDatabase();
    localStorage.setItem(key, JSON.stringify(db));
  }

  // Ensure all dietary entries have the 4 structured fields (shortcut, disease, what to eat, what not to eat)
  if (db && db.dietary) {
    for (const [k, d] of Object.entries(db.dietary)) {
      if (!d.disease || !d.eat || !d.avoid) {
        if (k === 'DB' || k === 'SUGAR') {
          d.disease = d.disease || 'Diabetes Mellitus';
          d.eat = d.eat || 'Green leafy vegetables, whole grains, pulses, salads, bitter gourd, fresh water';
          d.avoid = d.avoid || 'Direct sugar, sweets, jaggery, potatoes, mangoes, bananas, bakery items, soft drinks';
        } else if (k === 'BP') {
          d.disease = d.disease || 'Hypertension (High BP)';
          d.eat = d.eat || 'Fresh fruits, vegetables, oats, garlic, coconut water, low-sodium foods';
          d.avoid = d.avoid || 'Extra salt, pickles, papad, processed cheese, namkeen, fried snacks';
        } else if (k === 'ACID') {
          d.disease = d.disease || 'Acidity / GERD / Gastritis';
          d.eat = d.eat || 'Cold milk, coconut water, bananas, boiled vegetables, oatmeal, light meals';
          d.avoid = d.avoid || 'Spicy food, oily/fried dishes, tea, coffee, citrus fruits, late dinner';
        } else if (k === 'CV') {
          d.disease = d.disease || 'Cardiovascular / Heart Disease';
          d.eat = d.eat || 'Oats, flaxseeds, almonds, boiled vegetables, garlic, fresh salads';
          d.avoid = d.avoid || 'Red meat, butter, ghee, deep-fried snacks, processed fast foods';
        } else if (k === 'LQ') {
          d.disease = d.disease || 'Viral Fever / Weakness / Dehydration';
          d.eat = d.eat || 'Plenty of warm fluids, coconut water, soup, moong dal khichdi';
          d.avoid = d.avoid || 'Cold drinks, heavy spicy food, street food, oily items';
        } else {
          d.disease = d.disease || 'General Clinical Condition';
          d.eat = d.eat || 'Fresh home-cooked food, fruits, vegetables, water';
          d.avoid = d.avoid || 'Oily, spicy, fried, and packaged food';
        }
        if (!d.text) {
          d.text = `${d.disease}: Eat: ${d.eat} | Avoid: ${d.avoid}`;
        }
      }
    }
  }

  return db;
}

export function saveLocalDB(db, clinicId = 'demo') {
  const key = `clinic-db-${clinicId}`;
  localStorage.setItem(key, JSON.stringify(db));
}

function seedLocalDatabase() {
  return {
    counters: { family: 2, patient: 3, visit: 2 },
    dietary: {
      DB: {
        id: 'd1',
        code: 'DB',
        disease: 'Diabetes Mellitus',
        eat: 'Green leafy vegetables, whole grains, pulses, salads, bitter gourd, fresh water',
        avoid: 'Direct sugar, sweets, jaggery, potatoes, mangoes, bananas, bakery products, soft drinks',
        text: 'Diabetes Diet: Eat whole grains, green vegetables, salads. Strictly avoid sugar, sweets, potatoes, soft drinks.',
        createdAt: '2026-01-10',
      },
      BP: {
        id: 'd2',
        code: 'BP',
        disease: 'Hypertension (High Blood Pressure)',
        eat: 'Fresh fruits, vegetables, oats, garlic, coconut water, low-sodium foods',
        avoid: 'Extra salt, pickles, papad, processed cheese, namkeen, fried snacks, canned food',
        text: 'Hypertension Diet: Eat fresh fruits, vegetables, oats. Strictly avoid extra salt, pickles, papad, salty snacks.',
        createdAt: '2026-01-10',
      },
      ACID: {
        id: 'd3',
        code: 'ACID',
        disease: 'Acidity / GERD / Gastritis',
        eat: 'Cold milk, coconut water, bananas, boiled vegetables, oatmeal, light meals',
        avoid: 'Spicy curries, oily/fried foods, tea, coffee, citrus fruits, late night heavy meals',
        text: 'Acidity / GERD Diet: Eat light boiled meals, cold milk, coconut water. Avoid spicy food, fried items, tea, coffee.',
        createdAt: '2026-01-10',
      },
      THYROID: {
        id: 'd4',
        code: 'THYROID',
        disease: 'Hypothyroidism / Thyroid Disorders',
        eat: 'Iodized salt, eggs, nuts, whole grains, roasted pumpkin seeds, fresh fruits',
        avoid: 'Raw cabbage, cauliflower, broccoli, soy products, gluten, processed junk',
        text: 'Thyroid Diet: Eat iodized salt, whole grains, nuts. Avoid raw cabbage, cauliflower, broccoli, soy products.',
        createdAt: '2026-01-10',
      },
      URIC: {
        id: 'd5',
        code: 'URIC',
        disease: 'Hyperuricemia / Gout (High Uric Acid)',
        eat: 'Cherries, lemons, fresh vegetables, high fluid intake, low-fat curd, water (3-4L)',
        avoid: 'Red meat, seafood, organ meats, beer/alcohol, sugary drinks, high-purine pulses',
        text: 'Uric Acid Diet: Drink 3-4L water, eat fresh vegetables, cherries. Avoid red meat, seafood, alcohol, high-purine pulses.',
        createdAt: '2026-01-10',
      },
      CV: {
        id: 'd6',
        code: 'CV',
        disease: 'Cardiovascular / Heart Disease / High Cholesterol',
        eat: 'Oats, flaxseeds, almonds, olive oil, boiled vegetables, garlic, apples',
        avoid: 'Red meat, butter, ghee, fried snacks, trans fats, packaged/processed fast foods',
        text: 'Cardiovascular Diet: Eat oats, flaxseeds, garlic, boiled vegetables. Avoid butter, ghee, red meat, fried snacks.',
        createdAt: '2026-01-10',
      },
      LQ: {
        id: 'd7',
        code: 'LQ',
        disease: 'Viral Fever / Weakness / Dehydration',
        eat: 'Plenty of warm fluids, coconut water, dal water, khichdi, soup, boiled water',
        avoid: 'Cold beverages, oily food, heavy spicy meals, street food, hard-to-digest items',
        text: 'Fever / Fluid Diet: Plenty of warm fluids, coconut water, soup, khichdi. Avoid cold drinks, oily heavy food.',
        createdAt: '2026-01-10',
      },
    },
    masterAreas: [
      { id: 'a1', name: 'Vastrapur', city: 'Ahmedabad', pincode: '380015', createdAt: '2026-01-01' },
      { id: 'a2', name: 'Satellite', city: 'Ahmedabad', pincode: '380015', createdAt: '2026-01-01' },
      { id: 'a3', name: 'Navrangpura', city: 'Ahmedabad', pincode: '380009', createdAt: '2026-01-01' },
      { id: 'a4', name: 'Bopal', city: 'Ahmedabad', pincode: '380058', createdAt: '2026-01-01' },
      { id: 'a5', name: 'Thaltej', city: 'Ahmedabad', pincode: '380054', createdAt: '2026-01-01' },
      { id: 'a6', name: 'Gota', city: 'Ahmedabad', pincode: '382481', createdAt: '2026-01-01' },
      { id: 'a7', name: 'Maninagar', city: 'Ahmedabad', pincode: '380008', createdAt: '2026-01-01' },
      { id: 'a8', name: 'Paldi', city: 'Ahmedabad', pincode: '380007', createdAt: '2026-01-01' },
      { id: 'a9', name: 'Science City', city: 'Ahmedabad', pincode: '380060', createdAt: '2026-01-01' },
      { id: 'a10', name: 'Varachha', city: 'Surat', pincode: '395006', createdAt: '2026-01-01' },
    ],
    masterMedicines: [
      { id: 'm1', name: 'Paracetamol 650mg', category: 'Antipyretic / Analgesic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 5, createdAt: '2026-01-01' },
      { id: 'm2', name: 'Pantoprazole 40mg', category: 'Antacid / PPI', form: 'Tablet', defaultDosage: '1-0-0 BF', unitPrice: 8, createdAt: '2026-01-01' },
      { id: 'm3', name: 'Amoxicillin 500mg', category: 'Antibiotic', form: 'Capsule', defaultDosage: '1-0-1 AF', unitPrice: 12, createdAt: '2026-01-01' },
      { id: 'm4', name: 'Cetirizine 10mg', category: 'Antihistamine / Allergy', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 4, createdAt: '2026-01-01' },
      { id: 'm5', name: 'Azithromycin 500mg', category: 'Antibiotic', form: 'Tablet', defaultDosage: '1-0-0 OD', unitPrice: 22, createdAt: '2026-01-01' },
      { id: 'm6', name: 'Ibuprofen 400mg', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 6, createdAt: '2026-01-01' },
      { id: 'm7', name: 'Cough Relief Syrup 100ml', category: 'Expectorant', form: 'Syrup', defaultDosage: '2 Tsp TDS', unitPrice: 85, createdAt: '2026-01-01' },
    ],
    masterAllergies: [
      { id: 'al1', name: 'None', category: 'General', severity: 'None', createdAt: '2026-01-01' },
      { id: 'al2', name: 'Penicillin', category: 'Drug Allergy', severity: 'Severe', createdAt: '2026-01-01' },
      { id: 'al3', name: 'Sulfa Drugs', category: 'Drug Allergy', severity: 'Moderate', createdAt: '2026-01-01' },
      { id: 'al4', name: 'Aspirin / NSAIDs', category: 'Drug Allergy', severity: 'Moderate', createdAt: '2026-01-01' },
      { id: 'al5', name: 'Dust / Pollen', category: 'Environmental', severity: 'Mild', createdAt: '2026-01-01' },
      { id: 'al6', name: 'Peanuts', category: 'Food Allergy', severity: 'Severe', createdAt: '2026-01-01' },
      { id: 'al7', name: 'Latex', category: 'Contact', severity: 'Moderate', createdAt: '2026-01-01' },
      { id: 'al8', name: 'Ciprofloxacin', category: 'Drug Allergy', severity: 'Moderate', createdAt: '2026-01-01' },
      { id: 'al9', name: 'Amoxicillin', category: 'Drug Allergy', severity: 'Severe', createdAt: '2026-01-01' },
    ],
    masterRelations: [
      { id: 'r1', name: 'Head', category: 'Primary', description: 'Head of Family', createdAt: '2026-01-01' },
      { id: 'r2', name: 'Wife', category: 'Spouse', description: 'Wife of Head', createdAt: '2026-01-01' },
      { id: 'r3', name: 'Husband', category: 'Spouse', description: 'Husband of Head', createdAt: '2026-01-01' },
      { id: 'r4', name: 'Son', category: 'Child', description: 'Son of Head', createdAt: '2026-01-01' },
      { id: 'r5', name: 'Daughter', category: 'Child', description: 'Daughter of Head', createdAt: '2026-01-01' },
      { id: 'r6', name: 'Father', category: 'Parent', description: 'Father of Head', createdAt: '2026-01-01' },
      { id: 'r7', name: 'Mother', category: 'Parent', description: 'Mother of Head', createdAt: '2026-01-01' },
      { id: 'r8', name: 'Brother', category: 'Sibling', description: 'Brother of Head', createdAt: '2026-01-01' },
      { id: 'r9', name: 'Sister', category: 'Sibling', description: 'Sister of Head', createdAt: '2026-01-01' },
      { id: 'r10', name: 'Grandfather', category: 'Grandparent', description: 'Grandfather of Head', createdAt: '2026-01-01' },
      { id: 'r11', name: 'Grandmother', category: 'Grandparent', description: 'Grandmother of Head', createdAt: '2026-01-01' },
      { id: 'r12', name: 'Daughter-in-Law', category: 'In-Law', description: 'Daughter-in-Law of Head', createdAt: '2026-01-01' },
      { id: 'r13', name: 'Son-in-Law', category: 'In-Law', description: 'Son-in-Law of Head', createdAt: '2026-01-01' },
      { id: 'r14', name: 'Other', category: 'Extended', description: 'Other Relation', createdAt: '2026-01-01' },
    ],
    masterSocieties: [
      { id: 's1', name: 'Shanti Niketan Apt', area: 'Vastrapur', createdAt: '2026-01-01' },
      { id: 's2', name: 'Gokuldham Society', area: 'Navrangpura', createdAt: '2026-01-01' },
      { id: 's3', name: 'Surya Kiran Heights', area: 'Satellite', createdAt: '2026-01-01' },
      { id: 's4', name: 'Radhe Krishna Bunglows', area: 'Bopal', createdAt: '2026-01-01' },
      { id: 's5', name: 'Vrindavan Society', area: 'Thaltej', createdAt: '2026-01-01' },
      { id: 's6', name: 'Royal Residency', area: 'Gota', createdAt: '2026-01-01' },
      { id: 's7', name: 'Shivam Heights', area: 'Maninagar', createdAt: '2026-01-01' },
      { id: 's8', name: 'Silver Crest', area: 'Paldi', createdAt: '2026-01-01' },
    ],
    families: {
      '000120260001': {
        id: '000120260001',
        famId: '000120260001',
        headName: 'PATEL RAMESHBHAI GOVINDBHAI',
        society: 'Shanti Niketan Apt',
        registeredBy: 'Self',
        area: 'VASTRAPUR',
        phone: '9876543210',
        year: 2026,
        sequence: 1,
        createdAt: todayISO(),
        patients: {
          '000120260001': {
            id: '000120260001',
            patId: '000120260001',
            familyId: '000120260001',
            name: 'PATEL RAMESHBHAI GOVINDBHAI',
            relation: 'Head',
            age: '45',
            bloodGroup: 'O+',
            society: 'Shanti Niketan Apt',
            allergy: '',
            phone: '9876543210',
            visits: [
              {
                id: 'v1',
                caseId: '00012026000101',
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
          '000120260002': {
            id: '000120260002',
            patId: '000120260002',
            familyId: '000120260001',
            name: 'PATEL SHARDABEN RAMESHBHAI',
            relation: 'Wife',
            age: '43',
            bloodGroup: 'B+',
            society: 'Shanti Niketan Apt',
            allergy: 'DUST',
            phone: '9876543210',
            visits: [],
          },
        },
      },
      '000120260002': {
        id: '000120260002',
        famId: '000120260002',
        headName: 'SHARMA AMITBHAI DINESHBHAI',
        society: 'Gokuldham Society',
        registeredBy: 'Self',
        area: 'NAVRANGPURA',
        phone: '9876543211',
        year: 2026,
        sequence: 2,
        createdAt: todayISO(),
        patients: {
          '000120260003': {
            id: '000120260003',
            patId: '000120260003',
            familyId: '000120260002',
            name: 'SHARMA AMITBHAI DINESHBHAI',
            relation: 'Head',
            age: '50',
            bloodGroup: 'A+',
            society: 'Gokuldham Society',
            allergy: '',
            phone: '9876543211',
            visits: [
              {
                id: 'v2',
                caseId: '00012026000201',
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
