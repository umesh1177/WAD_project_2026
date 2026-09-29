import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Check, Trash2, Printer, Save, Edit3, FileText } from "lucide-react";
import { todayISO, nowTime, fmtDate, fmtMoney, searchFamilies } from "./helpers";
import { useSuggestions, Datalists, AutocompleteInput } from "./components";
import LabReportModal from "./LabReportModal";

const BLANK_ROW = () => ({ date: todayISO(), time: nowTime(), bp: "", sugar: "", other: "", reference: "", investigation: "", complaint: "", labReports: {}, charge: "", received: "" });

/* ---- Visit Detail Popup ---- */
function VisitDetailModal({ visit, family, patient, onClose, onEdit, onOpenPrint }) {
    if (!visit) return null;
    const v = visit;
    return (
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 640, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Visit Detail &mdash; Case {v.caseId}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="cms-btn-ghost" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => onEdit(v)}><Edit3 size={13} />Edit</button>
                        <button className="cms-btn-primary" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => onOpenPrint(family, patient, v)}><Printer size={13} />Print</button>
                        <button className="cms-btn-ghost" style={{ padding: "6px 8px" }} onClick={onClose}><X size={14} /></button>
                    </div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div><span className="cms-label">Date & Time</span><div className="font-mono" style={{ fontSize: 14 }}>{fmtDate(v.date)} {v.time}</div></div>
                        <div><span className="cms-label">BP</span><div style={{ fontSize: 14 }}>{v.bp || "—"}</div></div>
                        <div><span className="cms-label">Sugar</span><div style={{ fontSize: 14 }}>{v.sugar || "—"}</div></div>
                        <div><span className="cms-label">Other</span><div style={{ fontSize: 14 }}>{v.other || "—"}</div></div>
                        <div><span className="cms-label">Reference</span><div style={{ fontSize: 14 }}>{v.reference || "—"}</div></div>
                        <div><span className="cms-label">Investigation</span><div style={{ fontSize: 14, fontWeight: 600 }}>{v.investigation || "—"}</div></div>
                        <div style={{ gridColumn: "1 / -1" }}><span className="cms-label">Complaint</span><div style={{ fontSize: 14, fontWeight: 600 }}>{v.complaint || "—"}</div></div>
                    </div>
                    {(v.treatment || []).length > 0 && (
                        <div>
                            <div className="cms-label">Treatment (given at clinic)</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {v.treatment.map((t, i) => <div key={i} style={{ fontSize: 13, padding: "5px 10px", background: "var(--surface-alt)", borderRadius: 8 }}>{t.name} <span className="font-mono" style={{ color: "var(--text-muted)" }}>× {t.qty}</span></div>)}
                            </div>
                        </div>
                    )}
                    {(v.prescription || []).length > 0 && (
                        <div>
                            <div className="cms-label">Prescription (from medical store)</div>
                            <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead><tr><th>Medicine</th><th>Qty</th><th>Mor</th><th>Noon</th><th>Eve</th><th>Ngt</th></tr></thead>
                                <tbody>
                                    {v.prescription.map((p, i) => (
                                        <tr key={i}><td>{p.name}</td><td className="font-mono">{p.qty}</td><td className="font-mono">{p.mor || "-"}</td><td className="font-mono">{p.noon || "-"}</td><td className="font-mono">{p.eve || "-"}</td><td className="font-mono">{p.ngt || "-"}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---- Edit Visit Modal ---- */
function EditVisitModal({ visit, onSave, onClose, suggestions }) {
    const [row, setRow] = useState({ ...visit });
    const [treatment, setTreatment] = useState([...(visit.treatment || [])]);
    const [prescription, setPrescription] = useState([...(visit.prescription || [])]);
    const due = Math.max(0, (Number(row.charge) || 0) - (Number(row.received) || 0));

    const updateItem = (list, setList, idx, field, val) => { const next = [...list]; next[idx] = { ...next[idx], [field]: val }; setList(next); };
    const save = () => { onSave({ ...row, treatment: treatment.filter(t => t.name.trim()), prescription: prescription.filter(p => p.name.trim()), charge: Number(row.charge) || 0, received: Number(row.received) || 0, due }); };

    return (
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 720, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Edit Visit &mdash; Case {visit.caseId}</div>
                    <button className="cms-btn-ghost" style={{ padding: "6px 8px" }} onClick={onClose}><X size={14} /></button>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto" }}>
                    <Datalists s={suggestions} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div><label className="cms-label">Date</label><input type="date" className="cms-input" value={row.date} onChange={(e) => setRow({ ...row, date: e.target.value })} /></div>
                        <div><label className="cms-label">BP</label><AutocompleteInput className="cms-input" options={suggestions.bp} value={row.bp} onChange={(e) => setRow({ ...row, bp: e.target.value })} placeholder="120/80" /></div>
                        <div><label className="cms-label">Sugar</label><input className="cms-input" value={row.sugar} onChange={(e) => setRow({ ...row, sugar: e.target.value })} /></div>
                        <div><label className="cms-label">Other</label><input className="cms-input" value={row.other} onChange={(e) => setRow({ ...row, other: e.target.value })} /></div>
                        <div><label className="cms-label">Reference</label><input className="cms-input" value={row.reference} onChange={(e) => setRow({ ...row, reference: e.target.value })} /></div>
                        <div><label className="cms-label">Investigation</label><input className="cms-input" value={row.investigation} onChange={(e) => setRow({ ...row, investigation: e.target.value })} /></div>
                        <div><label className="cms-label">Complaint</label><AutocompleteInput className="cms-input" multi={true} options={suggestions.complaint} value={row.complaint} onChange={(e) => setRow({ ...row, complaint: e.target.value })} /></div>
                    </div>
                    {/* Treatment */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label className="cms-label" style={{ margin: 0 }}>Treatment (clinic)</label>
                            <button type="button" className="cms-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setTreatment([...treatment, { name: "", qty: "" }])}><Plus size={13} />Row</button>
                        </div>
                        {treatment.map((r, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                <AutocompleteInput className="cms-input" options={suggestions.treatmentNames} placeholder="Item name" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(treatment, setTreatment, idx, "name", e.target.value)} />
                                <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(treatment, setTreatment, idx, "qty", e.target.value)} />
                                <button type="button" className="cms-btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setTreatment(treatment.filter((_, i) => i !== idx))}><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                    {/* Prescription */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label className="cms-label" style={{ margin: 0 }}>Prescription (medical store)</label>
                            <button type="button" className="cms-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setPrescription([...prescription, { name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" }])}><Plus size={13} />Row</button>
                        </div>
                        <div style={{ display: "flex", gap: 8, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", paddingLeft: 2, marginBottom: 4 }}>
                            <div style={{ flex: 3 }}>MEDICINE</div><div style={{ flex: 1 }}>QTY</div><div style={{ flex: 1, textAlign: "center" }}>MOR</div><div style={{ flex: 1, textAlign: "center" }}>NOON</div><div style={{ flex: 1, textAlign: "center" }}>EVE</div><div style={{ flex: 1, textAlign: "center" }}>NGT</div><div style={{ width: 30 }} />
                        </div>
                        {prescription.map((r, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                <AutocompleteInput className="cms-input" options={suggestions.prescriptionNames} placeholder="Medicine" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(prescription, setPrescription, idx, "name", e.target.value)} />
                                <input className="cms-input" placeholder="5" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(prescription, setPrescription, idx, "qty", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.mor} onChange={(e) => updateItem(prescription, setPrescription, idx, "mor", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.noon} onChange={(e) => updateItem(prescription, setPrescription, idx, "noon", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.eve} onChange={(e) => updateItem(prescription, setPrescription, idx, "eve", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.ngt} onChange={(e) => updateItem(prescription, setPrescription, idx, "ngt", e.target.value)} />
                                <div style={{ display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--border)", padding: "0 8px", borderRadius: 6, background: "var(--surface)" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                                        <input type="radio" name={`edit-timing-${idx}`} value="BF" checked={r.timing === "BF"} onChange={(e) => updateItem(prescription, setPrescription, idx, "timing", e.target.value)} style={{ margin: 0 }} />
                                        BF
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                                        <input type="radio" name={`edit-timing-${idx}`} value="AF" checked={r.timing === "AF"} onChange={(e) => updateItem(prescription, setPrescription, idx, "timing", e.target.value)} style={{ margin: 0 }} />
                                        AF
                                    </label>
                                </div>
                                <button type="button" className="cms-btn-ghost" style={{ width: 30, color: "var(--danger)" }} onClick={() => setPrescription(prescription.filter((_, i) => i !== idx))}><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "10px 14px", borderRadius: 10, background: "var(--surface-alt)", marginTop: 8 }}>
                        <div><span className="cms-label">Charge</span><input className="cms-input" value={row.charge || ""} onChange={(e) => setRow({ ...row, charge: e.target.value })} /></div>
                        <div><span className="cms-label">Received</span><input className="cms-input" value={row.received || ""} onChange={(e) => setRow({ ...row, received: e.target.value })} /></div>
                        <div><span className="cms-label">Due</span><div className="font-mono" style={{ fontSize: 16, fontWeight: 700, paddingTop: 8, color: due > 0 ? "var(--danger)" : "var(--primary-dark)" }}>{fmtMoney(due)}</div></div>
                    </div>
                </div>
                <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button className="cms-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="cms-btn-primary" onClick={save}><Save size={14} />Save Changes</button>
                </div>
            </div>
        </div>
    );
}

/* ---- Edit Patient Modal ---- */
function EditPatientModal({ patient, onSave, onClose }) {
    const [form, setForm] = useState({ name: patient.name, relation: patient.relation, age: patient.age, bloodGroup: patient.bloodGroup, allergy: patient.allergy });
    return (
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 480, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Edit Patient &mdash; ID {patient.id}</div>
                    <button className="cms-btn-ghost" style={{ padding: "6px 8px" }} onClick={onClose}><X size={14} /></button>
                </div>
                <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ gridColumn: "1 / -1" }}><label className="cms-label">Name</label><input className="cms-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label className="cms-label">Relation</label><AutocompleteInput className="cms-input" options={suggestions.relation} value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} /></div>
                    <div><label className="cms-label">Age</label><input className="cms-input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                    <div><label className="cms-label">Blood Group</label><AutocompleteInput className="cms-input" options={suggestions.bloodGroup} value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div>
                    <div><label className="cms-label">Allergy</label><AutocompleteInput className="cms-input" options={suggestions.allergy} value={form.allergy} onChange={(e) => setForm({ ...form, allergy: e.target.value })} /></div>
                </div>
                <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button className="cms-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="cms-btn-primary" onClick={() => onSave(form)}><Save size={14} />Save</button>
                </div>
            </div>
        </div>
    );
}

/* ---- Family Dues Modal ---- */
function FamilyDuesModal({ family, onClose, onSelectPatient }) {
    const dueList = Object.values(family.patients).map(p => {
        const due = p.visits.reduce((acc, v) => acc + Math.max(0, (Number(v.charge) || 0) - (Number(v.received) || 0)), 0);
        return { ...p, due };
    }).filter(p => p.due > 0);

    return (
        <div className="cms-overlay" onClick={onClose} style={{ zIndex: 400 }}>
            <div className="cms-modal" style={{ width: 500, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Family Due Summary</div>
                    <button className="cms-btn-ghost" onClick={onClose} style={{ padding: "6px 8px" }}><X size={14} /></button>
                </div>
                <div style={{ padding: 18, maxHeight: "60vh", overflowY: "auto" }}>
                    {dueList.length === 0 ? (
                        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>No dues found for any family member.</div>
                    ) : (
                        <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Patient Name</th>
                                    <th style={{ textAlign: "left" }}>Relation</th>
                                    <th style={{ textAlign: "right" }}>Pending Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dueList.map(p => (
                                    <tr key={p.id} className="cms-clickable" onClick={() => { onSelectPatient(p.id); onClose(); }}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td>{p.relation || "Member"}</td>
                                        <td className="font-mono" style={{ textAlign: "right", color: "var(--danger)", fontWeight: 700 }}>₹{p.due}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---- Main Case Entry View ---- */
export default function CaseEntryView({ db, selection, setSelection, onAddVisit, onUpdateVisit, onUpdatePatient, onOpenPrint, actionsRef, onDeletePatient }) {
    const suggestions = useSuggestions(db);
    const [famQuery, setFamQuery] = useState("");
    const [activeLabReportVisit, setActiveLabReportVisit] = useState(null);
    const [famHighlight, setFamHighlight] = useState(0);
    const [showFamilyDues, setShowFamilyDues] = useState(false);
    const [entryOpen, setEntryOpen] = useState(false);
    const [row, setRow] = useState(BLANK_ROW());
    const [treatment, setTreatment] = useState([{ name: "", qty: "" }]);
    const [prescription, setPrescription] = useState([{ name: "", qty: "", mor: "", noon: "", eve: "", ngt: "", timing: "" }]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [editingVisit, setEditingVisit] = useState(null);
    const [editingPatient, setEditingPatient] = useState(false);
    const [showDeletes, setShowDeletes] = useState(false);

    let results = [];
    if (famQuery.trim()) {
        const q = famQuery.trim().toLowerCase();
        for (const fam of Object.values(db.families)) {
            for (const pat of Object.values(fam.patients)) {
                if (pat.name.toLowerCase().includes(q) || pat.id.toLowerCase().includes(q) || fam.headName.toLowerCase().includes(q) || fam.id.toLowerCase().includes(q) || (fam.area || "").toLowerCase().includes(q)) {
                    results.push({ family: fam, patient: pat });
                }
            }
        }
        results = results.slice(0, 10);
    }
    const family = selection.familyId ? db.families[selection.familyId] : null;
    const patient = family && selection.patientId ? family.patients[selection.patientId] : null;

    const openEntry = useCallback(() => {
        setRow(BLANK_ROW());
        setTreatment([{ name: "", qty: "" }]);
        setPrescription([{ name: "", qty: "", mor: "", noon: "", eve: "", ngt: "", timing: "" }]);
        setEntryOpen(true);
    }, []);

    const addPastTreatment = (t) => {
        if (!entryOpen) return;
        const current = treatment.filter(x => x.name.trim() || x.qty.trim());
        current.push({ ...t });
        current.push({ name: "", qty: "" });
        setTreatment(current);
    };

    const addPastPrescription = (p) => {
        if (!entryOpen) return;
        const current = prescription.filter(x => x.name.trim());
        current.push({ ...p });
        current.push({ name: "", qty: "", mor: "", noon: "", eve: "", ngt: "", timing: "" });
        setPrescription(current);
    };

    useEffect(() => {
        if (!actionsRef) return;
        actionsRef.current.newVisit = patient ? openEntry : null;
        actionsRef.current.print = patient && patient.visits.length > 0 ? () => onOpenPrint(family, patient, patient.visits[patient.visits.length - 1]) : null;
        return () => { actionsRef.current.newVisit = null; actionsRef.current.print = null; };
    }, [actionsRef, patient, family, onOpenPrint, openEntry]);

    useEffect(() => { setEntryOpen(false); setSelectedVisit(null); }, [selection.patientId]);

    const pickResult = (res) => {
        setSelection({ familyId: res.family.id, patientId: res.patient.id });
        setFamQuery(""); setFamHighlight(0);
    };

    const handleFamKeyDown = (e) => {
        if (results.length === 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setFamHighlight((h) => Math.min(h + 1, results.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setFamHighlight((h) => Math.max(h - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); pickResult(results[famHighlight]); }
        else if (e.key === "Escape") { setFamQuery(""); }
    };

    const updateItem = (list, setList, idx, field, val) => { const next = [...list]; next[idx] = { ...next[idx], [field]: val }; setList(next); };

    const newRowDue = Math.max(0, (Number(row.charge) || 0) - (Number(row.received) || 0));
    const saveEntry = () => {
        const createdVisit = onAddVisit(family.id, patient.id, {
            ...row,
            treatment: treatment.filter((t) => t.name.trim()),
            prescription: prescription.filter((p) => p.name.trim()),
            charge: Number(row.charge) || 0,
            received: Number(row.received) || 0,
            due: newRowDue
        });
        setEntryOpen(false);
        if (createdVisit) {
            onOpenPrint(family, patient, createdVisit);
        }
    };

    const handleSaveEditVisit = (updated) => {
        onUpdateVisit(selection.familyId, selection.patientId, editingVisit.id, updated);
        setEditingVisit(null);
        setSelectedVisit(null);
    };

    const handleSaveEditPatient = (form) => {
        onUpdatePatient(selection.familyId, selection.patientId, form);
        setEditingPatient(false);
    };

    return (
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <Datalists s={suggestions} />
            {/* Family search */}
            <div className="cms-card" style={{ padding: "10px 16px" }}>
                <label className="cms-label">Find Patient by Name or Patient ID</label>
                <div style={{ position: "relative" }}>
                    <input id="cms-case-search" className="cms-input" value={famQuery} onChange={(e) => { setFamQuery(e.target.value); setFamHighlight(0); }} onKeyDown={handleFamKeyDown} placeholder="Type patient name, ID, or family head name..." />
                    {results.length > 0 && (
                        <div className="cms-card" style={{ position: "absolute", top: 42, left: 0, right: 0, zIndex: 20, maxHeight: 250, overflowY: "auto" }}>
                            {results.map((res, i) => (
                                <div key={res.patient.id} onClick={() => pickResult(res)} onMouseEnter={() => setFamHighlight(i)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border)", background: i === famHighlight ? "var(--surface-alt)" : "transparent" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                        <b style={{ fontSize: 13.5 }}>{res.patient.name}</b>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {res.patient.allergy && <span className="cms-pill cms-badge-due" style={{ fontSize: 10, background: "var(--danger)", color: "white" }}>ALLERGY: {res.patient.allergy}</span>}
                                            {res.patient.visits.reduce((acc, v) => acc + Math.max(0, (Number(v.charge) || 0) - (Number(v.received) || 0)), 0) > 0 && (
                                                <span className="cms-pill cms-badge-due" style={{ fontSize: 10 }}>DUE: ₹{res.patient.visits.reduce((acc, v) => acc + Math.max(0, (Number(v.charge) || 0) - (Number(v.received) || 0)), 0)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Family: {res.family.headName} &middot; {res.family.area || "—"}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!family && <div className="cms-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Search and select a family above to begin.</div>}

            {family && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Patient record area */}
                    {!patient ? (
                        <div className="cms-card" style={{ flex: 1, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No members in this family. Go to Family Reg. (F1) to add members.</div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                            {/* Patient header with edit button */}
                            <div className="cms-card" style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)", borderLeft: "4px solid var(--primary)", boxShadow: "0 2px 8px rgba(17,103,177,0.15)" }}>
                                <div>
                                    <div className="font-display" style={{ fontWeight: 900, fontSize: 19, display: "flex", alignItems: "center", gap: 10, color: "var(--primary-dark)" }}>
                                        {patient.name}
                                        {patient.allergy && <span className="cms-pill" style={{ fontSize: 11, background: "var(--danger)", color: "white", padding: "4px 8px" }}>ALLERGY: {patient.allergy}</span>}
                                        {patient.visits.reduce((acc, v) => acc + Math.max(0, (Number(v.charge) || 0) - (Number(v.received) || 0)), 0) > 0 && (
                                            <span className="cms-pill" style={{ fontSize: 11, background: "var(--danger)", color: "white", padding: "4px 8px" }}>
                                                TOTAL DUE: ₹{patient.visits.reduce((acc, v) => acc + Math.max(0, (Number(v.charge) || 0) - (Number(v.received) || 0)), 0)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center" }}>
                                        <strong style={{ color: "var(--text)" }}>Family: {family.headName} </strong>
                                        <span style={{ marginLeft: 4 }}>({family.area || "No Area"})</span>
                                        {(() => {
                                            const totalFamDue = Object.values(family.patients).reduce((t, p) => t + p.visits.reduce((acc, v) => acc + Math.max(0, (Number(v.charge) || 0) - (Number(v.received) || 0)), 0), 0);
                                            return totalFamDue > 0 ? (
                                                <button className="cms-pill cms-badge-due" style={{ marginLeft: 8, fontSize: 10, cursor: "pointer", border: "none", padding: "2px 6px" }} onClick={() => setShowFamilyDues(true)}>FAM DUE: ₹{totalFamDue}</button>
                                            ) : null;
                                        })()}
                                        <span style={{ margin: "0 8px" }}>·</span>
                                        {patient.relation || "Head"}
                                        {patient.age ? ` · Age ${patient.age}` : ""}{patient.bloodGroup ? ` · ${patient.bloodGroup}` : ""}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button className="cms-btn-danger" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => onDeletePatient(selection.familyId, selection.patientId)}><Trash2 size={13} />Delete Patient</button>
                                    <button className="cms-btn-ghost" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => setEditingPatient(true)}><Edit3 size={13} />Edit Patient</button>
                                    {!entryOpen && <button className="cms-btn-primary" onClick={openEntry}><Plus size={14} />New Visit<span className="cms-kbd" style={{ marginLeft: 4 }}>F6</span></button>}
                                </div>
                            </div>

                            {/* Visit history table — no charge/received/due columns */}
                            {/* Visit history table */}
                            <div className="cms-card" style={{ padding: "12px 16px" }}>
                                <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>
                                    Visit History ({patient.visits.length})
                                    {entryOpen && <span style={{ fontWeight: 500, fontSize: 12, color: "var(--text-muted)" }}> — enter new visit in the highlighted row</span>}
                                </div>
                                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                                    {entryOpen && (
                                        <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
                                            <thead>
                                                <tr><th style={{ width: 110 }}>Date &amp; Time</th><th style={{ width: 70 }}>BP</th><th style={{ width: 65 }}>Sugar</th><th style={{ width: 65 }}>Other</th><th style={{ width: 90 }}>Reference</th><th>Investigation</th><th>Complaint</th><th style={{ width: 40 }}></th></tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ background: "var(--surface)", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}>
                                                    <td><input type="date" className="cms-input-sm" style={{ width: 105, padding: "4px 2px", fontSize: 11 }} value={row.date} onChange={(e) => setRow({ ...row, date: e.target.value })} /></td>
                                                    <td><AutocompleteInput className="cms-input-sm" options={suggestions.bp} value={row.bp} onChange={(e) => setRow({ ...row, bp: e.target.value })} placeholder="120/80" /></td>
                                                    <td><input className="cms-input-sm" style={{ width: "100%" }} value={row.sugar} onChange={(e) => setRow({ ...row, sugar: e.target.value })} /></td>
                                                    <td><input className="cms-input-sm" style={{ width: "100%" }} value={row.other} onChange={(e) => setRow({ ...row, other: e.target.value })} /></td>
                                                    <td><input className="cms-input-sm" style={{ width: "100%" }} value={row.reference} onChange={(e) => setRow({ ...row, reference: e.target.value })} /></td>
                                                    <td><input className="cms-input-sm" style={{ width: "100%" }} value={row.investigation} onChange={(e) => setRow({ ...row, investigation: e.target.value })} /></td>
                                                    <td><AutocompleteInput className="cms-input-sm" multi={true} options={suggestions.complaint} value={row.complaint} onChange={(e) => setRow({ ...row, complaint: e.target.value })} /></td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <button
                                                            type="button"
                                                            className={row.labReports && Object.keys(row.labReports).length > 0 ? "cms-btn-primary" : "cms-btn-ghost"}
                                                            style={{ padding: "6px" }}
                                                            onClick={() => setActiveLabReportVisit("new")}
                                                            title="Lab Reports"
                                                        >
                                                            <FileText size={16} color={row.labReports && Object.keys(row.labReports).length > 0 ? "white" : "var(--primary)"} />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {/* Treatment & Prescription entry below the row */}
                                                <tr className="cms-entry-row">
                                                    <td colSpan={8} style={{ padding: "10px 14px", borderBottom: "2px solid var(--border)" }}>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

                                                            {/* Treatment Section */}
                                                            <div onFocus={() => setShowDeletes(false)}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                                    <span className="cms-label" style={{ margin: 0, fontSize: 11 }}>Treatment (clinic)</span>
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    {treatment.map((r, idx) => {
                                                                        const isLast = idx === treatment.length - 1;
                                                                        return (
                                                                            <div key={idx} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                                                                <AutocompleteInput className="cms-input-sm" options={suggestions.treatmentNames} placeholder="Item" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(treatment, setTreatment, idx, "name", e.target.value)} />
                                                                                <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(treatment, setTreatment, idx, "qty", e.target.value)} />
                                                                                {isLast && !showDeletes ? (
                                                                                    <button type="button" className="cms-btn-ghost" style={{ padding: "4px 8px" }} onClick={() => setTreatment([...treatment, { name: "", qty: "" }])}><Plus size={14} /></button>
                                                                                ) : (
                                                                                    showDeletes && (treatment.length > 1 || r.name || r.qty) && <button type="button" className="cms-btn-ghost" style={{ color: "var(--danger)", padding: "4px" }} onMouseDown={(e) => { e.preventDefault(); if (window.confirm("Delete this treatment row?")) setTreatment(treatment.filter((_, i) => i !== idx)); }}><X size={14} /></button>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Prescription Section */}
                                                            <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 12 }} onFocus={() => setShowDeletes(false)}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                                    <span className="cms-label" style={{ margin: 0, fontSize: 11 }}>Prescription (medical store)</span>
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    {prescription.map((r, idx) => {
                                                                        const isLast = idx === prescription.length - 1;
                                                                        return (
                                                                            <div key={idx} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                                                                <AutocompleteInput className="cms-input-sm" options={suggestions.prescriptionNames} placeholder="Medicine" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(prescription, setPrescription, idx, "name", e.target.value)} />
                                                                                <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(prescription, setPrescription, idx, "qty", e.target.value)} />
                                                                                <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="M" value={r.mor} onChange={(e) => updateItem(prescription, setPrescription, idx, "mor", e.target.value)} />
                                                                                <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="N" value={r.noon} onChange={(e) => updateItem(prescription, setPrescription, idx, "noon", e.target.value)} />
                                                                                <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="E" value={r.eve} onChange={(e) => updateItem(prescription, setPrescription, idx, "eve", e.target.value)} />
                                                                                <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="Ng" value={r.ngt} onChange={(e) => updateItem(prescription, setPrescription, idx, "ngt", e.target.value)} />
                                                                                <div style={{ display: "flex", gap: 6, alignItems: "center", border: "1px solid var(--border)", padding: "0 6px", borderRadius: 6, background: "var(--surface)" }}>
                                                                                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                                                                                        <input type="radio" name={`new-timing-${idx}`} value="BF" checked={r.timing === "BF"} onChange={(e) => updateItem(prescription, setPrescription, idx, "timing", e.target.value)} style={{ margin: 0 }} />
                                                                                        BF
                                                                                    </label>
                                                                                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                                                                                        <input type="radio" name={`new-timing-${idx}`} value="AF" checked={r.timing === "AF"} onChange={(e) => updateItem(prescription, setPrescription, idx, "timing", e.target.value)} style={{ margin: 0 }} />
                                                                                        AF
                                                                                    </label>
                                                                                </div>
                                                                                {isLast && !showDeletes ? (
                                                                                    <button type="button" className="cms-btn-ghost" style={{ padding: "4px 8px" }} onClick={() => setPrescription([...prescription, { name: "", qty: "", mor: "", noon: "", eve: "", ngt: "", timing: "" }])}><Plus size={14} /></button>
                                                                                ) : (
                                                                                    showDeletes && (prescription.length > 1 || r.name || r.qty) && <button type="button" className="cms-btn-ghost" style={{ color: "var(--danger)", padding: "4px" }} onMouseDown={(e) => { e.preventDefault(); if (window.confirm("Delete this prescription row?")) setPrescription(prescription.filter((_, i) => i !== idx)); }}><X size={14} /></button>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Footer (Charge and Buttons) */}
                                                            <div onFocus={() => setShowDeletes(true)} style={{ borderTop: "1px dashed var(--border)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                    <div><label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Charge</label><input className="cms-input-sm" style={{ width: 80 }} value={row.charge} onChange={(e) => setRow({ ...row, charge: e.target.value })} /></div>
                                                                    <div><label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Received</label><input className="cms-input-sm" style={{ width: 80 }} value={row.received} onChange={(e) => setRow({ ...row, received: e.target.value })} /></div>
                                                                    <div><label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Due</label><div className="font-mono" style={{ fontWeight: 700, fontSize: 16, color: newRowDue > 0 ? "var(--danger)" : "var(--primary-dark)" }}>{fmtMoney(newRowDue)}</div></div>
                                                                </div>
                                                                <div style={{ display: "flex", gap: 12 }}>
                                                                    <button className="cms-btn-ghost" onClick={() => setEntryOpen(false)}>Cancel</button>
                                                                    <button className="cms-btn-primary" onClick={saveEntry}><Printer size={14} />Save &amp; Print</button>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Existing visits — Card Layout */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {[...patient.visits].reverse().map((v) => (
                                            <div key={v.id} onClick={() => setSelectedVisit(v)} style={{ border: "1px solid var(--border)", borderRadius: 8, background: "white", padding: 8, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

                                                {/* Header & Lab Reports */}
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        <div className="font-mono" style={{ fontSize: 13, fontWeight: "bold", color: "var(--primary-dark)" }}>{fmtDate(v.date)}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface)", padding: "2px 8px", borderRadius: 12 }}>{v.time}</div>
                                                    </div>
                                                    <button
                                                        className={v.labReports && Object.keys(v.labReports).length > 0 ? "cms-btn-primary" : "cms-btn-ghost"}
                                                        style={{ padding: "2px 4px" }}
                                                        onClick={(e) => { e.stopPropagation(); setActiveLabReportVisit(v.id); }}
                                                        title="Lab Reports"
                                                    >
                                                        <FileText size={14} color={v.labReports && Object.keys(v.labReports).length > 0 ? "white" : "var(--primary)"} />
                                                    </button>
                                                </div>

                                                {/* Vitals & Texts row */}
                                                <div style={{ display: "flex", gap: "10px 16px", fontSize: 12, borderBottom: "1px dashed #eee", paddingBottom: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, background: "var(--pill-bp-bg)", border: "1px solid var(--pill-bp-bd)", padding: "3px 8px", borderRadius: 6, color: "var(--pill-bp-tx)" }}><span style={{ fontSize: 11, fontWeight: 900 }}>BP:</span> <span style={{ fontWeight: 700, color: "var(--text)" }}>{v.bp || "-"}</span></div>
                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, background: "var(--pill-su-bg)", border: "1px solid var(--pill-su-bd)", padding: "3px 8px", borderRadius: 6, color: "var(--pill-su-tx)" }}><span style={{ fontSize: 11, fontWeight: 900 }}>Sugar:</span> <span style={{ fontWeight: 700, color: "var(--text)" }}>{v.sugar || "-"}</span></div>
                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, background: "var(--pill-ot-bg)", border: "1px solid var(--pill-ot-bd)", padding: "3px 8px", borderRadius: 6, color: "var(--pill-ot-tx)" }}><span style={{ fontSize: 11, fontWeight: 900 }}>Other:</span> <span style={{ fontWeight: 700, color: "var(--text)" }}>{v.other || "-"}</span></div>
                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, background: "var(--pill-rf-bg)", border: "1px solid var(--pill-rf-bd)", padding: "3px 8px", borderRadius: 6, color: "var(--pill-rf-tx)" }}><span style={{ fontSize: 11, fontWeight: 900 }}>Ref:</span> <span style={{ fontWeight: 700, color: "var(--text)" }}>{v.reference || "-"}</span></div>

                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flex: 1, minWidth: 150, background: "var(--pill-in-bg)", border: "1px solid var(--pill-in-bd)", padding: "3px 8px", borderRadius: 6, color: "var(--pill-in-tx)" }}><span style={{ fontSize: 11, fontWeight: 900 }}>Investigation:</span> <span style={{ fontWeight: 600, whiteSpace: "pre-wrap", color: "var(--text)" }}>{v.investigation || "-"}</span></div>
                                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flex: 1, minWidth: 150, background: "var(--pill-co-bg)", border: "1px solid var(--pill-co-bd)", padding: "3px 8px", borderRadius: 6, color: "var(--pill-co-tx)" }}><span style={{ fontSize: 11, fontWeight: 900 }}>Complaint:</span> <span style={{ fontWeight: 600, whiteSpace: "pre-wrap", color: "var(--text)" }}>{v.complaint || "-"}</span></div>
                                                </div>

                                                {/* Badges Box (Treatment & Rx) */}
                                                {(v.treatment?.length > 0 || v.prescription?.length > 0) && (
                                                    <div style={{ display: "flex", gap: 12 }}>
                                                        {(!v.treatment?.length && !v.prescription?.length) && <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 11 }}>No Treatment or Medicine recorded.</span>}

                                                        {v.treatment && v.treatment.length > 0 && (
                                                            <div style={{ flex: 1, background: "var(--pill-tr-bg)", border: "1px solid var(--pill-tr-bd)", padding: "6px 10px", borderRadius: 6, color: "var(--pill-tr-tx)" }}>
                                                                <strong style={{ fontSize: 11, display: "block", marginBottom: 6, fontWeight: 900 }}>Treatment / Clinic:</strong>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    {v.treatment.map((t, idx) => (
                                                                        <div key={idx} onClick={(e) => { e.stopPropagation(); addPastTreatment(t); }} className={entryOpen ? "cms-clickable" : ""} style={{ cursor: entryOpen ? "pointer" : "default", fontSize: 11.5, fontWeight: 600, background: "var(--surface)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", color: "var(--text)" }} title={entryOpen ? "Repeat this treatment" : ""}>
                                                                            {entryOpen && <Plus size={10} color="var(--pill-tr-tx)" style={{ marginRight: 6 }} />}
                                                                            {t.name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {v.prescription && v.prescription.length > 0 && (
                                                            <div style={{ flex: 1.5, background: "var(--pill-pr-bg)", border: "1px solid var(--pill-pr-bd)", padding: "6px 10px", borderRadius: 6, color: "var(--pill-pr-tx)" }}>
                                                                <strong style={{ fontSize: 11, display: "block", marginBottom: 6, fontWeight: 900 }}>Prescription / Medical Store:</strong>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    {v.prescription.map((p, idx) => (
                                                                        <div key={idx} onClick={(e) => { e.stopPropagation(); addPastPrescription(p); }} className={entryOpen ? "cms-clickable" : ""} style={{ cursor: entryOpen ? "pointer" : "default", fontSize: 11.5, fontWeight: 600, background: "var(--surface)", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", color: "var(--text)" }} title={entryOpen ? "Repeat this medicine" : ""}>
                                                                            {entryOpen && <Plus size={10} color="var(--pill-pr-tx)" style={{ marginRight: 6 }} />}
                                                                            {p.name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {patient.visits.length === 0 && !entryOpen && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No visits yet.</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {selectedVisit && !editingVisit && (
                <VisitDetailModal visit={selectedVisit} family={family} patient={patient} onClose={() => setSelectedVisit(null)} onEdit={(v) => setEditingVisit(v)} onOpenPrint={onOpenPrint} />
            )}
            {editingVisit && (
                <EditVisitModal visit={editingVisit} onSave={handleSaveEditVisit} onClose={() => setEditingVisit(null)} suggestions={suggestions} />
            )}
            {editingPatient && patient && (
                <EditPatientModal patient={patient} onSave={handleSaveEditPatient} onClose={() => setEditingPatient(false)} />
            )}
            {activeLabReportVisit && (
                <LabReportModal
                    initialData={activeLabReportVisit === "new" ? row.labReports : patient.visits.find(v => v.id === activeLabReportVisit)?.labReports}
                    familyName={family?.headName}
                    patientName={patient?.name}
                    date={activeLabReportVisit === "new" ? row.date : patient.visits.find(v => v.id === activeLabReportVisit)?.date}
                    onClose={() => setActiveLabReportVisit(null)}
                    onSave={(data) => {
                        if (activeLabReportVisit === "new") {
                            setRow({ ...row, labReports: data });
                        } else {
                            onUpdateVisit(selection.familyId, selection.patientId, activeLabReportVisit, { labReports: data });
                        }
                        setActiveLabReportVisit(null);
                    }}
                />
            )}
            {showFamilyDues && family && (
                <FamilyDuesModal family={family} onClose={() => setShowFamilyDues(false)} onSelectPatient={(pId) => setSelection({ familyId: family.id, patientId: pId })} />
            )}
        </div>
    );
}
