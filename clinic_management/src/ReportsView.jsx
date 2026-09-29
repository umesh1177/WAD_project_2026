import React, { useState, useMemo } from "react";
import { CalendarDays, FileText } from "lucide-react";
import { todayISO, fmtDate, fmtMoney, allPatientsFlat } from "./helpers";

export default function ReportsView({ db }) {
    const [tab, setTab] = useState("daily");
    const [date, setDate] = useState(todayISO());
    const [month, setMonth] = useState(todayISO().slice(0, 7));
    const [searchPat, setSearchPat] = useState("");
    const [certPat, setCertPat] = useState("");
    const [certDiag, setCertDiag] = useState("");
    const [certFromDate, setCertFromDate] = useState(todayISO());
    const [certToDate, setCertToDate] = useState(todayISO());

    const rows = useMemo(() => allPatientsFlat(db), [db]);
    const allVisits = useMemo(() => {
        const v = [];
        rows.forEach(({ fam, pat }) => pat.visits.forEach((vis) => v.push({ ...vis, famHead: fam.headName, famId: fam.id, famArea: fam.area || "—", patId: pat.id, patName: pat.name })));
        return v;
    }, [rows]);

    const tabs = [
        { id: "daily", label: "Daily Income" }, { id: "monthly", label: "Monthly" },
        { id: "dues", label: "Patient Due" }, { id: "patient", label: "Patient-wise" },
        { id: "area", label: "Area-wise" }, { id: "refdr", label: "Ref. Doctor" },
        { id: "diagnosis", label: "Diagnosis-wise" }, { id: "payment", label: "Payment" },
        { id: "certificate", label: "Medical Certificate" },
    ];

    /* ---- Daily ---- */
    const dayVisits = allVisits.filter((v) => v.date === date);
    const dayTotal = dayVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);

    /* ---- Monthly ---- */
    const monthVisits = allVisits.filter((v) => v.date && v.date.startsWith(month));
    const monthTotal = monthVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const monthDue = monthVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);

    /* ---- Dues ---- */
    const duesRows = rows.filter((r) => r.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue);

    /* ---- Patient-wise ---- */
    const patQ = searchPat.trim().toLowerCase();
    const patMatches = patQ ? allVisits.filter((v) => v.patName.toLowerCase().includes(patQ) || v.patId === patQ) : [];

    /* ---- Area-wise ---- */
    const areaMap = {};
    rows.forEach(({ fam, pat }) => { const a = fam.area || "Unknown"; if (!areaMap[a]) areaMap[a] = { families: new Set(), patients: 0, visits: 0 }; areaMap[a].families.add(fam.id); areaMap[a].patients++; areaMap[a].visits += pat.visits.length; });
    const areaList = Object.entries(areaMap).sort((a, b) => b[1].patients - a[1].patients);

    /* ---- Ref Doctor ---- */
    const drMap = {};
    allVisits.forEach((v) => { const d = v.refDr || "Self/None"; drMap[d] = (drMap[d] || 0) + 1; });
    const drList = Object.entries(drMap).sort((a, b) => b[1] - a[1]);

    /* ---- Diagnosis-wise ---- */
    const diagMap = {};
    allVisits.forEach((v) => { const d = v.diagnosis || "Unspecified"; diagMap[d] = (diagMap[d] || 0) + 1; });
    const diagList = Object.entries(diagMap).sort((a, b) => b[1] - a[1]);

    /* ---- Payment ---- */
    const payVisits = allVisits.filter((v) => v.date === date && (Number(v.received) || 0) > 0);

    const Th = ({ children }) => <th style={{ textAlign: "left", padding: "8px", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-muted)", fontWeight: 700, borderBottom: "1.5px solid var(--border)" }}>{children}</th>;
    const Td = ({ children, mono }) => <td style={{ padding: "7px 8px", fontSize: 13, borderBottom: "1px solid var(--border)" }} className={mono ? "font-mono" : ""}>{children}</td>;

    return (
        <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {tabs.map((tb) => <button key={tb.id} className={tab === tb.id ? "cms-btn-primary" : "cms-btn-ghost"} style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => setTab(tb.id)}>{tb.label}</button>)}
            </div>

            {/* Daily Income */}
            {tab === "daily" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <CalendarDays size={16} color="var(--primary)" />
                        <input type="date" className="cms-input" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
                        <div className="font-mono" style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800 }}>{fmtMoney(dayTotal)}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>total collected</div>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><Th>Case</Th><Th>Patient</Th><Th>Complaint</Th><Th>Charge</Th><Th>Received</Th><Th>Due</Th></tr></thead>
                        <tbody>
                            {dayVisits.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No visits on this date.</td></tr>}
                            {dayVisits.map((v) => <tr key={v.id}><Td mono>{v.caseId}</Td><Td>{v.patName}</Td><Td>{v.complaint || "—"}</Td><Td mono>{fmtMoney(v.charge)}</Td><Td mono>{fmtMoney(v.received)}</Td><Td mono>{fmtMoney(v.due)}</Td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Monthly */}
            {tab === "monthly" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <input type="month" className="cms-input" style={{ width: 200 }} value={month} onChange={(e) => setMonth(e.target.value)} />
                        <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
                            <div><div className="cms-label">Visits</div><div className="font-mono" style={{ fontSize: 18, fontWeight: 800 }}>{monthVisits.length}</div></div>
                            <div><div className="cms-label">Collected</div><div className="font-mono" style={{ fontSize: 18, fontWeight: 800 }}>{fmtMoney(monthTotal)}</div></div>
                            <div><div className="cms-label">Due</div><div className="font-mono" style={{ fontSize: 18, fontWeight: 800, color: "var(--danger)" }}>{fmtMoney(monthDue)}</div></div>
                        </div>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><Th>Date</Th><Th>Case</Th><Th>Patient</Th><Th>Charge</Th><Th>Received</Th><Th>Due</Th></tr></thead>
                        <tbody>
                            {monthVisits.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No visits this month.</td></tr>}
                            {monthVisits.map((v) => <tr key={v.id}><Td mono>{fmtDate(v.date)}</Td><Td mono>{v.caseId}</Td><Td>{v.patName}</Td><Td mono>{fmtMoney(v.charge)}</Td><Td mono>{fmtMoney(v.received)}</Td><Td mono>{fmtMoney(v.due)}</Td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Patient Due */}
            {tab === "dues" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{duesRows.length} patient(s) with pending balance &middot; Total {fmtMoney(duesRows.reduce((s, r) => s + r.totalDue, 0))}</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><Th>Patient</Th><Th>Family</Th><Th>Area</Th><Th>Last Visit</Th><Th>Due</Th></tr></thead>
                        <tbody>
                            {duesRows.map(({ fam, pat, totalDue, lastVisit }) => <tr key={pat.id}><Td>{pat.name}</Td><Td>{fam.headName}</Td><Td>{fam.area || "—"}</Td><Td mono>{lastVisit ? fmtDate(lastVisit.date) : "—"}</Td><td style={{ padding: "7px 8px", borderBottom: "1px solid var(--border)" }}><span className="cms-pill cms-badge-due">{fmtMoney(totalDue)}</span></td></tr>)}
                            {duesRows.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No outstanding dues.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Patient-wise */}
            {tab === "patient" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <input className="cms-input" style={{ marginBottom: 14 }} value={searchPat} onChange={(e) => setSearchPat(e.target.value)} placeholder="Search patient name or ID..." />
                    {patQ && (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead><tr><Th>Date</Th><Th>Case</Th><Th>Diagnosis</Th><Th>Complaint</Th><Th>Charge</Th><Th>Received</Th><Th>Due</Th></tr></thead>
                            <tbody>
                                {patMatches.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No records found.</td></tr>}
                                {patMatches.map((v) => <tr key={v.id}><Td mono>{fmtDate(v.date)}</Td><Td mono>{v.caseId}</Td><Td>{v.diagnosis || "—"}</Td><Td>{v.complaint || "—"}</Td><Td mono>{fmtMoney(v.charge)}</Td><Td mono>{fmtMoney(v.received)}</Td><Td mono>{fmtMoney(v.due)}</Td></tr>)}
                            </tbody>
                        </table>
                    )}
                    {!patQ && <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>Type a patient name or ID to see their visit history.</div>}
                </div>
            )}

            {/* Area-wise */}
            {tab === "area" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><Th>Area</Th><Th>Families</Th><Th>Patients</Th><Th>Total Visits</Th></tr></thead>
                        <tbody>
                            {areaList.map(([area, data]) => <tr key={area}><Td>{area}</Td><Td mono>{data.families.size}</Td><Td mono>{data.patients}</Td><Td mono>{data.visits}</Td></tr>)}
                            {areaList.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No data.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Ref Doctor-wise */}
            {tab === "refdr" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>Visits by Referring Doctor</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {drList.map(([name, count]) => (
                            <div key={name}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}><span style={{ fontWeight: 600 }}>{name}</span><span className="font-mono" style={{ color: "var(--text-muted)" }}>{count}</span></div>
                                <div style={{ height: 8, borderRadius: 6, background: "var(--surface-alt)" }}><div style={{ height: 8, borderRadius: 6, background: "var(--primary)", width: `${(count / (drList[0]?.[1] || 1)) * 100}%` }} /></div>
                            </div>
                        ))}
                        {drList.length === 0 && <div style={{ color: "var(--text-muted)" }}>No data.</div>}
                    </div>
                </div>
            )}

            {/* Diagnosis-wise */}
            {tab === "diagnosis" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>Visits by Diagnosis</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {diagList.map(([name, count]) => (
                            <div key={name}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}><span style={{ fontWeight: 600 }}>{name}</span><span className="font-mono" style={{ color: "var(--text-muted)" }}>{count}</span></div>
                                <div style={{ height: 8, borderRadius: 6, background: "var(--surface-alt)" }}><div style={{ height: 8, borderRadius: 6, background: "var(--accent)", width: `${(count / (diagList[0]?.[1] || 1)) * 100}%` }} /></div>
                            </div>
                        ))}
                        {diagList.length === 0 && <div style={{ color: "var(--text-muted)" }}>No data.</div>}
                    </div>
                </div>
            )}

            {/* Payment */}
            {tab === "payment" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <CalendarDays size={16} color="var(--primary)" />
                        <input type="date" className="cms-input" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
                        <div className="font-mono" style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800 }}>{fmtMoney(payVisits.reduce((s, v) => s + (Number(v.received) || 0), 0))}</div>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><Th>Case</Th><Th>Patient</Th><Th>Family</Th><Th>Received</Th></tr></thead>
                        <tbody>
                            {payVisits.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No payments on this date.</td></tr>}
                            {payVisits.map((v) => <tr key={v.id}><Td mono>{v.caseId}</Td><Td>{v.patName}</Td><Td>{v.famHead}</Td><Td mono>{fmtMoney(v.received)}</Td></tr>)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Medical Certificate */}
            {tab === "certificate" && (
                <div className="cms-card" style={{ padding: 18 }}>
                    <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>Medical Certificate</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                        <div><label className="cms-label">Patient Name</label><input className="cms-input" value={certPat} onChange={(e) => setCertPat(e.target.value)} placeholder="Full name" /></div>
                        <div><label className="cms-label">Diagnosis</label><input className="cms-input" value={certDiag} onChange={(e) => setCertDiag(e.target.value)} /></div>
                        <div><label className="cms-label">From Date</label><input type="date" className="cms-input" value={certFromDate} onChange={(e) => setCertFromDate(e.target.value)} /></div>
                        <div><label className="cms-label">To Date</label><input type="date" className="cms-input" value={certToDate} onChange={(e) => setCertToDate(e.target.value)} /></div>
                    </div>
                    <div id="cms-print-area" className="cms-card" style={{ padding: 28, maxWidth: 600 }}>
                        <div style={{ textAlign: "center", borderBottom: "2px solid var(--primary)", paddingBottom: 12, marginBottom: 16 }}>
                            <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-dark)" }}>Dhyey Clinic</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Medical Certificate</div>
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 2 }}>
                            This is to certify that <b>{certPat || "________"}</b> was under medical treatment for <b>{certDiag || "________"}</b> from <b>{fmtDate(certFromDate)}</b> to <b>{fmtDate(certToDate)}</b> and is advised rest during this period.
                        </div>
                        <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <div><div className="cms-label">Date</div>{fmtDate(todayISO())}</div>
                            <div style={{ textAlign: "right" }}><div className="cms-label">Doctor's Signature</div>________________</div>
                        </div>
                    </div>
                    <button className="cms-btn-primary" style={{ marginTop: 12 }} onClick={() => window.print()}><FileText size={14} />Print Certificate</button>
                </div>
            )}
        </div>
    );
}
