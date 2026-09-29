export const pad = (n, len) => String(n).padStart(len, "0");
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const nowTime = () => { const d = new Date(); return `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`; };
export const fmtDate = (iso) => { if (!iso) return "-"; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
export const fmtMoney = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;
export const uid = () => Math.random().toString(36).slice(2, 10);

export const PRINT_I18N = {
    en: { clinic: "Dhyey Clinic", sub: "Prescription", patient: "Patient", date: "Date", medicine: "Medicine", qty: "Qty", mor: "Morning", noon: "Noon", eve: "Evening", ngt: "Night", dietary: "Dietary Advice" },
    hi: { clinic: "ध्येय क्लिनिक", sub: "नुस्खा", patient: "रोगी", date: "दिनांक", medicine: "दवा", qty: "मात्रा", mor: "सुबह", noon: "दोपहर", eve: "शाम", ngt: "रात", dietary: "आहार सलाह" },
    gu: { clinic: "ધ્યેય ક્લિનિક", sub: "પ્રિસ્ક્રિપ્શન", patient: "દર્દી", date: "તારીખ", medicine: "દવા", qty: "જથ્થો", mor: "સવાર", noon: "બપોર", eve: "સાંજ", ngt: "રાત", dietary: "આહાર સલાહ" },
};

/* ---- Data seed ---- */
export const seedDB = () => ({
    counters: { family: 6, patient: 11, visit: 1 },
    dietary: {
        DB: { code: "DB", text: "Diabetic diet: avoid sugar, sweets and fried food. Prefer high-fibre meals, eat on time." },
        CV: { code: "CV", text: "Low-salt, low-oil diet. Avoid red meat and packaged/processed food." },
        LQ: { code: "LQ", text: "Plenty of fluids and light, easily digestible food until fever/cough settles." },
    },
    families: {
        "0001": {
            id: "0001", headName: "PATEL RAMESHBHAI GOVINDBHAI", area: "VASTRAPUR", phone: "9876543210", createdAt: todayISO(),
            patients: {
                "0001": {
                    id: "0001", name: "PATEL RAMESHBHAI GOVINDBHAI", relation: "Head", age: 45, bloodGroup: "O+", allergy: "",
                    visits: [
                        { id: "v1", caseId: "0001000101", visitNum: 1, date: todayISO(), time: "10:15", weight: "75", bp: "130/80", refDr: "Dr. Shah", diagnosis: "Viral Infection", complaint: "Cough and Cold", treatment: [{ name: "Checkup", qty: "1" }], prescription: [{ name: "Paracetamol", qty: "10", mor: "1", noon: "1", eve: "1", ngt: "0" }], charge: 800, received: 500, due: 300 }
                    ]
                },
                "0002": {
                    id: "0002", name: "PATEL SHARDABEN RAMESHBHAI", relation: "Wife", age: 43, bloodGroup: "B+", allergy: "DUST",
                    visits: []
                }
            }
        },
        "0002": {
            id: "0002", headName: "SHARMA AMITBHAI DINESHBHAI", area: "NAVRANGPURA", phone: "9876543211", createdAt: todayISO(),
            patients: {
                "0003": {
                    id: "0003", name: "SHARMA AMITBHAI DINESHBHAI", relation: "Head", age: 50, bloodGroup: "A+", allergy: "",
                    visits: []
                },
                "0004": {
                    id: "0004", name: "SHARMA NEHABEN AMITBHAI", relation: "Wife", age: 48, bloodGroup: "A+", allergy: "",
                    visits: [
                        { id: "v2", caseId: "0002000401", visitNum: 1, date: todayISO(), time: "11:00", weight: "62", bp: "110/70", refDr: "Self", diagnosis: "Acidity", complaint: "Stomach pain", treatment: [{ name: "Consultation", qty: "1" }], prescription: [{ name: "Pantoprazole", qty: "5", mor: "1", noon: "0", eve: "0", ngt: "0" }], charge: 400, received: 400, due: 0 }
                    ]
                },
                "0005": {
                    id: "0005", name: "SHARMA RAHUL AMITBHAI", relation: "Son", age: 22, bloodGroup: "AB+", allergy: "",
                    visits: []
                }
            }
        },
        "0003": {
            id: "0003", headName: "SHAH RAHULBHAI RAJENDRABHAI", area: "SATELLITE", phone: "9876543212", createdAt: todayISO(),
            patients: {
                "0006": {
                    id: "0006", name: "SHAH RAHULBHAI RAJENDRABHAI", relation: "Head", age: 38, bloodGroup: "O+", allergy: "",
                    visits: []
                },
                "0007": {
                    id: "0007", name: "SHAH KINJALBEN RAHULBHAI", relation: "Wife", age: 35, bloodGroup: "O+", allergy: "",
                    visits: [
                        { id: "v3", caseId: "0003000701", visitNum: 1, date: todayISO(), time: "12:30", weight: "60", bp: "120/80", refDr: "Self", diagnosis: "Migraine", complaint: "Headache", treatment: [{ name: "Consultation", qty: "1" }], prescription: [{ name: "Crocin", qty: "5", mor: "1", noon: "0", eve: "0", ngt: "0" }], charge: 600, received: 0, due: 600 }
                    ]
                }
            }
        },
        "0004": {
            id: "0004", headName: "DESAI SUNITABEN MAHESHBHAI", area: "BOPAL", phone: "9876543213", createdAt: todayISO(),
            patients: {
                "0008": {
                    id: "0008", name: "DESAI SUNITABEN MAHESHBHAI", relation: "Head", age: 60, bloodGroup: "B+", allergy: "PEANUTS",
                    visits: []
                }
            }
        },
        "0005": {
            id: "0005", headName: "MEHTA VIKRAMBHAI SANJAYBHAI", area: "THALTEJ", phone: "9876543214", createdAt: todayISO(),
            patients: {
                "0009": {
                    id: "0009", name: "MEHTA VIKRAMBHAI SANJAYBHAI", relation: "Head", age: 28, bloodGroup: "AB-", allergy: "",
                    visits: [
                        { id: "v4", caseId: "0005000901", visitNum: 1, date: todayISO(), time: "09:30", weight: "70", bp: "120/80", refDr: "Self", diagnosis: "Fever", complaint: "Mild fever", treatment: [{ name: "Consultation", qty: "1" }], prescription: [], charge: 500, received: 500, due: 0 }
                    ]
                },
                "0010": {
                    id: "0010", name: "MEHTA SANJAYBHAI NATVERLAL", relation: "Father", age: 62, bloodGroup: "A+", allergy: "",
                    visits: []
                }
            }
        },
    },
});

/* ---- Data query helpers ---- */
export function allPatientsFlat(db) {
    const rows = [];
    if (!db) return rows;
    Object.values(db.families).forEach((fam) => {
        Object.values(fam.patients).forEach((pat) => {
            const totalDue = pat.visits.reduce((s, v) => s + (Number(v.due) || 0), 0);
            const lastVisit = pat.visits[pat.visits.length - 1];
            rows.push({ fam, pat, totalDue, lastVisit });
        });
    });
    return rows;
}

export function searchFamilies(db, query) {
    if (!db) return [];
    const q = query.trim().toLowerCase();
    if (!q) return Object.values(db.families);

    return Object.values(db.families).filter((f) => {
        if (f.headName.toLowerCase().includes(q) || f.id === q || (f.area || "").toLowerCase().includes(q)) return true;
        // Check if any member matches
        return Object.values(f.patients).some((p) => p.name.toLowerCase().includes(q));
    });
}

export function makeCaseId(famId, patId, visitNum) {
    return pad(famId, 2) + pad(patId, 2) + pad(visitNum, 2);
}
