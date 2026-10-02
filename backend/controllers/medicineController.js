const Medicine = require('../models/Medicine');

// Default initial medicines for clinic
const DEFAULT_MEDS = [
  { name: 'Paracetamol 650mg', category: 'Antipyretic', form: 'Tablet', defaultDosage: '1-1-1', defaultTiming: 'AF', unitPrice: 2 },
  { name: 'Pantoprazole 40mg', category: 'Antacid', form: 'Tablet', defaultDosage: '1-0-0', defaultTiming: 'BF', unitPrice: 8 },
  { name: 'Amoxicillin 500mg', category: 'Antibiotic', form: 'Capsule', defaultDosage: '1-0-1', defaultTiming: 'AF', unitPrice: 12 },
  { name: 'Cetirizine 10mg', category: 'Antihistamine', form: 'Tablet', defaultDosage: '0-0-1', defaultTiming: 'AF', unitPrice: 3 },
  { name: 'Azithromycin 500mg', category: 'Antibiotic', form: 'Tablet', defaultDosage: '1-0-0', defaultTiming: 'AF', unitPrice: 20 },
  { name: 'Diclofenac Sodium 50mg', category: 'Analgesic', form: 'Tablet', defaultDosage: '1-0-1', defaultTiming: 'AF', unitPrice: 4 },
  { name: 'Cough Syrup (Ascoril D)', category: 'Respiratory', form: 'Syrup', defaultDosage: '1-1-1', defaultTiming: 'AF', unitPrice: 85 },
  { name: 'Metformin 500mg', category: 'Antidiabetic', form: 'Tablet', defaultDosage: '1-0-1', defaultTiming: 'BF', unitPrice: 4 },
  { name: 'Telmisartan 40mg', category: 'Antihypertensive', form: 'Tablet', defaultDosage: '1-0-0', defaultTiming: 'BF', unitPrice: 7 },
  { name: 'Multivitamin & Zinc', category: 'Supplement', form: 'Capsule', defaultDosage: '0-1-0', defaultTiming: 'AF', unitPrice: 6 },
];

// Get all medicines with optional search
const getMedicines = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { search } = req.query;

    let query = { clinicId };
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    let list = await Medicine.find(query).sort({ name: 1 });

    // Auto-seed default medicines if empty
    if (list.length === 0 && !search) {
      await Medicine.insertMany(DEFAULT_MEDS.map((m) => ({ ...m, clinicId })));
      list = await Medicine.find(query).sort({ name: 1 });
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create medicine
const createMedicine = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { name, genericName, category, form, defaultDosage, defaultTiming, unitPrice, inStock } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Medicine name is required' });
    }

    const newMed = new Medicine({
      name: name.trim(),
      genericName: (genericName || '').trim(),
      category: category || 'General',
      form: form || 'Tablet',
      defaultDosage: defaultDosage || '1-0-1',
      defaultTiming: defaultTiming || 'AF',
      unitPrice: Number(unitPrice || 0),
      inStock: Number(inStock || 100),
      clinicId,
    });

    await newMed.save();
    res.status(201).json({ success: true, message: 'Medicine added', data: newMed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update medicine
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Medicine.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, message: 'Medicine updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    await Medicine.findByIdAndDelete(id);
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
