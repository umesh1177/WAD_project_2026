const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const { aggregateClinicStats } = require('./services/reportService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const familyRoutes = require('./routes/familyRoutes');
const patientRoutes = require('./routes/patientRoutes');
const historyRoutes = require('./routes/historyRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const billingRoutes = require('./routes/billingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const followUpRoutes = require('./routes/followUpRoutes');

const app = express();

// Connect Database and Seed Initial Data if Empty
const Family = require('./models/Family');
const Patient = require('./models/Patient');
const Consultation = require('./models/Consultation');
const Appointment = require('./models/Appointment');
const FollowUp = require('./models/FollowUp');
const Bill = require('./models/Bill');
const { todayISO } = require('./utils/generateId');

const seedDemoData = async () => {
  try {
    const curDate = todayISO();
    const famCount = await Family.countDocuments({ clinicId: 'demo' });
    if (famCount < 4) {
      console.log('[Database Seeding]: Seeding initial rich clinic demo dataset...');
      
      // Clean previous demo data
      await Family.deleteMany({ clinicId: 'demo' });
      await Patient.deleteMany({ clinicId: 'demo' });
      await Consultation.deleteMany({ clinicId: 'demo' });
      await Appointment.deleteMany({ clinicId: 'demo' });
      await FollowUp.deleteMany({ clinicId: 'demo' });
      await Bill.deleteMany({ clinicId: 'demo' });

      // Family 1 - Vastrapur
      await new Family({
        famId: '000120260001',
        headName: 'PATEL RAMESHBHAI GOVINDBHAI',
        society: 'Shanti Niketan Apt',
        registeredBy: 'Self',
        area: 'VASTRAPUR',
        phone: '9876543210',
        year: 2026,
        sequence: 1,
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00010001',
        familyId: '000120260001',
        name: 'PATEL RAMESHBHAI GOVINDBHAI',
        relation: 'Head',
        age: '46',
        bloodGroup: 'O+',
        allergy: 'Dust / Pollen',
        phone: '9876543210',
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00010002',
        familyId: '000120260001',
        name: 'PATEL SHARDABEN RAMESHBHAI',
        relation: 'Wife',
        age: '43',
        bloodGroup: 'B+',
        allergy: 'Penicillin',
        phone: '9876543210',
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00010003',
        familyId: '000120260001',
        name: 'PATEL DHRUVIL RAMESHBHAI',
        relation: 'Son',
        age: '19',
        bloodGroup: 'O+',
        allergy: 'None',
        phone: '9876543210',
        clinicId: 'demo',
      }).save();

      await new Consultation({
        caseId: '00012026000101',
        visitNum: 1,
        patientId: '00010001',
        familyId: '000120260001',
        clinicId: 'demo',
        date: curDate,
        time: '09:30 AM',
        weight: '74',
        bp: '130/85',
        sugar: '110',
        reference: 'Dr. Shah',
        diagnosis: 'Acute Viral Pyrexia',
        complaint: 'High fever, body chills and shivering for 2 days',
        treatment: [{ name: 'Clinical Consultation', qty: 1, cost: 300 }, { name: 'Injection Paracetamol IM', qty: 1, cost: 300 }],
        prescription: [{ name: 'Paracetamol 650mg', qty: '10', mor: '1', noon: '1', eve: '1', ngt: '0', timing: 'AF' }],
        charge: 600,
        received: 600,
        due: 0,
      }).save();

      // Family 2 - Navrangpura
      await new Family({
        famId: '000120260002',
        headName: 'SHARMA AMITBHAI DINESHBHAI',
        society: 'Gokuldham Society',
        registeredBy: 'Self',
        area: 'NAVRANGPURA',
        phone: '9876543211',
        year: 2026,
        sequence: 2,
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00020001',
        familyId: '000120260002',
        name: 'SHARMA AMITBHAI DINESHBHAI',
        relation: 'Head',
        age: '50',
        bloodGroup: 'A+',
        allergy: 'None',
        phone: '9876543211',
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00020002',
        familyId: '000120260002',
        name: 'SHARMA PRIYABEN AMITBHAI',
        relation: 'Wife',
        age: '47',
        bloodGroup: 'A+',
        allergy: 'Sulfa Drugs',
        phone: '9876543211',
        clinicId: 'demo',
      }).save();

      await new Consultation({
        caseId: '00012026000201',
        visitNum: 1,
        patientId: '00020002',
        familyId: '000120260002',
        clinicId: 'demo',
        date: curDate,
        time: '10:15 AM',
        weight: '58',
        bp: '118/78',
        reference: 'Self',
        diagnosis: 'Acute Upper Respiratory Tract Infection (URTI)',
        complaint: 'Severe sore throat, dry painful cough and mild fever',
        treatment: [{ name: 'Consultation & Throat Examination', qty: 1, cost: 500 }],
        prescription: [{ name: 'Amoxicillin 500mg', qty: '10', mor: '1', noon: '0', eve: '1', ngt: '0', timing: 'AF' }],
        charge: 500,
        received: 500,
        due: 0,
      }).save();

      // Family 3 - Satellite
      await new Family({
        famId: '000120260003',
        headName: 'DESAI BHUPENDRABHAI KANTILAL',
        society: 'Surya Kiran Heights',
        registeredBy: 'Self',
        area: 'SATELLITE',
        phone: '9876543212',
        year: 2026,
        sequence: 3,
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00030001',
        familyId: '000120260003',
        name: 'DESAI BHUPENDRABHAI KANTILAL',
        relation: 'Head',
        age: '58',
        bloodGroup: 'B+',
        allergy: 'None',
        phone: '9876543212',
        clinicId: 'demo',
      }).save();

      await new Patient({
        patId: '00030003',
        familyId: '000120260003',
        name: 'DESAI KANTABEN KANTILAL',
        relation: 'Mother',
        age: '82',
        bloodGroup: 'O+',
        allergy: 'Aspirin / NSAIDs',
        phone: '9876543212',
        clinicId: 'demo',
      }).save();

      await new Consultation({
        caseId: '00012026000301',
        visitNum: 1,
        patientId: '00030001',
        familyId: '000120260003',
        clinicId: 'demo',
        date: curDate,
        time: '11:00 AM',
        weight: '82',
        bp: '142/92',
        sugar: '138',
        reference: 'Dr. Mehta',
        diagnosis: 'Chronic Gastritis & Mild Hypertension',
        complaint: 'Chest burning after spicy meals, chronic acidity and belching',
        treatment: [{ name: 'Clinical Consultation', qty: 1, cost: 500 }],
        prescription: [{ name: 'Pantoprazole 40mg', qty: '15', mor: '1', noon: '0', eve: '0', ngt: '0', timing: 'BF' }],
        charge: 500,
        received: 250,
        due: 250,
      }).save();

      await new Consultation({
        caseId: '00012026000302',
        visitNum: 1,
        patientId: '00030003',
        familyId: '000120260003',
        clinicId: 'demo',
        date: curDate,
        time: '11:45 AM',
        weight: '54',
        bp: '135/85',
        sugar: '98',
        reference: '',
        diagnosis: 'Primary Osteoarthritis of Both Knees',
        complaint: 'Severe bilateral knee pain, difficulty walking and swelling',
        treatment: [{ name: 'Orthopaedic Knee Checkup', qty: 1, cost: 750 }],
        prescription: [{ name: 'Paracetamol 650mg', qty: '10', mor: '1', noon: '0', eve: '1', ngt: '0', timing: 'AF' }],
        charge: 750,
        received: 750,
        due: 0,
      }).save();

      // Seed Appointments
      await Appointment.insertMany([
        { patientId: '00010001', patientName: 'PATEL RAMESHBHAI GOVINDBHAI', appointmentDate: curDate, appointmentTime: '09:30 AM', reason: 'Fever & Bodyache Follow-up', status: 'completed', clinicId: 'demo' },
        { patientId: '00020002', patientName: 'SHARMA PRIYABEN AMITBHAI', appointmentDate: curDate, appointmentTime: '10:15 AM', reason: 'Severe Sore Throat & Dry Cough', status: 'completed', clinicId: 'demo' },
        { patientId: '00030001', patientName: 'DESAI BHUPENDRABHAI KANTILAL', appointmentDate: curDate, appointmentTime: '11:00 AM', reason: 'Acid Reflux & Chest Discomfort', status: 'completed', clinicId: 'demo' },
        { patientId: '00040001', patientName: 'SHAH JIGNESHBHAI PRAVINCHANDRA', appointmentDate: curDate, appointmentTime: '04:00 PM', reason: 'Severe Migraine Headache SOS', status: 'in-progress', clinicId: 'demo' },
        { patientId: '00050001', patientName: 'PRAJAPATI MANISHBHAI KANUBHAI', appointmentDate: curDate, appointmentTime: '05:30 PM', reason: 'Routine BP & Blood Sugar Check', status: 'scheduled', clinicId: 'demo' },
        { patientId: '00060001', patientName: 'MEHTA RAJESHBHAI CHANDRAKANT', appointmentDate: curDate, appointmentTime: '06:15 PM', reason: 'Cholesterol & Lipid Profile Review', status: 'scheduled', clinicId: 'demo' },
      ]);

      // Seed FollowUps
      await FollowUp.insertMany([
        { patientId: '00010001', patientName: 'PATEL RAMESHBHAI GOVINDBHAI', followUpDate: curDate, reason: 'Platelet Count & Dengue Serology Recheck', status: 'Pending', clinicId: 'demo' },
        { patientId: '00030001', patientName: 'DESAI BHUPENDRABHAI KANTILAL', followUpDate: curDate, reason: 'Endoscopy & H. Pylori Report Review', status: 'Pending', clinicId: 'demo' },
        { patientId: '00030003', patientName: 'DESAI KANTABEN KANTILAL', followUpDate: '2026-10-04', reason: 'Bilateral Knee Joint Pain Follow-up', status: 'Pending', clinicId: 'demo' },
        { patientId: '00040001', patientName: 'SHAH JIGNESHBHAI PRAVINCHANDRA', followUpDate: '2026-10-06', reason: 'Migraine Prophylaxis Assessment', status: 'Pending', clinicId: 'demo' },
      ]);

      // Seed Bills
      await Bill.insertMany([
        { billNo: 'INV-2026-001', billDate: curDate, patientId: '00010001', patientName: 'PATEL RAMESHBHAI GOVINDBHAI', totalCharge: 600, paidAmount: 600, dueAmount: 0, status: 'Paid', clinicId: 'demo' },
        { billNo: 'INV-2026-002', billDate: curDate, patientId: '00020002', patientName: 'SHARMA PRIYABEN AMITBHAI', totalCharge: 500, paidAmount: 500, dueAmount: 0, status: 'Paid', clinicId: 'demo' },
        { billNo: 'INV-2026-003', billDate: curDate, patientId: '00030001', patientName: 'DESAI BHUPENDRABHAI KANTILAL', totalCharge: 500, paidAmount: 250, dueAmount: 250, status: 'Partial', clinicId: 'demo' },
        { billNo: 'INV-2026-004', billDate: curDate, patientId: '00030003', patientName: 'DESAI KANTABEN KANTILAL', totalCharge: 750, paidAmount: 750, dueAmount: 0, status: 'Paid', clinicId: 'demo' },
      ]);

      console.log('[Database Seeding]: Rich demo dataset seeded successfully.');
    }
  } catch (err) {
    console.warn('[Database Seeding Warning]:', err.message);
  }
};

connectDB().then(() => {
  seedDemoData();
});

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend serving
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Clinic Management System API',
  });
});

// Reports summary endpoint
app.get('/api/reports/stats', authMiddleware, async (req, res, next) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { date } = req.query;
    const stats = await aggregateClinicStats(clinicId, date);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// API Routes Mounting (with singular & plural compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/bills', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/followup', followUpRoutes);

// SPA / direct route fallback for frontend pages
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Clinic API Server running on port ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
