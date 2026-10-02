require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const { aggregateClinicStats } = require('./services/reportService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const masterRoutes = require('./routes/masterRoutes');
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
const feedbackRoutes = require('./routes/feedbackRoutes');

// Models
const Clinic = require('./models/Clinic');
const ClinicRequest = require('./models/ClinicRequest');
const User = require('./models/User');
const Family = require('./models/Family');
const Patient = require('./models/Patient');
const Consultation = require('./models/Consultation');
const Appointment = require('./models/Appointment');
const FollowUp = require('./models/FollowUp');
const Bill = require('./models/Bill');
const MasterData = require('./models/MasterData');
const AuditLog = require('./models/AuditLog');
const { DEFAULT_MASTERS } = require('./controllers/masterController');
const { todayISO } = require('./utils/generateId');

const app = express();

// Database Seeding
const seedDemoData = async () => {
  try {
    const curDate = todayISO();

    // 1. Seed Clinics if empty
    const clinicCount = await Clinic.countDocuments();
    if (clinicCount === 0) {
      console.log('[Database Seeding]: Seeding default clinics to MongoDB...');
      await Clinic.insertMany([
        {
          clinicId: 'CLN-001',
          name: 'Dhyey Main Clinic',
          city: 'Ahmedabad',
          doctorsCount: 12,
          status: 'Active',
          services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
          receptionist: {
            name: 'Pooja Sharma',
            email: 'pooja.reception@dhyeyclinic.com',
            phone: '9876543210',
            shift: 'Morning Shift (08:00 AM - 03:00 PM)',
            status: 'Active',
          },
          specialties: 'General Medicine, Cardiology, Pediatrics',
          facilities: 'Pharmacy, Pathology Lab, ECG, Emergency Care',
          phone: '9876543210',
          email: 'contact@dhyeyclinic.com',
          registration: 'GUJ-MED-2026-001',
          address: '101, Medical Enclave, CG Road, Navrangpura, Ahmedabad, Gujarat - 380009',
          days: 'Monday - Saturday',
          hours: '08:30 AM - 08:30 PM',
          verifiedDocuments: 13,
        },
        {
          clinicId: 'CLN-002',
          name: 'Satellite Wellness Centre',
          city: 'Ahmedabad',
          doctorsCount: 7,
          status: 'Active',
          services: ['receptionist', 'appointment', 'digitalPrescription', 'billing'],
          receptionist: {
            name: 'Kavita Dave',
            email: 'kavita.reception@satelliteclinic.com',
            phone: '9876543222',
            shift: 'Full Day (09:00 AM - 07:00 PM)',
            status: 'Active',
          },
          specialties: 'Dermatology, Cosmetology, Trichology',
          facilities: 'Laser Suite, Minor Procedure Room',
          phone: '9876543222',
          email: 'help@satelliteclinic.com',
          registration: 'GUJ-MED-2026-002',
          address: '304, Titanium City Centre, Anandnagar Road, Satellite, Ahmedabad, Gujarat - 380015',
          days: 'Monday - Saturday',
          hours: '09:00 AM - 08:00 PM',
          verifiedDocuments: 8,
        },
        {
          clinicId: 'CLN-003',
          name: 'Riverside Family Care',
          city: 'Gandhinagar',
          doctorsCount: 4,
          status: 'Active',
          services: ['digitalPrescription', 'billing'],
          receptionist: null,
          specialties: 'Family Medicine, Gynecology, Geriatrics',
          facilities: 'Vaccination Centre, Ultrasound',
          phone: '9876543233',
          email: 'info@riversidecare.com',
          registration: 'GUJ-MED-2026-003',
          address: '12, Riverside Arcades, Sector 11, Gandhinagar, Gujarat - 382010',
          days: 'Monday - Friday',
          hours: '10:00 AM - 06:00 PM',
          verifiedDocuments: 5,
        },
      ]);
    }

    // 2. Seed Default Users / Accounts to MongoDB
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database Seeding]: Seeding default users to MongoDB...');
      const adminPass = await bcrypt.hash('admin', 10);
      const docPass = await bcrypt.hash('123', 10);

      await User.insertMany([
        {
          username: 'admin',
          password: adminPass,
          role: 'admin',
          name: 'System Administrator',
          email: 'admin@dhyeyclinic.com',
        },
        {
          username: 'dhyey',
          password: docPass,
          role: 'doctor',
          name: 'Dr. Chirag Paghdal',
          email: 'dr.chirag@dhyeyclinic.com',
          specialization: 'General Physician & Family Medicine',
          degree: 'B.H.M.S.',
          regNo: 'G-9035',
          activeClinicId: 'CLN-001',
          clinics: [{ id: 'CLN-001', name: 'Dhyey Main Clinic' }],
        },
        {
          username: 'mehul',
          password: docPass,
          role: 'doctor',
          name: 'Dr. Mehul Shah',
          email: 'dr.mehul@dhyeyclinic.com',
          specialization: 'General Medicine',
          degree: 'M.D. (Medicine)',
          regNo: 'G-8821',
          activeClinicId: 'CLN-001',
          clinics: [{ id: 'CLN-001', name: 'Dhyey Main Clinic' }],
        },
        {
          username: 'riya',
          password: docPass,
          role: 'doctor',
          name: 'Dr. Riya Patel',
          email: 'dr.riya@satelliteclinic.com',
          specialization: 'Dermatology & Cosmetology',
          degree: 'M.D. (Dermatology)',
          regNo: 'G-9411',
          activeClinicId: 'CLN-002',
          clinics: [{ id: 'CLN-002', name: 'Satellite Wellness Centre' }],
        },
        {
          username: 'pooja',
          password: docPass,
          role: 'receptionist',
          name: 'Pooja Sharma',
          email: 'pooja.reception@dhyeyclinic.com',
          activeClinicId: 'CLN-001',
          clinics: [{ id: 'CLN-001', name: 'Dhyey Main Clinic' }],
        },
      ]);
    }

    // 3. Seed Clinic Registration Requests to MongoDB
    const reqCount = await ClinicRequest.countDocuments();
    if (reqCount === 0) {
      console.log('[Database Seeding]: Seeding default clinic requests to MongoDB...');
      await ClinicRequest.insertMany([
        {
          requestId: 'REQ-101',
          clinicId: 'CLN-004',
          name: 'Sterling Multispeciality Clinic',
          city: 'Gandhinagar',
          registrationNumber: 'REG-GJ-2026-9912',
          phone: '+91 98250 12345',
          email: 'info@sterlingclinic.com',
          address: '402, Titanium City Centre, Sector 11, Gandhinagar',
          operatingDays: 'Monday - Saturday',
          workingHours: '09:00 - 21:00',
          specialties: 'General Medicine, Cardiology, Orthopedics',
          facilities: 'Pharmacy, Path Lab, Minor OT, ECG',
          applicantName: 'Dr. Ramesh S. Parikh',
          applicantRole: 'Medical Director',
          doctorsCount: 2,
          doctors: [
            { name: 'Dr. Ramesh S. Parikh', specialty: 'Cardiology', registration: 'MCI-88291' },
            { name: 'Dr. Sunita K. Sharma', specialty: 'General Medicine', registration: 'MCI-91024' },
          ],
          status: 'Pending',
          formattedDate: 'Today, 09:30 AM',
          submittedFrom: 'Landing Page',
        },
        {
          requestId: 'REQ-102',
          clinicId: 'CLN-005',
          name: 'Aura Health & Skin Clinic',
          city: 'Ahmedabad',
          registrationNumber: 'REG-GJ-2026-7841',
          phone: '+91 98790 54321',
          email: 'contact@auraskinclinic.com',
          address: '2nd Floor, Safal Pegasuss, Prahlad Nagar, Ahmedabad',
          operatingDays: 'Monday - Saturday',
          workingHours: '10:00 - 19:00',
          specialties: 'Dermatology, Cosmetology',
          facilities: 'Laser Treatment, Minor OT',
          applicantName: 'Dr. Ananya Roy',
          applicantRole: 'Clinic Owner',
          doctorsCount: 1,
          doctors: [{ name: 'Dr. Ananya Roy', specialty: 'Dermatology', registration: 'MCI-76543' }],
          status: 'Approved',
          formattedDate: 'Yesterday, 04:15 PM',
          submittedFrom: 'Landing Page',
        },
      ]);
    }

    // 4. Seed Master Data Collections to MongoDB
    const masterCount = await MasterData.countDocuments();
    if (masterCount === 0) {
      console.log('[Database Seeding]: Seeding master data collections to MongoDB...');
      for (const [type, items] of Object.entries(DEFAULT_MASTERS)) {
        await new MasterData({ clinicId: 'shared', type, items }).save();
      }
    }

    // 5. Seed Audit Logs if empty
    const logCount = await AuditLog.countDocuments();
    if (logCount === 0) {
      await AuditLog.insertMany([
        { action: 'System Initialization', actor: 'System', module: 'Core', details: 'Database connection established and initial collections ready' },
        { action: 'Admin Portal Ready', actor: 'Administrator', module: 'Admin', details: 'MongoDB storage activated for all clinics and portals' },
      ]);
    }

    // 6. Seed Clinical Families, Patients, Consultations, Appointments, Bills
    const famCount = await Family.countDocuments({ clinicId: 'demo' });
    if (famCount < 4) {
      console.log('[Database Seeding]: Seeding initial rich clinic demo dataset to MongoDB...');
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
        society: 'Shanti Niketan Apt',
        area: 'VASTRAPUR',
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
        society: 'Shanti Niketan Apt',
        area: 'VASTRAPUR',
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
        society: 'Shanti Niketan Apt',
        area: 'VASTRAPUR',
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
        pulse: '76',
        reference: 'Dr. Shah',
        diagnosis: 'Acute Viral Pyrexia',
        complaint: 'High fever, body chills and shivering for 2 days',
        treatment: [
          { name: 'Clinical Consultation', qty: 1, cost: 300 },
          { name: 'Injection Paracetamol IM', qty: 1, cost: 300 },
        ],
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
        society: 'Gokuldham Society',
        area: 'NAVRANGPURA',
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
        society: 'Gokuldham Society',
        area: 'NAVRANGPURA',
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
        pulse: '72',
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
        society: 'Surya Kiran Heights',
        area: 'SATELLITE',
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
        society: 'Surya Kiran Heights',
        area: 'SATELLITE',
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
        pulse: '80',
        reference: 'Dr. Mehta',
        diagnosis: 'Chronic Gastritis & Mild Hypertension',
        complaint: 'Chest burning after spicy meals, chronic acidity and belching',
        treatment: [{ name: 'Clinical Consultation', qty: 1, cost: 500 }],
        prescription: [{ name: 'Pantoprazole 40mg', qty: '15', mor: '1', noon: '0', eve: '0', ngt: '0', timing: 'BF' }],
        charge: 500,
        received: 250,
        due: 250,
      }).save();

      // Seed Appointments
      await Appointment.insertMany([
        { patientId: '00010001', patientName: 'PATEL RAMESHBHAI GOVINDBHAI', appointmentDate: curDate, appointmentTime: '09:30 AM', reason: 'Fever & Bodyache Follow-up', status: 'completed', clinicId: 'demo', token: 'T-01' },
        { patientId: '00020002', patientName: 'SHARMA PRIYABEN AMITBHAI', appointmentDate: curDate, appointmentTime: '10:15 AM', reason: 'Severe Sore Throat & Dry Cough', status: 'completed', clinicId: 'demo', token: 'T-02' },
        { patientId: '00030001', patientName: 'DESAI BHUPENDRABHAI KANTILAL', appointmentDate: curDate, appointmentTime: '11:00 AM', reason: 'Acid Reflux & Chest Discomfort', status: 'completed', clinicId: 'demo', token: 'T-03' },
        { patientId: '00040001', patientName: 'SHAH JIGNESHBHAI PRAVINCHANDRA', appointmentDate: curDate, appointmentTime: '04:00 PM', reason: 'Severe Migraine Headache SOS', status: 'in-progress', clinicId: 'demo', token: 'T-04' },
        { patientId: '00050001', patientName: 'PRAJAPATI MANISHBHAI KANUBHAI', appointmentDate: curDate, appointmentTime: '05:30 PM', reason: 'Routine BP & Blood Sugar Check', status: 'scheduled', clinicId: 'demo', token: 'T-05' },
      ]);

      // Seed FollowUps
      await FollowUp.insertMany([
        { patientId: '00010001', patientName: 'PATEL RAMESHBHAI GOVINDBHAI', followUpDate: curDate, reason: 'Platelet Count & Dengue Serology Recheck', status: 'Pending', clinicId: 'demo' },
        { patientId: '00030001', patientName: 'DESAI BHUPENDRABHAI KANTILAL', followUpDate: curDate, reason: 'Endoscopy & H. Pylori Report Review', status: 'Pending', clinicId: 'demo' },
        { patientId: '00030003', patientName: 'DESAI KANTABEN KANTILAL', followUpDate: '2026-10-04', reason: 'Bilateral Knee Joint Pain Follow-up', status: 'Pending', clinicId: 'demo' },
      ]);

      // Seed Bills
      await Bill.insertMany([
        { billNo: 'INV-2026-001', billDate: curDate, patientId: '00010001', patientName: 'PATEL RAMESHBHAI GOVINDBHAI', totalCharge: 600, netAmount: 600, paidAmount: 600, dueAmount: 0, status: 'Paid', clinicId: 'demo' },
        { billNo: 'INV-2026-002', billDate: curDate, patientId: '00020002', patientName: 'SHARMA PRIYABEN AMITBHAI', totalCharge: 500, netAmount: 500, paidAmount: 500, dueAmount: 0, status: 'Paid', clinicId: 'demo' },
        { billNo: 'INV-2026-003', billDate: curDate, patientId: '00030001', patientName: 'DESAI BHUPENDRABHAI KANTILAL', totalCharge: 500, netAmount: 500, paidAmount: 250, dueAmount: 250, status: 'Partial', clinicId: 'demo' },
      ]);

      console.log('[Database Seeding]: Rich demo dataset seeded successfully to MongoDB.');
    }
  } catch (err) {
    console.warn('[Database Seeding Warning]:', err.message);
  }
};

connectDB().then(() => {
  seedDemoData();
});

// Global Middlewares
const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend serving
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Clinic Management System & Admin API',
    database: 'MongoDB Local (127.0.0.1:27017)',
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

// Clinic info endpoint — queried directly from MongoDB Clinic collection
app.get('/api/clinic/info', authMiddleware, async (req, res, next) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const clinicDoc = await Clinic.findOne({
      $or: [{ clinicId }, { clinicId: 'CLN-001' }],
    }).lean();

    const clinicInfo = {
      id: clinicDoc?.clinicId || clinicId,
      name: clinicDoc?.name || 'Dhyey Clinic & Nursing Home',
      address: clinicDoc?.address || '101, Medical Enclave, CG Road, Navrangpura, Ahmedabad',
      phone: clinicDoc?.phone || '9876543210',
      city: clinicDoc?.city || 'Ahmedabad',
      services: clinicDoc?.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
      receptionist: clinicDoc?.receptionist || null,
    };
    res.json({ success: true, data: clinicInfo });
  } catch (err) {
    next(err);
  }
});

// Patient Queue endpoints
app.get('/api/queue', authMiddleware, async (req, res, next) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const today = new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.find({ clinicId, appointmentDate: today }).sort({ createdAt: 1 }).lean();
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
});

app.post('/api/queue/push', authMiddleware, async (req, res, next) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, patientName, familyId, complaint, vitals, token } = req.body;
    const entry = new Appointment({
      patientId,
      patientName,
      familyId: familyId || '',
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      reason: complaint || 'OPD Consultation',
      status: 'scheduled',
      clinicId,
      token: token || '',
      vitals: vitals || {},
    });
    await entry.save();
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
});

// Receptionist portal static route
app.get('/reception', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/receptionist/dashboard.html'));
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/master', masterRoutes);
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
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', feedbackRoutes);

// Direct routes for admin, login, and public landing page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/admin/dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/landing.html'));
});

// SPA fallback for HTML pages
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `The API endpoint "${req.method} ${req.path}" does not exist. Please check the URL and try again.`,
    });
  }
  next();
});

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Clinic API Server running on port ${PORT}`);
  console.log(` Connected to MongoDB: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dhyey_clinic_db'}`);
  console.log(` Admin Portal:   http://localhost:${PORT}/pages/admin/dashboard.html`);
  console.log(` Doctor Portal:  http://localhost:${PORT}/pages/dashboard.html`);
  console.log(` Login Page:     http://localhost:${PORT}/pages/login.html`);
  console.log(`=========================================`);
});
