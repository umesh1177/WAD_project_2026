import React, { useRef, useEffect } from "react";
import { LogOut, Plus, Edit2 } from "lucide-react";
import { uid } from "./helpers";

export default function DoctorProfileDropdown({ doctorProfile, onClose, onUpdate, onLogout }) {
    const wrapperRef = useRef(null);

    const activeClinic = doctorProfile.clinics.find(c => c.id === doctorProfile.activeClinicId) || doctorProfile.clinics[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleSwitch = (id) => {
        onUpdate({ ...doctorProfile, activeClinicId: id });
        onClose();
    };

    const handleAdd = () => {
        const name = prompt("Enter new clinic name:");
        if (name && name.trim()) {
            const newClinic = { id: uid(), name: name.trim() };
            onUpdate({ ...doctorProfile, clinics: [...doctorProfile.clinics, newClinic], activeClinicId: newClinic.id });
            onClose();
        }
    };

    const handleRename = () => {
        const name = prompt("Enter new name for current clinic:", activeClinic.name);
        if (name && name.trim()) {
            const upd = doctorProfile.clinics.map(c => c.id === activeClinic.id ? { ...c, name: name.trim() } : c);
            onUpdate({ ...doctorProfile, clinics: upd });
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: "absolute", top: "100%", right: 16, width: 280, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 1000, marginTop: 10, padding: 12 }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>Dr. {doctorProfile.username}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Manage Clinics</div>
            </div>

            <div className="cms-scrollbar" style={{ maxHeight: 200, overflowY: "auto", marginBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {doctorProfile.clinics.map(c => (
                    <button key={c.id} className="cms-btn-ghost" onClick={() => handleSwitch(c.id)} style={{ width: "100%", justifyContent: "flex-start", padding: "8px 12px", background: c.id === activeClinic.id ? "var(--primary-soft)" : "transparent", color: c.id === activeClinic.id ? "var(--primary-dark)" : "var(--text-main)" }}>
                        {c.name}
                        {c.id === activeClinic.id && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 6px", background: "var(--primary)", color: "white", borderRadius: 4 }}>Active</span>}
                    </button>
                ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <button className="cms-btn-ghost" onClick={handleAdd} style={{ width: "100%", justifyContent: "flex-start", padding: "8px 12px", color: "var(--text-muted)" }}>
                    <Plus size={14} style={{ marginRight: 6 }} /> Add New Clinic
                </button>
                <button className="cms-btn-ghost" onClick={handleRename} style={{ width: "100%", justifyContent: "flex-start", padding: "8px 12px", color: "var(--text-muted)" }}>
                    <Edit2 size={14} style={{ marginRight: 6 }} /> Rename Active Clinic
                </button>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
                <button className="cms-btn-danger" onClick={onLogout} style={{ width: "100%", justifyContent: "center", padding: "8px 12px" }}>
                    <LogOut size={16} style={{ marginRight: 6 }} /> Logout
                </button>
            </div>
        </div>
    );
}
