const fs = require('fs');
let content = fs.readFileSync('frontend/js/appointment.js', 'utf8');

// 1. Init block
content = content.replace(
\  const db = getLocalDB(clinicId);

  // Sync patient queue from DB or localStorage
  let queue = db.patientQueue || [];
  if (!queue || queue.length === 0) {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) queue = JSON.parse(raw);
    } catch (e) {}
  }\,
\  let queue = [];
  try {
    const res = await apiFetch('/appointments');
    if (res.success) queue = res.data || [];
  } catch (e) { console.error('Queue load failed', e); }\
);

// 2. In Consult
content = content.replace(
\        if (item) {
          item.status = 'In Consultation';
          db.patientQueue = queue;
          saveLocalDB(db, clinicId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        }\,
\        if (item) {
          item.status = 'In Consultation';
          const apiId = item._id || item.id;
          if (apiId) apiFetch('/appointments/' + apiId, { method: 'PUT', body: { status: 'In Consultation' } }).catch(e=>console.error(e));
        }\
);

// 3. Mark Done
content = content.replace(
\        if (item) {
          item.status = 'Completed';
          db.patientQueue = queue;
          saveLocalDB(db, clinicId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
          renderView();
          showToast(\\\Token \ marked as Completed\\\);
        }\,
\        if (item) {
          item.status = 'Completed';
          const apiId = item._id || item.id;
          if (apiId) apiFetch('/appointments/' + apiId, { method: 'PUT', body: { status: 'Completed' } }).catch(e=>console.error(e));
          renderView();
          showToast(\\\Token \ marked as Completed\\\);
        }\
);

// 4. Delete
content = content.replace(
\        if (confirm(\\\Remove token \ from today's queue?\\\)) {
          queue = queue.filter((q) => q.token !== token);
          db.patientQueue = queue;
          saveLocalDB(db, clinicId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
          renderView();
          showToast(\\\Token \ removed from queue\\\);
        }\,
\        const item = queue.find((q) => q.token === token);
        if (confirm(\\\Remove token \ from today's queue?\\\)) {
          queue = queue.filter((q) => q.token !== token);
          const apiId = item ? (item._id || item.id) : null;
          if (apiId) apiFetch('/appointments/' + apiId, { method: 'DELETE' }).catch(e=>console.error(e));
          renderView();
          showToast(\\\Token \ removed from queue\\\);
        }\
);

// 5. Modal Consult
content = content.replace(
\      item.status = 'In Consultation';
      db.patientQueue = queue;
      saveLocalDB(db, clinicId);
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));\,
\      item.status = 'In Consultation';
      const apiId = item._id || item.id;
      if (apiId) apiFetch('/appointments/' + apiId, { method: 'PUT', body: { status: 'In Consultation' } }).catch(e=>console.error(e));\
);

// 6. Open Walkin Modal
content = content.replace(
\  function openWalkinModal() {
    const modalRoot = container.querySelector('#modal-add-walkin-container');
    if (!modalRoot) return;

    // Collect all registered patients for autocomplete
    const allPatients = [];
    Object.values(db.families || {}).forEach((f) => {
      Object.values(f.patients || {}).forEach((p) => {
        allPatients.push({
          id: p.id || p.patId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          familyId: f.famId || f.id,
          familyHead: f.headName,
          phone: p.phone || f.phone,
          area: f.area,
        });
      });
    });\,
\  async function openWalkinModal() {
    const modalRoot = container.querySelector('#modal-add-walkin-container');
    if (!modalRoot) return;

    let allPatients = [];
    try {
      const res = await apiFetch('/patients');
      if (res.success && res.data) {
        allPatients = res.data.map(p => ({
          id: p._id || p.patId,
          name: p.name,
          age: p.age,
          gender: p.gender,
          familyId: p.familyId ? typeof p.familyId === 'object' ? p.familyId._id : p.familyId : '',
          familyHead: (p.familyId && p.familyId.headName) ? p.familyId.headName : p.familyHead || 'Self',
          phone: p.phone,
          area: p.area
        }));
      }
    } catch (e) {
       console.error("Failed fetching patients", e);
    }\
);

// 7. Add Walkin Save
content = content.replace(
\      db.appointments.push({
        id: 'apt-' + Date.now(),
        patientId: pId,
        patientName: name,
        familyId: famId,
        clinicId,
        appointmentDate: todayISO(),
        appointmentTime: nowTime(),
        reason: comp,
        status: 'Waiting'
      });
      saveLocalDB(db, clinicId);
      queue.push({
        token: tkn,
        patientId: pId,
        name,
        age,
        gender,
        familyId: famId,
        familyHead: btn.getAttribute('data-family-head'),
        phone: btn.getAttribute('data-phone'),
        area: btn.getAttribute('data-area'),
        complaint: comp,
        vitals: {},
        date: todayISO(),
        arrivedAt: nowTime(),
        status: 'Waiting',
      });
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));\,
\      try {
        const added = await apiFetch('/appointments', {
          method: 'POST',
          body: {
            token: tkn,
            patientId: pId,
            name, age, gender,
            familyId: famId,
            familyHead: btn.getAttribute('data-family-head'),
            phone: btn.getAttribute('data-phone'),
            area: btn.getAttribute('data-area'),
            complaint: comp, vitals: {}, date: todayISO()
          }
        });
        if (added && added.success) {
          queue.push(added.data);
        }
      } catch (e) { console.error('Failed to post appointment', e); }\
);

fs.writeFileSync('frontend/js/appointment.js', content);
console.log('appointment.js replaced successfully!');
