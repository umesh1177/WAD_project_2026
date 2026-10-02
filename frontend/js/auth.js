/**
 * =========================================================
 * AUTHENTICATION & CLINIC PROFILE LOGIC
 * =========================================================
 */

import { apiFetch, getAuthSession, setAuthSession, showToast, uid } from './api.js';

export function initAuth() {
  const session = getAuthSession();
  return session;
}

export async function loginUser(username, password) {
  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: { username, password },
    });

    if (res && res.success) {
      const sessionData = {
        token: res.token,
        role: res.user.role,
        profile: res.user,
      };
      setAuthSession(sessionData);
      showToast(`Welcome back, ${res.user.name || res.user.username}!`);
      return sessionData;
    } else {
      throw new Error(res.message || 'Login failed');
    }
  } catch (err) {
    // Local Master DB Fallback for seamless offline experience
    return fallbackLocalLogin(username, password);
  }
}

function fallbackLocalLogin(username, password) {
  const u = username.trim().toLowerCase();
  const p = password.trim();

  if (u === 'admin' && p === 'admin') {
    const adminSession = {
      role: 'admin',
      profile: { username: 'admin', name: 'System Administrator', role: 'admin' },
      token: 'mock-admin-token',
    };
    setAuthSession(adminSession);
    showToast('Signed in as Administrator');
    return adminSession;
  }

  if (u === 'dhyey' && p === '123') {
    const doctorSession = {
      role: 'doctor',
      profile: {
        id: 'demo',
        username: 'dhyey',
        name: 'Dr. Chirag Paghdal',
        degree: 'B.H.M.S.',
        regNo: 'G-9035',
        clinics: [{ id: 'demo', name: 'Dhyey Clinic & Nursing Home' }],
        activeClinicId: 'demo',
        role: 'doctor',
      },
      token: 'mock-doctor-token',
    };
    setAuthSession(doctorSession);
    showToast('Signed in as Dr. Chirag Paghdal');
    return doctorSession;
  }

  // Receptionist Default Demo Login (Verified with Clinic Receptionist Service)
  if ((u === 'reception' || u === 'receptionist') && (p === '123' || p === 'reception' || p === '123456')) {
    const adminClinics = JSON.parse(localStorage.getItem('dhyey-admin-clinics') || '[]');
    const demoClinic = adminClinics.find(c => c.id === 'demo' || c.id === 'CLN-001') || {
      id: 'demo',
      name: 'Dhyey Clinic & Nursing Home',
      services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing']
    };

    const hasReceptionistService = Array.isArray(demoClinic.services) ? demoClinic.services.includes('receptionist') : true;
    if (!hasReceptionistService) {
      throw new Error('This clinic has disabled the Receptionist Service. Receptionist portal access is blocked.');
    }

    const receptionistSession = {
      role: 'receptionist',
      profile: {
        id: 'rec-001',
        username: 'reception',
        name: 'Front Desk Receptionist',
        role: 'receptionist',
        clinicName: demoClinic.name || 'Dhyey Clinic & Nursing Home',
        activeClinicId: demoClinic.id || 'demo',
        services: demoClinic.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing']
      },
      token: 'mock-receptionist-token'
    };
    setAuthSession(receptionistSession);
    showToast('Signed in as Front Desk Receptionist');
    return receptionistSession;
  }

  // Check doctors registered in Admin Portal
  try {
    const adminDocs = JSON.parse(localStorage.getItem('dhyey-admin-doctors') || '[]');
    const adminClinics = JSON.parse(localStorage.getItem('dhyey-admin-clinics') || '[]');

    const doc = adminDocs.find((d) => {
      const emailMatch = (d.email || '').trim().toLowerCase() === u;
      const usernameMatch = (d.username || '').trim().toLowerCase() === u;
      const nameMatch = (d.name || '').trim().toLowerCase() === u;
      const pwdMatch = !d.password || d.password === p;
      return (emailMatch || usernameMatch || nameMatch) && pwdMatch;
    });

    if (doc) {
      if (doc.status === 'Suspended') {
        throw new Error('This doctor account has been suspended by the administrator.');
      }
      const matchedClinic = adminClinics.find((c) => c.name === doc.clinic || c.id === doc.clinicId) || {
        id: doc.clinicId || ('CLN-' + (doc.clinic || 'custom').replace(/\s+/g, '_')),
        name: doc.clinic || 'Clinic',
        services: Array.isArray(doc.services) ? doc.services : ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
      };
      const clinicServices = Array.isArray(matchedClinic.services)
        ? matchedClinic.services
        : (Array.isArray(doc.services) ? doc.services : ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing']);
      const clinicId = matchedClinic.id || doc.clinicId || 'CLN-001';

      const doctorSession = {
        role: 'doctor',
        profile: {
          id: doc.id || doc.email || 'doc_' + Math.random().toString(36).slice(2, 7),
          username: doc.email || doc.name,
          name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
          degree: doc.specialty || 'General Practitioner',
          regNo: doc.registration || 'REG-2026',
          clinics: [{ id: clinicId, name: matchedClinic.name || doc.clinic, services: clinicServices }],
          activeClinicId: clinicId,
          role: 'doctor',
          services: clinicServices,
        },
        token: 'mock-doctor-token-' + (doc.email || 'admin-doc'),
      };
      setAuthSession(doctorSession);
      showToast(`Signed in as ${doctorSession.profile.name}`);
      return doctorSession;
    }
  } catch (e) {
    if (e.message && e.message.includes('suspended')) throw e;
  }

  // Check custom local doctors master db
  try {
    const stored = localStorage.getItem('clinic-master-db');
    if (stored) {
      const masterDb = JSON.parse(stored);
      const doctor = masterDb.doctors.find((d) => d.username === u && d.password === p);
      if (doctor) {
        const session = {
          role: 'doctor',
          profile: doctor,
          token: 'mock-doctor-token-' + doctor.id,
        };
        setAuthSession(session);
        showToast(`Signed in as Dr. ${doctor.username}`);
        return session;
      }
    }
  } catch (e) {}

  throw new Error('Invalid username or password');
}

export function logoutUser() {
  localStorage.removeItem('clinic-auth-session');
  setAuthSession(null);
  sessionStorage.clear();
  showToast('Signed out successfully');
  const isInsidePages = window.location.pathname.includes('/pages/');
  setTimeout(() => {
    window.location.href = isInsidePages ? 'login.html?logout=true' : 'pages/login.html?logout=true';
  }, 150);
}

export async function switchDoctorClinic(newClinicId) {
  const session = getAuthSession();
  if (!session || !session.profile) return;

  session.profile.activeClinicId = newClinicId;
  setAuthSession(session);

  try {
    await apiFetch('/auth/switch-clinic', {
      method: 'POST',
      body: { clinicId: newClinicId },
    });
  } catch (e) {}

  showToast('Switched active clinic');
  window.location.reload();
}

export async function addDoctorClinic(clinicName) {
  if (!clinicName || !clinicName.trim()) return;
  const session = getAuthSession();
  if (!session || !session.profile) return;

  const newClinic = { id: uid(), name: clinicName.trim() };
  if (!session.profile.clinics) session.profile.clinics = [];
  session.profile.clinics.push(newClinic);
  session.profile.activeClinicId = newClinic.id;
  setAuthSession(session);

  try {
    await apiFetch('/auth/add-clinic', {
      method: 'POST',
      body: { name: clinicName.trim() },
    });
  } catch (e) {}

  showToast(`Clinic "${clinicName}" created`);
  window.location.reload();
}
