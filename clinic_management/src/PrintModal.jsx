import React, { useState } from "react";
import { X, Printer } from "lucide-react";
import { fmtDate } from "./helpers";
import { AutocompleteInput } from "./components";

export default function PrescriptionPrintModal({ data, dietary: dbDietary, onClose }) {
    const [lang, setLang] = useState("EN");
    const [dietary, setDietary] = useState("");
    const [shortcuts, setShortcuts] = useState(() => JSON.parse(localStorage.getItem("clinic_dietary_shortcuts") || "[]"));

    if (!data) return null;
    const { pat, visit } = data;

    const TEXT = {
        EN: {
            med: "Medicine", qty: "Qty", inst: "Dosage Instructions", diet: "Dietary Advice:",
            mor: "Morning", noon: "Noon", eve: "Evening", ngt: "Night", bf: "Before Food", af: "After Food"
        },
        GU: {
            med: "દવા", qty: "માત્રા", inst: "લેવાની રીત", diet: "ખાવાની પરેજી:",
            mor: "સવારે", noon: "બપોરે", eve: "સાંજે", ngt: "રાત્રે", bf: "જમ્યા પહેલા", af: "જમ્યા પછી"
        },
        HI: {
            med: "दवा", qty: "मात्रा", inst: "खुराक का विवरण", diet: "आहार संबंधी सलाह:",
            mor: "सुबह", noon: "दोपहर", eve: "शाम", ngt: "रात", bf: "खाने से पहले", af: "खाने के बाद"
        }
    };
    const t = TEXT[lang];

    const handlePrint = () => {
        if (dietary && !shortcuts.includes(dietary)) {
            // Don't save it to local storage if it's already in the global library exact match
            const isFromLibrary = dbDietary && Object.values(dbDietary).some(d => d.text === dietary);
            if (!isFromLibrary) {
                const newShortcuts = [...shortcuts, dietary];
                setShortcuts(newShortcuts);
                localStorage.setItem("clinic_dietary_shortcuts", JSON.stringify(newShortcuts));
            }
        }
        window.print();
    };

    const renderDietaryText = () => {
        if (!dietary.trim()) return "";
        const codes = dietary.split(",").map(c => c.trim().toUpperCase()).filter(Boolean);
        let expanded = [];
        for (const c of codes) {
            if (dbDietary && dbDietary[c]) {
                expanded.push(dbDietary[c].text);
            } else {
                expanded.push(c);
            }
        }
        return expanded.join("\n\n");
    };

    const parseDosage = (p) => {
        let parts = [];
        if (p.mor && p.mor !== "0") parts.push(`${p.mor} ${t.mor}`);
        if (p.noon && p.noon !== "0") parts.push(`${p.noon} ${t.noon}`);
        if (p.eve && p.eve !== "0") parts.push(`${p.eve} ${t.eve}`);
        if (p.ngt && p.ngt !== "0") parts.push(`${p.ngt} ${t.ngt}`);

        let timing = "";
        if (p.timing === "BF") timing = ` (${t.bf})`;
        else if (p.timing === "AF") timing = ` (${t.af})`;
        else if (p.timing && p.timing.trim()) timing = ` (${p.timing})`;

        if (parts.length === 0) return timing ? timing.trim() : "-";
        return parts.join(", ") + timing;
    };

    return (
        <div className="cms-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="cms-modal" style={{ width: "14.8cm", maxWidth: "95vw", padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Visit Print Preview</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <select className="cms-input" style={{ padding: "4px 8px", fontSize: 13 }} value={lang} onChange={(e) => setLang(e.target.value)}>
                            <option value="EN">English</option>
                            <option value="GU">ગુજરાતી</option>
                            <option value="HI">हिंदी</option>
                        </select>
                        <button className="cms-btn-ghost" onClick={onClose}><X size={14} /></button>
                    </div>
                </div>

                <div className="no-print" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, background: "var(--surface-alt)" }}>
                    <div style={{ flex: 1 }}>
                        <label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Add Dietary Advice (Printed Only)</label>
                        <AutocompleteInput
                            className="cms-input"
                            multi={true}
                            style={{ width: "100%", maxWidth: 400 }}
                            placeholder="Type dietary shortcut codes (e.g. DB, SUGAR)..."
                            value={dietary}
                            onChange={(e) => setDietary(e.target.value)}
                            options={[...(dbDietary ? Object.keys(dbDietary) : []), ...shortcuts]}
                        />
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <button className="cms-btn-primary" onClick={handlePrint}><Printer size={14} />Print A5 Letterpad</button>
                        <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11, color: "var(--text-muted)" }}>Set your printer to A5 paper size (Portrait). Margin: None.</p>
                    </div>
                </div>

                <div id="cms-print-area" style={{ width: "100%", minHeight: "21cm", padding: "12mm 15mm", display: "flex", flexDirection: "column", fontFamily: "'Mukta', 'Hind', 'Noto Sans Gujarati', 'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif", boxSizing: "border-box", background: "white" }}>
                    {/* Header Structure */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: "28pt", color: "#1167b1", letterSpacing: "-0.5px", textShadow: "1px 1px 0px rgba(0,0,0,0.1)" }}>Dr. Chirag Paghdal</h1>
                            <h2 style={{ margin: 0, fontSize: "14pt", color: "#1167b1", fontWeight: "900", letterSpacing: "0.5px" }}>FAMILY PHYSICIAN <span style={{ fontSize: "11pt", color: "#333", fontWeight: "bold" }}>(B.H.M.S.)</span></h2>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "10pt", color: "#333", fontWeight: "bold" }}>
                            <div style={{ marginBottom: 4 }}>Mo.: 98793 80508</div>
                            <div>Reg. No. G-9035</div>
                        </div>
                    </div>

                    {/* Banner */}
                    <div style={{ background: "#d9d9d9", padding: "4px 12px", borderBottom: "2px solid #999", borderTop: "2px solid #999", fontSize: "10.5pt", textAlign: "center", marginBottom: 12, color: "#333", fontWeight: "600" }}>
                        Dhyey Clinic &amp; Nursing Home : Shop No. 1, Mahavir Heights, New Kosad Road, Amroli, Surat.
                    </div>

                    {/* Patient Basics */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12pt", fontWeight: "bold", marginBottom: 12, padding: "0 4px" }}>
                        <div>FOR, <span style={{ fontWeight: "normal", textTransform: "uppercase", marginLeft: 8 }}>{pat.name}</span></div>
                        <div>DATE : <span style={{ fontWeight: "normal", marginLeft: 8 }}>{fmtDate(visit.date)}</span></div>
                    </div>

                    {/* Medical Body Table */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "11pt", flex: 1, color: "#222" }}>



                        {/* Rx Table */}

                        {(visit.prescription?.length > 0) && (
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                                <thead style={{ fontSize: "10.5pt" }}>
                                    <tr style={{ borderBottom: "2px solid #ccc" }}>
                                        <th style={{ textAlign: "left", padding: "4px 8px", width: "40%" }}>{t.med}</th>
                                        <th style={{ padding: "4px 8px", textAlign: "center", width: "15%" }}>{t.qty}</th>
                                        <th style={{ padding: "4px 8px", textAlign: "left", width: "45%" }}>{t.inst}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visit.prescription.map((p, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid #eee", fontSize: "10.5pt", fontWeight: "600" }}>
                                            <td style={{ padding: "4px 8px" }}>{p.name}</td>
                                            <td style={{ padding: "4px 8px", textAlign: "center" }}>{p.qty}</td>
                                            <td style={{ padding: "4px 8px", textAlign: "left", color: "#444" }}>{parseDosage(p)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {dietary && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: "11.5pt", fontWeight: "bold", textDecoration: "underline", marginBottom: 6 }}>{t.diet}</div>
                                <div style={{ fontSize: "11pt", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{renderDietaryText()}</div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: "center", fontSize: "15pt", fontWeight: "900", borderTop: "2px solid #ccc", paddingTop: 8, marginTop: "auto", color: "#1167b1" }}>
                        + Harsh Medical &amp; General Stores +
                    </div>
                </div>
            </div>
        </div>
    );
}
