import React, { useMemo, useState } from "react";
import { Users, ClipboardList, IndianRupee, AlertCircle, Activity, Calendar } from "lucide-react";
import { todayISO, fmtDate, fmtMoney, allPatientsFlat } from "./helpers";
import { StatCard } from "./components";

export default function Dashboard({ db, goToPatient }) {
    const [dateFilter, setDateFilter] = useState(todayISO());
    const [activeView, setActiveView] = useState("visits"); // "visits" | "families" | "patients" | "dues"

    const rows = useMemo(() => allPatientsFlat(db), [db]);
    const familiesList = Object.values(db.families).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const totalFamilies = familiesList.length;
    const totalPatients = rows.length;

    const allVisits = [];
    rows.forEach(({ fam, pat }) => pat.visits.forEach((v) => allVisits.push({ ...v, famHead: fam.headName, famId: fam.id, patId: pat.id, patName: pat.name, due: Number(v.due) || 0 })));

    const targetVisits = allVisits.filter((v) => v.date === dateFilter);
    const dateCollection = targetVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const totalDue = rows.reduce((s, r) => s + r.totalDue, 0);

    let recent = [...allVisits].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    if (activeView === "visits") recent = recent.filter(v => v.date === dateFilter);

    const duesList = rows.filter((r) => r.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue);

    return (
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={18} color="var(--primary)" />
                    <span className="font-display" style={{ fontWeight: 800, fontSize: 16 }}>Dashboard Filter Date:</span>
                    <input type="date" className="cms-input" style={{ width: 140, padding: "6px 12px", marginLeft: 10 }} value={dateFilter} onChange={e => { setDateFilter(e.target.value); setActiveView("visits"); }} />
                </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div onClick={() => setActiveView("families")} style={{ flex: 1, cursor: "pointer", opacity: activeView === "families" ? 1 : 0.8, border: activeView === "families" ? "2px solid var(--primary)" : "2px solid transparent", borderRadius: 18 }}><StatCard icon={Users} label="Registered Families" value={totalFamilies} /></div>
                <div onClick={() => setActiveView("patients")} style={{ flex: 1, cursor: "pointer", opacity: activeView === "patients" ? 1 : 0.8, border: activeView === "patients" ? "2px solid var(--primary)" : "2px solid transparent", borderRadius: 18 }}><StatCard icon={Activity} label="Total Patients" value={totalPatients} /></div>
                <div onClick={() => setActiveView("visits")} style={{ flex: 1, cursor: "pointer", opacity: activeView === "visits" ? 1 : 0.8, border: activeView === "visits" ? "2px solid var(--accent)" : "2px solid transparent", borderRadius: 18 }}><StatCard icon={ClipboardList} label="Date's Visits" value={targetVisits.length} tone="accent" /></div>
                <div style={{ flex: 1 }}><StatCard icon={IndianRupee} label="Date's Collection" value={fmtMoney(dateCollection)} /></div>
                <div onClick={() => setActiveView("dues")} style={{ flex: 1, cursor: "pointer", opacity: activeView === "dues" ? 1 : 0.8, border: activeView === "dues" ? "2px solid var(--danger)" : "2px solid transparent", borderRadius: 18 }}><StatCard icon={AlertCircle} label="Total Outstanding Dues" value={fmtMoney(totalDue)} tone="danger" /></div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div className="cms-card" style={{ flex: 1.4, padding: 12 }}>

                    {activeView === "visits" && (
                        <>
                            <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Visits on {fmtDate(dateFilter)}</div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead><tr><th>Time</th><th>Case</th><th>Patient</th><th>Complaint</th><th>Diagnosis</th></tr></thead>
                                    <tbody>
                                        {recent.length === 0 && <tr><td colSpan={5} style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No visits recorded for this date.</td></tr>}
                                        {recent.map((v) => (
                                            <tr key={v.id} onClick={() => goToPatient(v.famId, v.patId)} style={{ cursor: "pointer" }} className="cms-clickable">
                                                <td className="font-mono">{v.time}</td>
                                                <td className="font-mono">{v.caseId}</td>
                                                <td>{v.patName}<div style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.famHead}</div></td>
                                                <td>{v.complaint || "-"}</td>
                                                <td>{v.diagnosis || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeView === "families" && (
                        <>
                            <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>All Registered Families</div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead><tr><th>Fam ID</th><th>Head Name</th><th>Area</th><th>Members</th></tr></thead>
                                    <tbody>
                                        {familiesList.map((f) => (
                                            <tr key={f.id} onClick={() => goToPatient(f.id, Object.keys(f.patients)[0])} style={{ cursor: "pointer" }} className="cms-clickable">
                                                <td className="font-mono">{f.id}</td>
                                                <td><b>{f.headName}</b></td>
                                                <td>{f.area || "-"}</td>
                                                <td>{Object.keys(f.patients).length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeView === "patients" && (
                        <>
                            <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>All Patients Data</div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead><tr><th>Pat ID</th><th>Name</th><th>Relation</th><th>Fam ID</th><th>Family Head</th></tr></thead>
                                    <tbody>
                                        {rows.map(({ fam, pat }) => (
                                            <tr key={pat.id} onClick={() => goToPatient(fam.id, pat.id)} style={{ cursor: "pointer" }} className="cms-clickable">
                                                <td className="font-mono">{pat.id}</td>
                                                <td><b>{pat.name}</b></td>
                                                <td>{pat.relation || "-"}</td>
                                                <td className="font-mono">{fam.id}</td>
                                                <td>{fam.headName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeView === "dues" && (
                        <>
                            <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>All Outstanding Dues</div>
                            <div style={{ overflowX: "auto" }}>
                                <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead><tr><th>Patient</th><th>Family Head</th><th>Last Visit</th><th>Pending Due</th></tr></thead>
                                    <tbody>
                                        {duesList.length === 0 && <tr><td colSpan={4} style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>Nobody owes anything right now.</td></tr>}
                                        {duesList.map(({ fam, pat, totalDue, lastVisit }) => (
                                            <tr key={pat.id} onClick={() => goToPatient(fam.id, pat.id)} style={{ cursor: "pointer" }} className="cms-clickable">
                                                <td><b>{pat.name}</b> <span className="font-mono" style={{ fontSize: 11, marginLeft: 6 }}>PT {pat.id}</span></td>
                                                <td>{fam.headName}</td>
                                                <td className="font-mono">{lastVisit ? fmtDate(lastVisit.date) : "-"}</td>
                                                <td className="font-mono" style={{ color: "var(--danger)", fontWeight: "bold" }}>{fmtMoney(totalDue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
                {activeView !== "dues" && (
                    <div className="cms-card" style={{ flex: 1, padding: 12 }}>
                        <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Top Outstanding Dues</div>
                        {duesList.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "10px 0" }}>Nobody owes anything right now.</div>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {duesList.map(({ fam, pat, totalDue }) => (
                                <div key={pat.id} onClick={() => goToPatient(fam.id, pat.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderRadius: 8, background: "var(--surface-alt)", cursor: "pointer" }}>
                                    <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{pat.name}</div><div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{fam.headName} &middot; Fam {fam.id}</div></div>
                                    <span className="cms-pill cms-badge-due">{fmtMoney(totalDue)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
