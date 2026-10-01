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
const { todayISO } = require('./utils/generateId');

const seedDemoData = async () => {
  try {
    // Clear out any legacy format data with old 4-digit or hyphenated famIds
    await Family.deleteMany({
      clinicId: 'demo',
      $or: [
        { famId: { $in: ['0001', '0002'] } },
        { famId: { $regex: '-' } },
        { famId: { $exists: true, $where: 'this.famId && this.famId.length < 12' } }
      ]
    });
    await Patient.deleteMany({
      clinicId: 'demo',
      $or: [
        { familyId: { $in: ['0001', '0002'] } },
        { familyId: { $regex: '-' } },
        { patId: { $in: ['0001', '0002'] } },
        { patId: { $regex: '-' } },
        { patId: { $exists: true, $where: 'this.patId && this.patId.length < 12' } }
      ]
    });
    await Consultation.deleteMany({
      clinicId: 'demo',
      $or: [
        { familyId: { $in: ['0001', '0002'] } },
        { familyId: { $regex: '-' } },
        { patientId: { $in: ['0001', '0002'] } },
        { patientId: { $regex: '-' } }
      ]
    });

    const famCount = await Family.countDocuments({ clinicId: 'demo' });
    if (famCount === 0) {
      console.log('[Database Seeding]: Seeding initial demo clinic data with 12-digit ID format...');
      
      const f1 = new Family({
        famId: '000120260001',
        headName: 'PATEL RAMESHBHAI GOVINDBHAI',
        society: 'Shanti Niketan Apt',
        registeredBy: 'Self',
        area: 'VASTRAPUR',
        phone: '9876543210',
        year: 2026,
        sequence: 1,
        clinicId: 'demo'
      });
      await f1.save();

      const p1 = new Patient({
        patId: '000120260001',
        familyId: '000120260001',
        name: 'PATEL RAMESHBHAI GOVINDBHAI',
        relation: 'Head',
        age: '45',
        bloodGroup: 'O+',
        allergy: '',
        phone: '9876543210',
        clinicId: 'demo'
      });
      await p1.save();

      const p2 = new Patient({
        patId: '000120260002',
        familyId: '000120260001',
        name: 'PATEL SHARDABEN RAMESHBHAI',
        relation: 'Wife',
        age: '43',
        bloodGroup: 'B+',
        allergy: 'DUST',
        phone: '9876543210',
        clinicId: 'demo'
      });
      await p2.save();

      const v1 = new Consultation({
        caseId: '00012026000101',
        visitNum: 1,
        patientId: '000120260001',
        familyId: '000120260001',
        clinicId: 'demo',
        date: todayISO(),
        time: '10:15',
        weight: '75',
        bp: '130/80',
        reference: 'Dr. Shah',
        diagnosis: 'Viral Infection',
        complaint: 'Cough and Cold',
        treatment: [{ name: 'Clinical Checkup', qty: '1', cost: 300 }],
        prescription: [{ name: 'Paracetamol 650mg', qty: '10', mor: '1', noon: '1', eve: '1', ngt: '0', timing: 'AF' }],
        charge: 800,
        received: 500,
        due: 300
      });
      await v1.save();

      const f2 = new Family({
        famId: '000120260002',
        headName: 'SHARMA AMITBHAI DINESHBHAI',
        society: 'Gokuldham Society',
        registeredBy: 'Self',
        area: 'NAVRANGPURA',
        phone: '9876543211',
        year: 2026,
        sequence: 2,
        clinicId: 'demo'
      });
      await f2.save();

      const p3 = new Patient({
        patId: '000120260003',
        familyId: '000120260002',
        name: 'SHARMA AMITBHAI DINESHBHAI',
        relation: 'Head',
        age: '50',
        bloodGroup: 'A+',
        allergy: '',
        phone: '9876543211',
        clinicId: 'demo'
      });
      await p3.save();

      const v2 = new Consultation({
        caseId: '00012026000201',
        visitNum: 1,
        patientId: '000120260003',
        familyId: '000120260002',
        clinicId: 'demo',
        date: todayISO(),
        time: '11:00',
        weight: '62',
        bp: '110/70',
        reference: 'Self',
        diagnosis: 'Acidity',
        complaint: 'Stomach pain',
        treatment: [{ name: 'General Consultation', qty: '1', cost: 400 }],
        prescription: [{ name: 'Pantoprazole 40mg', qty: '5', mor: '1', noon: '0', eve: '0', ngt: '0', timing: 'BF' }],
        charge: 400,
        received: 400,
        due: 0
      });
      await v2.save();
      console.log('[Database Seeding]: Seeding complete.');
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
