import React, { useState } from "react";
import { Save, X, Trash2, LogOut } from "lucide-react";

export default function LabReportModal({ initialData, familyName, patientName, date, onClose, onSave }) {
    const [tab, setTab] = useState("hematology");
    const [form, setForm] = useState(initialData || {});

    const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const rangesMap = {
        hemo: [12.0, 16.0], rbc: [4.2, 5.4], wbc: [4000, 10000], platelets: [150000, 400000],
        esr: [2, 20], band: [0, 6], neutrophils: [55, 70], lymphocytes: [20, 40], eosinophils: [1, 6],
        monocytes: [2, 8], basophils: [0, 1], rbs: [0, 120], fbs: [70, 100], ppbs: [0, 140],
        creatinin: [0.5, 1.5], vitb12: [200, 900], t3: [82, 200], t4: [4.5, 12.5], tsh: [0.4, 6.0]
    };

    const isOutOfRange = (field, val) => {
        if (!val || isNaN(val) || !rangesMap[field]) return false;
        const num = Number(val);
        return num < rangesMap[field][0] || num > rangesMap[field][1];
    };

    const renderInputRow = (label, field, range) => {
        const outRange = isOutOfRange(field, form[field]);
        return (
            <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 10 }}>
                <div style={{ width: 140, fontWeight: 600, fontSize: 13, textAlign: "right", color: outRange ? "var(--danger)" : "inherit" }}>{label} :</div>
                <input className="cms-input" style={{ width: 100, padding: "4px 8px", borderColor: outRange ? "var(--danger)" : "", color: outRange ? "var(--danger)" : "", fontWeight: outRange ? 700 : 400 }} value={form[field] || ""} onChange={e => update(field, e.target.value)} />
                <div style={{ width: 150, fontSize: 12, color: outRange ? "var(--danger)" : "var(--text-muted)", fontFamily: "monospace", fontWeight: outRange ? 600 : 400 }}>{range}</div>
            </div>
        );
    };

    return (
        <div className="cms-overlay" style={{ zIndex: 300, alignItems: "flex-start", paddingTop: 30, overflowY: "auto", paddingBottom: 40 }} onMouseDown={onClose}>
            <div className="cms-modal" style={{ width: 940, padding: 0 }} onMouseDown={e => e.stopPropagation()}>
                {/* Header Section */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 90, fontSize: 13, fontWeight: 600 }}>Family Name :</span>
                                <input className="cms-input" style={{ flex: 1 }} readOnly value={familyName || ""} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 90, fontSize: 13, fontWeight: 600 }}>Patient Name :</span>
                                <input className="cms-input" style={{ flex: 1 }} readOnly value={patientName || ""} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 90, fontSize: 13, fontWeight: 600 }}>Lab Name :</span>
                                <input className="cms-input" style={{ flex: 1 }} value={form.labName || ""} onChange={e => update("labName", e.target.value)} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 90, fontSize: 13, fontWeight: 600 }}>Dr Name :</span>
                                <input className="cms-input" style={{ flex: 1 }} value={form.drName || ""} onChange={e => update("drName", e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 80, fontSize: 13, fontWeight: 600 }}>Entry Date :</span>
                                <input type="date" className="cms-input" style={{ flex: 1 }} value={date || ""} readOnly />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", padding: "14px 20px 0", borderBottom: "2px solid var(--border)", gap: 4, background: "var(--surface-alt)" }}>
                    <button className={tab === "hematology" ? "cms-tab active" : "cms-tab"} style={{ padding: "8px 16px", background: tab === "hematology" ? "var(--surface)" : "transparent", border: tab === "hematology" ? "2px solid var(--border)" : "2px solid transparent", borderBottom: "none", borderRadius: "8px 8px 0 0", fontWeight: tab === "hematology" ? 700 : 500 }} onClick={() => setTab("hematology")}>Routine Hematology Report</button>
                    <button className={tab === "urine" ? "cms-tab active" : "cms-tab"} style={{ padding: "8px 16px", background: tab === "urine" ? "var(--surface)" : "transparent", border: tab === "urine" ? "2px solid var(--border)" : "2px solid transparent", borderBottom: "none", borderRadius: "8px 8px 0 0", fontWeight: tab === "urine" ? 700 : 500 }} onClick={() => setTab("urine")}>Routine Urine Examination Report</button>
                    <button className={tab === "other" ? "cms-tab active" : "cms-tab"} style={{ padding: "8px 16px", background: tab === "other" ? "var(--surface)" : "transparent", border: tab === "other" ? "2px solid var(--border)" : "2px solid transparent", borderBottom: "none", borderRadius: "8px 8px 0 0", fontWeight: tab === "other" ? 700 : 500 }} onClick={() => setTab("other")}>Other Reports</button>
                </div>

                {/* Tab Content */}
                <div style={{ padding: 20, display: "flex", background: "var(--surface)", minHeight: 450 }}>
                    {tab === "hematology" && (
                        <div style={{ display: "flex", width: "100%", gap: 30 }}>
                            {/* Left Col - Hematology */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14, marginBottom: 14, paddingRight: 60, color: "var(--text)" }}>
                                    <span style={{ width: 140, textAlign: "right" }}>PARAMETER</span>
                                    <span style={{ width: 100, textAlign: "center" }}>RESULT</span>
                                    <span style={{ width: 150, textAlign: "left" }}>NORMAL RANGE</span>
                                </div>
                                {renderInputRow("Hemoglobin", "hemo", "( 12.0-16.0 gm% )")}
                                {renderInputRow("RBC Count", "rbc", "( 4.2-5.4 mill /c.mm )")}
                                {renderInputRow("WBC Count", "wbc", "(4000-10,000 /c.mm )")}
                                {renderInputRow("Platelet Count", "platelets", "( 1,50,000-4,00,000 / c mm )")}
                                {renderInputRow("ESR", "esr", "( 2-20 mm/hr. )")}

                                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13, marginTop: 24, marginBottom: 14, paddingRight: 60, color: "var(--text)" }}>
                                    <span style={{ width: 140, textAlign: "right" }}>DIFFERENTIAL WBC</span>
                                    <span style={{ width: 100, textAlign: "center" }}>RESULT</span>
                                    <span style={{ width: 150, textAlign: "left" }}>RANGE</span>
                                </div>
                                {renderInputRow("Band Cell", "band", "( 0-6 % )")}
                                {renderInputRow("Neutrophils", "neutrophils", "( 55-70 % )")}
                                {renderInputRow("Lymphocytes", "lymphocytes", "( 20-40 % )")}
                                {renderInputRow("Eosinophils", "eosinophils", "( 1-6 % )")}
                                {renderInputRow("Monocytes", "monocytes", "( 2-8 % )")}
                                {renderInputRow("Basophils", "basophils", "( 0-01 % )")}
                                {renderInputRow("Parasites", "parasites", "")}
                            </div>

                            {/* Right Col - Other Reports Snippet */}
                            <div style={{ flex: 1, borderLeft: "1px dashed var(--border)", paddingLeft: 30 }}>
                                {renderInputRow("RBS", "rbs", "( upto- 120 mg% )")}
                                {renderInputRow("FBS", "fbs", "( 70- 100 mg% )")}
                                {renderInputRow("PPBS", "ppbs", "( upto- 140 mg% )")}

                                <div style={{ height: 20 }} />
                                {renderInputRow("S.Creatinin", "creatinin", "( 0.5-1.5 mg/dl )")}
                                {renderInputRow("Vitamin B 12", "vitb12", "( 200-900 pg/ml )")}

                                <div style={{ marginTop: 20, marginBottom: 12, fontWeight: 800, fontSize: 13, textAlign: "center" }}>Thyroid Function Test :</div>
                                {renderInputRow("T3", "t3", "( 82-200 ng/ml )")}
                                {renderInputRow("T4", "t4", "( 4.5-12.5 mcg% )")}
                                {renderInputRow("TSH", "tsh", "( 0.4-6.0 mlu/ml )")}
                            </div>
                        </div>
                    )}
                    {tab === "urine" && (
                        <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", color: "var(--text-muted)" }}>
                            (Urine Examination fields go here — pending future requirements)
                        </div>
                    )}
                    {tab === "other" && (
                        <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center", color: "var(--text-muted)" }}>
                            (Additional other reports fields go here)
                        </div>
                    )}
                </div>

                {/* Right side floating buttons mimicking the image's right actions bar */}
                <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", justifyContent: "flex-end", gap: 12, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                    <button className="cms-btn-primary" onClick={() => onSave(form)} style={{ padding: "8px 24px" }}><Save size={14} />Save</button>
                    <button className="cms-btn-ghost" onClick={() => setForm(initialData || {})} style={{ padding: "8px 24px" }}><Trash2 size={14} />Clear</button>
                    <button className="cms-btn-ghost" onClick={onClose} style={{ padding: "8px 24px" }}><LogOut size={14} />Exit</button>
                </div>
            </div>
        </div>
    );
}
