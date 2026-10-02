const MasterData = require('../models/MasterData');

// Default initial data for master collections
const DEFAULT_MASTERS = {
  complaints: [
    { id: 'c1', name: 'Fever / High Temperature', category: 'General', description: 'Body temperature above 100°F with chills' },
    { id: 'c2', name: 'Cough / Cold / Sore Throat', category: 'Respiratory', description: 'Dry or productive throat irritation and congestion' },
    { id: 'c3', name: 'Headache / Migraine', category: 'Neurological', description: 'Frontal or throbbing head pain' },
    { id: 'c4', name: 'Chest Pain / Discomfort', category: 'Cardiovascular', description: 'Substernal tightness or radiating pain' },
    { id: 'c5', name: 'Acidity / Heartburn / Gastric Pain', category: 'Gastrointestinal', description: 'Epigastric burning sensation after meals' },
    { id: 'c6', name: 'Joint Pain / Knee Swelling', category: 'Orthopedic', description: 'Arthritic pain and stiffness' },
    { id: 'c7', name: 'General Weakness / Fatigue', category: 'General', description: 'Lethargy and malaise' },
    { id: 'c8', name: 'Hypertension Check / Giddiness', category: 'Cardiovascular', description: 'Dizziness and elevated blood pressure' },
    { id: 'c9', name: 'High Blood Sugar / Polyuria', category: 'Endocrine', description: 'Excessive thirst and urination' },
    { id: 'c10', name: 'Nausea / Vomiting', category: 'Gastrointestinal', description: 'Stomach upset and regurgitation' },
  ],
  investigations: [
    { id: 'inv1', name: 'Complete Blood Count (CBC)', category: 'Blood / Hematology', sampleType: 'Whole Blood (EDTA)', description: 'Hb, TLC, DLC, Platelet count assessment' },
    { id: 'inv2', name: 'Blood Sugar Fasting & PP (FBS/PPBS)', category: 'Biochemistry', sampleType: 'Fluoride Plasma', description: 'Glycemic control and diabetes evaluation' },
    { id: 'inv3', name: 'HbA1c (Glycated Hemoglobin)', category: 'Biochemistry', sampleType: 'Whole Blood (EDTA)', description: '3-month average blood glucose level' },
    { id: 'inv4', name: 'Lipid Profile Complete', category: 'Biochemistry', sampleType: 'Serum', description: 'Cholesterol, Triglycerides, HDL, LDL, VLDL' },
    { id: 'inv5', name: 'Liver Function Test (LFT)', category: 'Biochemistry', sampleType: 'Serum', description: 'SGPT, SGOT, Bilirubin, Alkaline Phosphatase' },
    { id: 'inv6', name: 'Renal / Kidney Function Test (KFT/RFT)', category: 'Biochemistry', sampleType: 'Serum', description: 'Serum Creatinine, Blood Urea, Uric Acid' },
    { id: 'inv7', name: 'Urine Routine & Microscopic (R/M)', category: 'Pathology', sampleType: 'Clean Catch Urine', description: 'Pus cells, Albumin, Sugar, RBCs in urine' },
    { id: 'inv8', name: '12-Lead ECG (Electrocardiogram)', category: 'Cardiology', sampleType: '12-Lead Tracing', description: 'Cardiac rhythm and ST-T segment evaluation' },
  ],
  medicines: [
    { id: 'm1', name: 'Paracetamol 650mg (Dolo 650 / Calpol)', category: 'Antipyretic / Analgesic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 5 },
    { id: 'm2', name: 'Paracetamol 500mg (Crocin)', category: 'Antipyretic / Analgesic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 4 },
    { id: 'm3', name: 'Ibuprofen 400mg (Brufen)', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 6 },
    { id: 'm4', name: 'Combiflam (Ibuprofen + Paracetamol)', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 7 },
    { id: 'm5', name: 'Zerodol-P (Aceclofenac 100mg + Paracetamol 325mg)', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 9 },
    { id: 'm6', name: 'Amoxicillin 500mg (Novamox 500)', category: 'Antibiotic (Penicillin)', form: 'Capsule', defaultDosage: '1-0-1 AF', unitPrice: 12 },
    { id: 'm7', name: 'Augmentin 625 (Amoxyclav 625 Duo)', category: 'Broad Spectrum Antibiotic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 22 },
    { id: 'm8', name: 'Azithromycin 500mg (Azithral 500)', category: 'Macrolide Antibiotic', form: 'Tablet', defaultDosage: '1-0-0 OD', unitPrice: 20 },
    { id: 'm9', name: 'Pantoprazole 40mg (Pan 40 / Pantocid)', category: 'Antacid / PPI', form: 'Tablet', defaultDosage: '1-0-0 BF', unitPrice: 8 },
    { id: 'm10', name: 'Pantoprazole + Domperidone (Pan-D)', category: 'Antacid / PPI + Prokinetic', form: 'Capsule', defaultDosage: '1-0-0 BF', unitPrice: 14 },
    { id: 'm11', name: 'Cetirizine 10mg (Cetzine / Alerid)', category: 'Antihistamine / Allergy', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 4 },
    { id: 'm12', name: 'Montair-LC (Levocetirizine + Montelukast)', category: 'Allergic Rhinitis / Asthma', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 16 },
  ],
  allergies: [
    { id: 'al1', name: 'None', category: 'General', severity: 'None' },
    { id: 'al2', name: 'Penicillin', category: 'Drug Allergy', severity: 'Severe' },
    { id: 'al3', name: 'Sulfa Drugs', category: 'Drug Allergy', severity: 'Moderate' },
    { id: 'al4', name: 'Aspirin / NSAIDs', category: 'Drug Allergy', severity: 'Moderate' },
    { id: 'al5', name: 'Dust / Pollen', category: 'Environmental', severity: 'Mild' },
    { id: 'al6', name: 'Peanuts / Nuts', category: 'Food Allergy', severity: 'Severe' },
  ],
  relations: [
    { id: 'r1', name: 'Head', category: 'Primary', description: 'Head of Family' },
    { id: 'r2', name: 'Wife', category: 'Spouse', description: 'Wife of Head' },
    { id: 'r3', name: 'Husband', category: 'Spouse', description: 'Husband of Head' },
    { id: 'r4', name: 'Son', category: 'Child', description: 'Son of Head' },
    { id: 'r5', name: 'Daughter', category: 'Child', description: 'Daughter of Head' },
    { id: 'r6', name: 'Father', category: 'Parent', description: 'Father of Head' },
    { id: 'r7', name: 'Mother', category: 'Parent', description: 'Mother of Head' },
    { id: 'r8', name: 'Brother', category: 'Sibling', description: 'Brother of Head' },
    { id: 'r9', name: 'Sister', category: 'Sibling', description: 'Sister of Head' },
    { id: 'r10', name: 'Other', category: 'Other', description: 'Other Relation' },
  ],
  areas: [
    { id: 'a1', name: 'Main Road', city: 'Ahmedabad', pincode: '380001' },
    { id: 'a2', name: 'Vastrapur', city: 'Ahmedabad', pincode: '380015' },
    { id: 'a3', name: 'Satellite', city: 'Ahmedabad', pincode: '380015' },
    { id: 'a4', name: 'Navrangpura', city: 'Ahmedabad', pincode: '380009' },
    { id: 'a5', name: 'Bopal', city: 'Ahmedabad', pincode: '380058' },
    { id: 'a6', name: 'Thaltej', city: 'Ahmedabad', pincode: '380059' },
  ],
  societies: [
    { id: 's1', name: 'Shanti Niketan Apt', area: 'Vastrapur' },
    { id: 's2', name: 'Gokuldham Society', area: 'Navrangpura' },
    { id: 's3', name: 'Surya Kiran Heights', area: 'Satellite' },
    { id: 's4', name: 'Parijat Residency', area: 'Bopal' },
    { id: 's5', name: 'Royal Residency', area: 'Thaltej' },
  ],
  customShortcuts: [
    { id: 'sc1', key: 'F1', target: 'family', title: 'Family Head Registration', category: 'Navigation' },
    { id: 'sc2', key: 'F2', target: 'patient', title: 'Add Family Member', category: 'Navigation' },
    { id: 'sc3', key: 'F3', target: 'case', title: 'Patient Record & Case', category: 'Navigation' },
    { id: 'sc4', key: 'F4', target: 'dashboard', title: 'Clinical Dashboard', category: 'Navigation' },
    { id: 'sc5', key: 'F5', target: 'reports', title: 'Clinical Reports', category: 'Navigation' },
    { id: 'sc6', key: 'F6', target: 'certificates', title: 'Medical Certificate', category: 'Navigation' },
    { id: 'sc7', key: 'F7', target: 'masters', title: 'Master Data Setup', category: 'Navigation' },
    { id: 'sc8', key: 'F8', target: 'feedback', title: 'Send Complaint / Feedback', category: 'Support' },
    { id: 'sc9', key: '/', target: 'quick_search', title: 'Quick Global Search', category: 'Action' },
    { id: 'sc10', key: 'Esc', target: 'close_modal', title: 'Close Modal / Unfocus', category: 'Action' },
  ],
  clinicShortcuts: {
    medicines: {},
    complaints: {},
    investigations: {},
    allergies: {},
    relations: {},
    areas: {},
    societies: {},
  },
};

// Get master data collection by type
const getMasterCollection = async (req, res) => {
  try {
    const { type } = req.params;
    const clinicId = req.headers['x-clinic-id'] || 'shared';

    let doc = await MasterData.findOne({ clinicId, type });
    if (!doc && clinicId !== 'shared') {
      // Fallback to shared
      doc = await MasterData.findOne({ clinicId: 'shared', type });
    }

    if (!doc) {
      const initialItems = DEFAULT_MASTERS[type] || [];
      // Seed to MongoDB if missing
      doc = new MasterData({ clinicId: 'shared', type, items: initialItems });
      await doc.save().catch(() => {});
    }

    res.json({ success: true, count: Array.isArray(doc.items) ? doc.items.length : 1, data: doc.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all master collections in one payload
const getAllMasters = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || 'shared';
    const types = Object.keys(DEFAULT_MASTERS);
    const result = {};

    for (const t of types) {
      let doc = await MasterData.findOne({ clinicId, type: t });
      if (!doc && clinicId !== 'shared') {
        doc = await MasterData.findOne({ clinicId: 'shared', type: t });
      }
      if (!doc) {
        doc = new MasterData({ clinicId: 'shared', type: t, items: DEFAULT_MASTERS[t] });
        await doc.save().catch(() => {});
      }
      result[t] = doc.items;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add or update an item in a master collection
const saveMasterCollection = async (req, res) => {
  try {
    const { type } = req.params;
    const { items } = req.body;
    const clinicId = req.headers['x-clinic-id'] || 'shared';

    if (items === undefined) {
      return res.status(400).json({ success: false, message: 'items payload is required' });
    }

    const updated = await MasterData.findOneAndUpdate(
      { clinicId, type },
      { items },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: `Master collection "${type}" saved to MongoDB`, data: updated.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  DEFAULT_MASTERS,
  getMasterCollection,
  getAllMasters,
  saveMasterCollection,
};
