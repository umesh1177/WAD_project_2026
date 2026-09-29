import React, { useState, useEffect, useCallback, useRef } from "react";
import { uid, seedDB, pad, makeCaseId } from "./helpers";
import { GlobalStyle } from "./theme";
import { Sidebar, TopBar, StatusBar, Toast } from "./components";
import Dashboard from "./Dashboard";
import RegisterView from "./RegisterView";
import CaseEntryView from "./CaseEntryView";
import ReportsView from "./ReportsView";
import PrescriptionPrintModal from "./PrintModal";

export default function ClinicApp({ doctorProfile, onLogout, onUpdateDoctorProfile }) {
  const [db, setDb] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard, register, case, reports
  const [theme, setTheme] = useState(() => localStorage.getItem("clinic_theme") || "light");
  const [toast, setToast] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [topQuery, setTopQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "family"|"patient", famId, patId }

  // Global selection and context state
  const [selection, setSelection] = useState({ familyId: null, patientId: null });
  const [regTab, setRegTab] = useState("family"); // family, member, dietary
  const actionsRef = useRef({ newVisit: null, print: null });

  // Persistence (localStorage) - Dynamic DB based on doctor
  useEffect(() => {
    try {
      if (!doctorProfile) return;
      const dbKey = `clinic-db-${doctorProfile.activeClinicId}`;
      const stored = localStorage.getItem(dbKey);
      if (stored) { setDb(JSON.parse(stored)); }
      else {
        let init;
        if (doctorProfile.activeClinicId === 'demo') {
          init = seedDB();
        } else {
          // Start empty data for new doctor clinics
          init = {
            families: {}, dietary: {},
            counters: { family: 1, patient: 1, visit: 1 }
          };
        }
        setDb(init);
        localStorage.setItem(dbKey, JSON.stringify(init));
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [doctorProfile]);

  const saveDb = (newDb) => {
    if (!doctorProfile) return;
    const dbKey = `clinic-db-${doctorProfile.activeClinicId}`;
    setDb(newDb);
    localStorage.setItem(dbKey, JSON.stringify(newDb));
  };
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        if (e.key === "Escape") document.activeElement.blur();
        return;
      }

      if (e.key === "F1") { e.preventDefault(); setView("register"); setRegTab("family"); }
      if (e.key === "F2") { e.preventDefault(); setView("register"); setRegTab("member"); }
      if (e.key === "F3") { e.preventDefault(); setView("case"); }
      if (e.key === "F4") { e.preventDefault(); setView("dashboard"); }
      if (e.key === "F5") { e.preventDefault(); setView("reports"); }
      if (e.key === "F6" && view === "case" && actionsRef.current.newVisit) { e.preventDefault(); actionsRef.current.newVisit(); }
      if (e.key === "F9" && view === "case" && actionsRef.current.print) { e.preventDefault(); actionsRef.current.print(); }
      if (e.key === "/") { e.preventDefault(); document.getElementById("cms-top-search")?.focus(); }
      if (e.key === "Escape" && printData) { e.preventDefault(); setPrintData(null); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, printData]);

  const handleGlobalSearch = (q) => {
    if (!db || !q.trim()) return;
    const query = q.trim().toLowerCase();

    let found = null;
    const allFamilies = Object.values(db.families);

    // Check patients first for exact direct hits or name links
    for (const fam of allFamilies) {
      for (const p of Object.values(fam.patients)) {
        if (p.id.toLowerCase() === query || p.name.toLowerCase().includes(query)) {
          found = { familyId: fam.id, patientId: p.id };
          break;
        }
      }
      if (found) break;

      // Fallback to family search
      if (fam.id.toLowerCase() === query || fam.headName.toLowerCase().includes(query) || (fam.area || "").toLowerCase().includes(query)) {
        found = { familyId: fam.id, patientId: Object.keys(fam.patients)[0] || null };
      }
    }

    if (found) {
      setSelection(found);
      setView("case");
      setTopQuery("");
    } else {
      showToast("No matching record found.", "error");
    }
  };

  /* ---- Data Actions ---- */
  const createFamily = (headName, area, phone) => {
    const nextId = pad(db.counters.family, 4); // "0002"
    const nextPatId = pad(db.counters.patient, 4);

    const pat = { id: nextPatId, name: headName, relation: "Head", age: "", bloodGroup: "", allergy: "", visits: [] };
    const fam = { id: nextId, headName, area, phone, createdAt: new Date().toISOString(), patients: { [nextPatId]: pat } };

    saveDb({ ...db, counters: { ...db.counters, family: db.counters.family + 1, patient: db.counters.patient + 1 }, families: { ...db.families, [nextId]: fam } });
    showToast(`Family ID ${nextId} generated, patient ${nextPatId} added`);
    setSelection({ familyId: nextId, patientId: nextPatId });
    setView("case");
  };

  const addMember = (famId, data) => {
    const nextPatId = pad(db.counters.patient, 4);
    const pat = { id: nextPatId, name: data.name, relation: data.relation, age: data.age, bloodGroup: data.bloodGroup, allergy: data.allergy, visits: [] };
    const fam = db.families[famId];
    fam.patients[nextPatId] = pat;
    saveDb({ ...db, counters: { ...db.counters, patient: db.counters.patient + 1 }, families: { ...db.families, [famId]: fam } });
    showToast(`${data.name} added to family ${famId}`);
    // Auto-select and go to case view for the newly added member instantly
    setSelection({ familyId: famId, patientId: nextPatId });
    setView("case");
  };

  const addVisit = (famId, patId, visitData) => {
    const fam = db.families[famId];
    const pat = fam.patients[patId];
    const vCount = pat.visits.length + 1;
    const caseId = makeCaseId(famId, patId, vCount);
    const visit = { id: uid(), caseId, visitNum: vCount, ...visitData };
    pat.visits = [...pat.visits, visit];
    saveDb({ ...db, counters: { ...db.counters, visit: db.counters.visit + 1 }, families: { ...db.families, [famId]: fam } });
    showToast(`Visit saved for ${pat.name}! Case ${caseId}`);
    return visit;
  };

  const updateVisit = (famId, patId, visitId, updateData) => {
    const fam = db.families[famId];
    const pat = fam.patients[patId];
    const idx = pat.visits.findIndex(v => v.id === visitId);
    if (idx !== -1) {
      pat.visits[idx] = { ...pat.visits[idx], ...updateData };
      saveDb({ ...db, families: { ...db.families, [famId]: fam } });
      showToast("Visit updated.");
    }
  };

  const updatePatient = (famId, patId, data) => {
    const fam = db.families[famId];
    fam.patients[patId] = { ...fam.patients[patId], ...data };
    saveDb({ ...db, families: { ...db.families, [famId]: fam } });
    showToast("Patient record updated.");
  };

  const addDietary = (code, text) => {
    saveDb({ ...db, dietary: { ...db.dietary, [code]: { code, text } } });
    showToast(`Added dietary advice ${code}`);
  };

  const deleteDietary = (code) => {
    const next = { ...db.dietary };
    delete next[code];
    saveDb({ ...db, dietary: next });
    showToast("Deleted dietary advice", "error");
  };

  const executeDelete = () => {
    if (!confirmDelete) return;
    const { type, famId, patId } = confirmDelete;
    const nextDb = { ...db, families: { ...db.families } };

    if (type === "family") {
      delete nextDb.families[famId];
      saveDb(nextDb);
      if (selection.familyId === famId) setSelection({ familyId: null, patientId: null });
      showToast(`Deleted Family ${famId}`, "error");
    } else if (type === "patient") {
      const fam = { ...nextDb.families[famId], patients: { ...nextDb.families[famId].patients } };
      delete fam.patients[patId];
      nextDb.families[famId] = fam;
      saveDb(nextDb);
      if (selection.patientId === patId) setSelection({ ...selection, patientId: Object.keys(fam.patients)[0] || null });
      showToast(`Deleted Patient ${patId}`, "error");
    }
    setConfirmDelete(null);
  };

  const deleteFamily = (famId) => setConfirmDelete({ type: "family", famId });
  const deletePatient = (famId, patId) => setConfirmDelete({ type: "patient", famId, patId });

  if (!db) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>Loading Clinic DB...</div>;

  return (
    <div className={`cms-root ${theme}`} style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <GlobalStyle />
      <Sidebar view={view} setView={setView} isOpen={sidebarOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <TopBar query={topQuery} setQuery={setTopQuery} onSearchSubmit={handleGlobalSearch} db={db} toggleSidebar={() => setSidebarOpen(s => !s)} theme={theme} setTheme={(t) => { setTheme(t); localStorage.setItem("clinic_theme", t); }} doctorProfile={doctorProfile} onLogout={onLogout} onUpdateDoctorProfile={onUpdateDoctorProfile} />

        <div className="cms-scrollbar" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {view === "dashboard" && <Dashboard db={db} goToPatient={(famId, patId) => { setSelection({ familyId: famId, patientId: patId }); setView("case"); }} />}
          {view === "register" && (
            <RegisterView
              db={db} tab={regTab} setTab={setRegTab}
              onCreateFamily={createFamily} onAddMember={addMember}
              onAddDietary={addDietary} onDeleteDietary={deleteDietary}
              goToPatient={(famId, patId) => { setSelection({ familyId: famId, patientId: patId }); setView("case"); }}
              onDeleteFamily={deleteFamily} onDeletePatient={deletePatient}
            />
          )}
          {view === "case" && (
            <CaseEntryView
              db={db} selection={selection} setSelection={setSelection}
              onAddVisit={addVisit} onUpdateVisit={updateVisit} onUpdatePatient={updatePatient}
              onOpenPrint={(f, p, v) => setPrintData({ pat: p, visit: v })}
              actionsRef={actionsRef}
              onDeletePatient={deletePatient}
            />
          )}
          {view === "reports" && <ReportsView db={db} />}
        </div>

        <StatusBar view={view} />
      </div>

      <Toast toast={toast} />

      {printData && (
        <PrescriptionPrintModal data={printData} dietary={db.dietary} onClose={() => setPrintData(null)} />
      )}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="cms-card" style={{ width: 400, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div className="font-display" style={{ fontWeight: 800, fontSize: 18, color: "var(--danger)", marginBottom: 12 }}>Confirm Deletion</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              {confirmDelete.type === "family"
                ? `Are you absolutely sure you want to permanently delete Family ID ${confirmDelete.famId}? This will erase all associated members and visit histories forever.`
                : `Are you sure you want to permanently delete Patient ID ${confirmDelete.patId}? This will erase all of their visit histories forever.`
              }
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" className="cms-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button type="button" className="cms-btn-danger" onClick={executeDelete} style={{ padding: "9px 16px", borderRadius: 10 }}>Yes, Delete Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
