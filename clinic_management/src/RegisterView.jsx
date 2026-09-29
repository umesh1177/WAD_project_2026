import React, { useState, useEffect } from "react";
import { Save, UserPlus, Trash2, Utensils } from "lucide-react";
import { searchFamilies } from "./helpers";
import { useSuggestions, Datalists, AutocompleteInput } from "./components";

function NewFamilyForm({ db, onCreate, autoFocusRef }) {
    const [headName, setHeadName] = useState("");
    const [area, setArea] = useState("");
    const [phone, setPhone] = useState("");
    const suggestions = useSuggestions(db);
    const submit = (e) => { e.preventDefault(); if (!headName.trim()) return; onCreate(headName.trim(), area.trim(), phone.trim()); setHeadName(""); setArea(""); setPhone(""); };
    return (
        <form onSubmit={submit} className="cms-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <Datalists s={suggestions} />
            <div className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>Step 1 &middot; Register Family Head</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -8 }}>
                Enter the head's name and area. A numeric Family ID is generated instantly. Then add each family member through the member form.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}><label className="cms-label">Family Head Name *</label><input ref={autoFocusRef} autoFocus className="cms-input" value={headName} onChange={(e) => setHeadName(e.target.value.replace(/,/g, ' ').replace(/\s+/g, ' ').toUpperCase())} placeholder="(SURNAME NAME FATHER'S NAME)" /></div>
                <div><label className="cms-label">Area</label><AutocompleteInput className="cms-input" options={suggestions.area} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Govindpark" /></div>
                <div><label className="cms-label">Phone</label><input className="cms-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" /></div>
            </div>
            <div><button type="submit" className="cms-btn-primary"><Save size={14} />Generate Family ID<span className="cms-kbd" style={{ marginLeft: 4 }}>Enter</span></button></div>
        </form>
    );
}

function AddMemberForm({ db, onAdd, presetFamId, defaultRelation, onDoneWithPreset, autoFocusRef }) {
    const [query, setQuery] = useState("");
    const [famId, setFamId] = useState(presetFamId || "");
    const [highlight, setHighlight] = useState(0);
    const [name, setName] = useState("");
    const [relation, setRelation] = useState(defaultRelation || "");
    const [age, setAge] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [allergy, setAllergy] = useState("");
    const suggestions = useSuggestions(db);

    useEffect(() => { setFamId(presetFamId || ""); setRelation(defaultRelation || ""); setQuery(""); }, [presetFamId, defaultRelation]);

    const matches = !famId && query.trim() ? searchFamilies(db, query).slice(0, 6) : [];
    const chosenFam = famId ? db.families[famId] : null;
    const pick = (f) => { setFamId(f.id); setQuery(""); setHighlight(0); };

    const handleQueryKeyDown = (e) => {
        if (matches.length === 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, matches.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); pick(matches[highlight]); }
        else if (e.key === "Escape") { setQuery(""); }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!chosenFam || !name.trim()) return;
        onAdd(chosenFam.id, { name: name.trim(), relation: relation.trim(), age, bloodGroup, allergy });
        setName(""); setRelation(""); setAge(""); setBloodGroup(""); setAllergy("");
    };

    return (
        <form onSubmit={submit} className="cms-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <Datalists s={suggestions} />
            <div className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>{presetFamId ? "Step 2 \u00b7 Add Member Details" : "Add Member to Existing Family"}</div>
            {presetFamId && chosenFam && (
                <div style={{ background: "var(--primary-soft)", color: "var(--primary-dark)", padding: "8px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600 }}>
                    Family ID <span className="font-mono">{chosenFam.id}</span> generated for {chosenFam.headName}. Fill member details below.
                </div>
            )}
            {!presetFamId && (
                <div style={{ position: "relative" }}>
                    <label className="cms-label">Find Family (head name or Family ID)</label>
                    <input ref={autoFocusRef} className="cms-input" value={chosenFam ? `${chosenFam.headName} (${chosenFam.id})` : query} onChange={(e) => { setQuery(e.target.value); setFamId(""); setHighlight(0); }} onKeyDown={handleQueryKeyDown} placeholder="Start typing family head name..." />
                    {!chosenFam && matches.length > 0 && (
                        <div className="cms-card" style={{ position: "absolute", top: 66, left: 0, right: 0, zIndex: 20, overflow: "hidden" }}>
                            {matches.map((f, i) => (
                                <div key={f.id} onClick={() => pick(f)} onMouseEnter={() => setHighlight(i)} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid var(--border)", background: i === highlight ? "var(--surface-alt)" : "transparent" }}>
                                    <b>{f.headName}</b> <span className="font-mono" style={{ color: "var(--text-muted)" }}>&middot; {f.id}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {chosenFam && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label className="cms-label">Member Name *</label><input ref={presetFamId ? autoFocusRef : undefined} autoFocus={!!presetFamId} className="cms-input" value={name} onChange={(e) => setName(e.target.value.replace(/,/g, ' ').replace(/\s+/g, ' ').toUpperCase())} placeholder="(SURNAME NAME FATHER'S NAME)" /></div>
                    <div><label className="cms-label">Relation to Head</label><AutocompleteInput className="cms-input" options={suggestions.relation} value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g. Head, Wife, Son" /></div>
                    <div><label className="cms-label">Age</label><input className="cms-input" value={age} onChange={(e) => setAge(e.target.value)} /></div>
                    <div><label className="cms-label">Blood Group</label><AutocompleteInput className="cms-input" options={suggestions.bloodGroup} value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} /></div>
                    <div style={{ gridColumn: "1 / -1" }}><label className="cms-label">Allergy</label><AutocompleteInput className="cms-input" options={suggestions.allergy} value={allergy} onChange={(e) => setAllergy(e.target.value)} /></div>
                </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={!chosenFam} className="cms-btn-primary"><UserPlus size={14} />Save Member<span className="cms-kbd" style={{ marginLeft: 4 }}>Enter</span></button>
                {presetFamId && <button type="button" className="cms-btn-ghost" onClick={onDoneWithPreset}>Done adding to this family</button>}
            </div>
        </form>
    );
}

function DietaryLibraryTab({ db, onAdd, onDelete }) {
    const [code, setCode] = useState("");
    const [text, setText] = useState("");
    const items = Object.values(db.dietary || {}).sort((a, b) => a.code.localeCompare(b.code));
    const submit = (e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (!c || !text.trim()) return; onAdd(c, text.trim()); setCode(""); setText(""); };
    return (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <form onSubmit={submit} className="cms-card" style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>Dietary Advice Library</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -8 }}>Store reusable dietary advice with a shortcut code. At print time, attach any entry to a patient's printout &mdash; never stored in history.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 12 }}>
                    <div><label className="cms-label">Shortcut Code</label><input className="cms-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DB" style={{ textTransform: "uppercase" }} /></div>
                    <div><label className="cms-label">Full Dietary Text</label><input className="cms-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Avoid sugar and fried food..." /></div>
                </div>
                <div><button type="submit" className="cms-btn-primary"><Utensils size={14} />Save to Library</button></div>
            </form>
            <div className="cms-card" style={{ flex: 1, padding: 18, maxHeight: 420, overflowY: "auto" }}>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Saved Entries ({items.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((d) => (
                        <div key={d.code} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 12px", borderRadius: 10, background: "var(--surface-alt)" }}>
                            <div><span className="font-mono cms-pill cms-badge-paid" style={{ marginRight: 8 }}>{d.code}</span><span style={{ fontSize: 12.5 }}>{d.text}</span></div>
                            <button className="cms-btn-danger" style={{ flexShrink: 0 }} onClick={() => onDelete(d.code)}><Trash2 size={13} /></button>
                        </div>
                    ))}
                    {items.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No dietary entries yet.</div>}
                </div>
            </div>
        </div>
    );
}

export default function RegisterView({ db, tab, setTab, onCreateFamily, onAddMember, presetFamId, presetRelation, clearPreset, focusRef, onAddDietary, onDeleteDietary, goToPatient, onDeleteFamily, onDeletePatient }) {
    const [listQuery, setListQuery] = useState("");
    const [expandedFam, setExpandedFam] = useState(null);

    const matchedFamilies = Object.values(db.families).filter(f => {
        const q = listQuery.toLowerCase();
        if (!q) return true;
        if (f.headName.toLowerCase().includes(q) || f.id.includes(q) || (f.area || "").toLowerCase().includes(q)) return true;
        for (const pat of Object.values(f.patients)) {
            if (pat.name.toLowerCase().includes(q) || pat.id.includes(q)) return true;
        }
        return false;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Auto-expand logic based on search
    const activeExpFam = listQuery.length > 0 && matchedFamilies.length === 1 ? matchedFamilies[0].id : expandedFam;
    return (
        <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
                <button className={tab === "family" ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab("family")}>New Family <span className="cms-kbd" style={{ marginLeft: 6 }}>F1</span></button>
                <button className={tab === "member" ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab("member")}>Add Member <span className="cms-kbd" style={{ marginLeft: 6 }}>F2</span></button>
                <button className={tab === "dietary" ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab("dietary")}><Utensils size={14} />Dietary Library</button>
            </div>
            {tab === "dietary" ? (
                <DietaryLibraryTab db={db} onAdd={onAddDietary} onDelete={onDeleteDietary} />
            ) : (
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                        {tab === "family"
                            ? <NewFamilyForm db={db} onCreate={onCreateFamily} autoFocusRef={focusRef} />
                            : <AddMemberForm db={db} onAdd={onAddMember} presetFamId={presetFamId} defaultRelation={presetRelation} onDoneWithPreset={clearPreset} autoFocusRef={focusRef} />}
                    </div>
                    <div className="cms-card" style={{ flex: 1, padding: 18, maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                        <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Registered Families & Patients</div>
                        <input className="cms-input" style={{ marginBottom: 12, padding: "6px 10px", fontSize: 13 }} placeholder="Search name, family ID..." value={listQuery} onChange={(e) => setListQuery(e.target.value)} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {matchedFamilies.map((f) => {
                                const isExp = activeExpFam === f.id;
                                return (
                                    <div key={f.id} style={{ borderRadius: 10, background: "var(--surface-alt)", overflow: "hidden" }}>
                                        <div onClick={() => setExpandedFam(isExp ? null : f.id)} style={{ padding: "10px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                                            <div><b style={{ fontSize: 13.5 }}>{f.headName}</b><div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{f.area || "—"} &middot; {Object.keys(f.patients).length} member(s)</div></div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span className="cms-pill cms-badge-paid" style={{ fontSize: 10 }}>FAM {f.id}</span>
                                                <button type="button" className="cms-btn-danger" style={{ padding: "4px 8px" }} onClick={(e) => { e.stopPropagation(); onDeleteFamily(f.id); }}><Trash2 size={13} /></button>
                                            </div>
                                        </div>
                                        {isExp && (
                                            <div style={{ background: "rgba(0,0,0,0.03)", padding: "4px 12px 10px 12px" }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>Family Members:</div>
                                                {Object.values(f.patients).map(p => (
                                                    <div key={p.id} onClick={() => goToPatient(f.id, p.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 4, cursor: "pointer", fontSize: 12.5 }}>
                                                        <div><b>{p.name}</b> <span style={{ color: "var(--text-muted)" }}>({p.relation || "Member"})</span></div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <span className="cms-pill cms-badge-due" style={{ fontSize: 10 }}>PT {p.id}</span>
                                                            <button type="button" className="cms-btn-danger" style={{ padding: "2px 6px" }} onClick={(e) => { e.stopPropagation(); onDeletePatient(f.id, p.id); }}><Trash2 size={11} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {matchedFamilies.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 10 }}>No matching families.</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
