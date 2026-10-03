const MasterData = require('../models/MasterData');

/**
 * Rich Default Clinical Dataset for 9 Master Navigation Tabs
 */
function getDefaultClinicMasterTabs() {
  return [
    {
      tabId: 'dietary',
      tabName: 'Dietary Suggestions',
      items: [
        {
          id: 'd1',
          code: 'DB',
          disease: 'Diabetes Mellitus',
          eat: 'Green leafy vegetables, Whole grains, Pulses, Fresh salads, Bitter gourd, Cucumbers, Oats, Water',
          avoid: 'Direct sugar, Sweets, Jaggery, Potatoes, Mangoes, Bananas, Bakery items, Soft drinks'
        },
        {
          id: 'd2',
          code: 'SUGAR',
          disease: 'High Blood Sugar / Diabetes',
          eat: 'Green leafy vegetables, Whole grains, Pulses, Salads, Bitter gourd, Cucumbers, Oats',
          avoid: 'Direct sugar, Sweets, Jaggery, Potatoes, Bakery items, Cold drinks'
        },
        {
          id: 'd3',
          code: 'BP',
          disease: 'Hypertension (High BP)',
          eat: 'Fresh fruits, Green vegetables, Oats, Garlic, Coconut water, Low-sodium food',
          avoid: 'Extra salt, Pickles, Papad, Processed cheese, Salty snacks, Fried items, Canned food'
        },
        {
          id: 'd4',
          code: 'ACID',
          disease: 'Acidity / GERD / Gastritis',
          eat: 'Cold milk, Coconut water, Bananas, Boiled vegetables, Oatmeal, Light home-cooked meals',
          avoid: 'Spicy curries, Oily/fried foods, Tea, Coffee, Citrus fruits, Late night heavy meals'
        },
        {
          id: 'd5',
          code: 'THYROID',
          disease: 'Thyroid Disorder',
          eat: 'Iodized salt, Whole grains, Fresh fruits, Brazil nuts, Fish, Eggs, Flaxseeds',
          avoid: 'Raw cabbage, Cauliflower, Broccoli, Excess soy, Gluten, Processed packaged food'
        },
        {
          id: 'd6',
          code: 'URIC',
          disease: 'High Uric Acid / Gout',
          eat: 'Cherries, Apples, Cucumbers, Plenty of water, Lemon water, Low-fat dairy, Barley water',
          avoid: 'Red meat, Seafood, Beer, Alcohol, High purine pulses, Tomatoes with seeds, Spinach'
        },
        {
          id: 'd7',
          code: 'STONE',
          disease: 'Kidney Stone',
          eat: '3-4 Litres water daily, Coconut water, Barley water, Citrus fruits (Lemons, Oranges)',
          avoid: 'Spinach (Palak), Tomatoes, Chocolates, Nuts, Excess salt, Non-veg items'
        },
        {
          id: 'd8',
          code: 'CONST',
          disease: 'Constipation & Indigestion',
          eat: 'High fibre foods, Green salads, Papaya, Warm milk at night, Plenty of fluids, Oats',
          avoid: 'Refined flour (Maida), Bakery bread, Fast food, Tea, Less water intake'
        },
        {
          id: 'd9',
          code: 'FEV',
          disease: 'Fever / Infection',
          eat: 'Light moong dal khichdi, Coconut water, Fresh fruit juices, Boiled warm water, Soups',
          avoid: 'Heavy meals, Oily foods, Cold drinks, Ice creams, Spicy curries, Outside food'
        },
        {
          id: 'd10',
          code: 'LIVER',
          disease: 'Fatty Liver / Jaundice',
          eat: 'Boiled vegetables, Papaya, Sugarcane juice, Green tea, Radish, Garlic, Light food',
          avoid: 'Alcohol, Oily fried items, Butter, Ghee, Spices, Heavy non-veg meals'
        },
        {
          id: 'd11',
          code: 'WEIGHT',
          disease: 'Weight Loss & Fitness',
          eat: 'Sprouts, Green salads, Oats, Buttermilk, Boiled pulses, Green tea, Ample water',
          avoid: 'Sweets, Fast food, Soft drinks, Fried snacks, Late dinners, Refined sugar'
        },
        {
          id: 'd12',
          code: 'CV',
          disease: 'Heart Disease / Cholesterol',
          eat: 'Oats, Almonds, Walnuts, Garlic, Olive oil, Flaxseeds, Green leafy vegetables',
          avoid: 'Deep fried items, Butter, Ghee, Trans-fats, Red meat, Processed snacks'
        }
      ]
    },
    {
      tabId: 'complaints',
      tabName: 'Clinical Complaints',
      items: [
        { id: 'c1', name: 'Fever / High Temperature', code: 'FEV', category: 'General', description: 'Body temperature above 100°F with chills' },
        { id: 'c2', name: 'Cough / Cold / Sore Throat', code: 'CGH', category: 'Respiratory', description: 'Dry or productive throat irritation and congestion' },
        { id: 'c3', name: 'Headache / Migraine', code: 'HA', category: 'Neurological', description: 'Frontal or throbbing head pain' },
        { id: 'c4', name: 'Chest Pain / Discomfort', code: 'CP', category: 'Cardiovascular', description: 'Substernal tightness or radiating pain' },
        { id: 'c5', name: 'Acidity / Heartburn / Gastric Pain', code: 'ACID', category: 'Gastrointestinal', description: 'Epigastric burning sensation after meals' },
        { id: 'c6', name: 'Joint Pain / Knee Swelling', code: 'JP', category: 'Orthopedic', description: 'Arthritic pain and stiffness' },
        { id: 'c7', name: 'General Weakness / Fatigue', code: 'WK', category: 'General', description: 'Lethargy and malaise' },
        { id: 'c8', name: 'Hypertension Check / Giddiness', code: 'BP', category: 'Cardiovascular', description: 'Dizziness and elevated blood pressure' },
        { id: 'c9', name: 'High Blood Sugar / Polyuria', code: 'SUG', category: 'Endocrine', description: 'Excessive thirst and urination' },
        { id: 'c10', name: 'Nausea / Vomiting', code: 'NV', category: 'Gastrointestinal', description: 'Stomach upset and regurgitation' },
        { id: 'c11', name: 'Breathlessness / Dyspnea', code: 'SOB', category: 'Respiratory', description: 'Shortness of breath on exertion' },
        { id: 'c12', name: 'Skin Rash / Itching', code: 'RASH', category: 'Dermatology', description: 'Allergic rashes or urticaria' }
      ]
    },
    {
      tabId: 'investigations',
      tabName: 'Lab Investigations',
      items: [
        { id: 'inv1', name: 'Complete Blood Count (CBC)', code: 'CBC', category: 'Blood / Hematology', sampleType: 'Whole Blood (EDTA)', description: 'Hb, TLC, DLC, Platelet count' },
        { id: 'inv2', name: 'Blood Sugar Fasting & PP (FBS/PPBS)', code: 'FBS', category: 'Biochemistry', sampleType: 'Fluoride Plasma', description: 'Glycemic control and diabetes evaluation' },
        { id: 'inv3', name: 'HbA1c (Glycated Hemoglobin)', code: 'HBA1C', category: 'Biochemistry', sampleType: 'Whole Blood (EDTA)', description: '3-month average blood glucose level' },
        { id: 'inv4', name: 'Lipid Profile Complete', code: 'LIPID', category: 'Biochemistry', sampleType: 'Serum', description: 'Cholesterol, Triglycerides, HDL, LDL, VLDL' },
        { id: 'inv5', name: 'Liver Function Test (LFT)', code: 'LFT', category: 'Biochemistry', sampleType: 'Serum', description: 'SGPT, SGOT, Bilirubin, Alkaline Phosphatase' },
        { id: 'inv6', name: 'Renal / Kidney Function Test (KFT/RFT)', code: 'KFT', category: 'Biochemistry', sampleType: 'Serum', description: 'Serum Creatinine, Blood Urea, Uric Acid' },
        { id: 'inv7', name: 'Urine Routine & Microscopic (R/M)', code: 'URINE', category: 'Pathology', sampleType: 'Clean Catch Urine', description: 'Pus cells, Albumin, Sugar in urine' },
        { id: 'inv8', name: 'Thyroid Profile (T3, T4, TSH)', code: 'THY', category: 'Immunoassay', sampleType: 'Serum', description: 'Total T3, Total T4, and Ultra TSH assessment' },
        { id: 'inv9', name: 'Chest X-Ray PA View', code: 'XRAY', category: 'Radiology', sampleType: 'Digital X-Ray', description: 'Lungs, heart size, and pleura imaging' },
        { id: 'inv10', name: '12-Lead ECG (Electrocardiogram)', code: 'ECG', category: 'Cardiology', sampleType: '12-Lead Tracing', description: 'Cardiac rhythm and ST-T segment evaluation' },
        { id: 'inv11', name: 'USG Whole Abdomen & Pelvis', code: 'USG', category: 'Radiology', sampleType: 'Sonography', description: 'Liver, kidneys, spleen, bladder ultrasound' },
        { id: 'inv12', name: 'Widal Test / Typhoid Serology', code: 'WIDAL', category: 'Serology', sampleType: 'Serum', description: 'Typhoid fever antibody slide agglutination' },
        { id: 'inv13', name: 'Dengue NS1 Antigen & IgM/IgG', code: 'DENGUE', category: 'Serology', sampleType: 'Serum', description: 'Rapid antigen/antibody test for Dengue' },
        { id: 'inv14', name: 'Vitamin D3 & B12 Levels', code: 'VITD', category: 'Immunoassay', sampleType: 'Serum', description: '25-OH Vitamin D and Cyanocobalamin' }
      ]
    },
    {
      tabId: 'medicines',
      tabName: 'Medicine Catalogue',
      items: [
        { id: 'm1', name: 'Paracetamol 650mg (Dolo 650 / Calpol)', code: 'PCM', category: 'Antipyretic / Analgesic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 5 },
        { id: 'm2', name: 'Paracetamol 500mg (Crocin)', code: 'DOLO', category: 'Antipyretic / Analgesic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 4 },
        { id: 'm3', name: 'Ibuprofen 400mg (Brufen)', code: 'BRU', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 6 },
        { id: 'm4', name: 'Combiflam (Ibuprofen + Paracetamol)', code: 'COMBI', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 7 },
        { id: 'm5', name: 'Zerodol-P (Aceclofenac + Paracetamol)', code: 'ZP', category: 'NSAID / Pain Relief', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 9 },
        { id: 'm6', name: 'Zerodol-SP (Aceclo + Paracetamol + Serratio)', code: 'ZSP', category: 'Anti-inflammatory / Pain', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 14 },
        { id: 'm7', name: 'Voveran 50mg (Diclofenac Sodium)', code: 'VOV', category: 'NSAID / Joint Pain', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 8 },
        { id: 'm8', name: 'Meftal-Spas (Mefenamic Acid + Dicyclomine)', code: 'MEF', category: 'Antispasmodic / Cramps', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 8 },
        { id: 'm9', name: 'Cyclopam (Dicyclomine + Paracetamol)', code: 'CYC', category: 'Antispasmodic / Abdominal Pain', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 7 },
        { id: 'm10', name: 'Drotin-M (Drotaverine + Mefenamic)', code: 'DROT', category: 'Antispasmodic / Colic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 12 },
        { id: 'm11', name: 'Augmentin 625 (Amoxyclav 625 Duo)', code: 'AUG', category: 'Broad Spectrum Antibiotic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 22 },
        { id: 'm12', name: 'Azithromycin 500mg (Azithral 500)', code: 'AZI', category: 'Macrolide Antibiotic (RTI)', form: 'Tablet', defaultDosage: '1-0-0 OD', unitPrice: 20 },
        { id: 'm13', name: 'Cefixime 200mg (Taxim-O 200 / Zifi 200)', code: 'CEF', category: 'Cephalosporin Antibiotic', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 16 },
        { id: 'm14', name: 'Ofloxacin + Ornidazole (O2 / Zenflox-OZ)', code: 'O2', category: 'GI Infection / Diarrhea', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 15 },
        { id: 'm15', name: 'Pantoprazole 40mg (Pan 40 / Pantocid)', code: 'PAN40', category: 'Antacid / PPI', form: 'Tablet', defaultDosage: '1-0-0 BF', unitPrice: 8 },
        { id: 'm16', name: 'Pantoprazole + Domperidone (Pan-D)', code: 'PAND', category: 'Antacid / PPI + Prokinetic', form: 'Capsule', defaultDosage: '1-0-0 BF', unitPrice: 14 },
        { id: 'm17', name: 'Rabeprazole 20mg (Razo 20)', code: 'RAZO', category: 'Antacid / PPI', form: 'Tablet', defaultDosage: '1-0-0 BF', unitPrice: 9 },
        { id: 'm18', name: 'Rabeprazole + Domperidone (Rablet-D)', code: 'RAZD', category: 'Antacid / PPI + Prokinetic', form: 'Capsule', defaultDosage: '1-0-0 BF', unitPrice: 15 },
        { id: 'm19', name: 'Omeprazole 20mg (Omez 20)', code: 'OMEZ', category: 'Antacid / PPI', form: 'Capsule', defaultDosage: '1-0-0 BF', unitPrice: 7 },
        { id: 'm20', name: 'Omeprazole + Domperidone (Omez-D)', code: 'OMEZD', category: 'Antacid / PPI + Prokinetic', form: 'Capsule', defaultDosage: '1-0-0 BF', unitPrice: 12 },
        { id: 'm21', name: 'Cetirizine 10mg (Cetzine / Alerid)', code: 'CET', category: 'Antihistamine / Allergy', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 4 },
        { id: 'm22', name: 'Levocetirizine 5mg (Levocet / 1-AL)', code: 'LEVO', category: 'Antihistamine / Allergy', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 6 },
        { id: 'm23', name: 'Montair-LC (Levocetirizine + Montelukast)', code: 'MONTC', category: 'Allergic Rhinitis / Asthma', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 16 },
        { id: 'm24', name: 'Telmisartan 40mg (Telma 40)', code: 'TEL40', category: 'Antihypertensive (ARB)', form: 'Tablet', defaultDosage: '1-0-0 OD', unitPrice: 10 },
        { id: 'm25', name: 'Amlodipine 5mg (Amlong 5)', code: 'AML5', category: 'Calcium Channel Blocker', form: 'Tablet', defaultDosage: '1-0-0 OD', unitPrice: 5 },
        { id: 'm26', name: 'Atorvastatin 10mg (Atorva 10)', code: 'ATOR10', category: 'Statin / Cholesterol', form: 'Tablet', defaultDosage: '0-0-1 HS', unitPrice: 14 },
        { id: 'm27', name: 'Metformin 500mg (Glycomet 500)', code: 'GLY500', category: 'Antidiabetic (Biguanide)', form: 'Tablet', defaultDosage: '1-0-1 AF', unitPrice: 4 },
        { id: 'm28', name: 'Becosules (Vitamin B-Complex + C)', code: 'BECO', category: 'Multivitamin / Mouth Ulcers', form: 'Capsule', defaultDosage: '1-0-0 AF', unitPrice: 5 },
        { id: 'm29', name: 'Shelcal 500 (Calcium + Vit D3)', code: 'SHELCAL', category: 'Calcium Supplement / Bone', form: 'Tablet', defaultDosage: '0-1-0 AF', unitPrice: 9 },
        { id: 'm30', name: 'Calcirol Sachet 60,000 IU (D3)', code: 'CALC', category: 'Vitamin D3 Deficiency', form: 'Sachet', defaultDosage: '1 Sachet Weekly', unitPrice: 40 }
      ]
    },
    {
      tabId: 'areas',
      tabName: 'Area / Location',
      items: [
        { id: 'a1', name: 'Main Road', code: 'MAIN', city: 'Ahmedabad', pincode: '380001' },
        { id: 'a2', name: 'Vastrapur', code: 'VAST', city: 'Ahmedabad', pincode: '380015' },
        { id: 'a3', name: 'Satellite', code: 'SAT', city: 'Ahmedabad', pincode: '380015' },
        { id: 'a4', name: 'Navrangpura', code: 'NAV', city: 'Ahmedabad', pincode: '380009' },
        { id: 'a5', name: 'Bopal', code: 'BOP', city: 'Ahmedabad', pincode: '380058' },
        { id: 'a6', name: 'Thaltej', code: 'THAL', city: 'Ahmedabad', pincode: '380059' },
        { id: 'a7', name: 'Gota', code: 'GOTA', city: 'Ahmedabad', pincode: '382481' },
        { id: 'a8', name: 'Maninagar', code: 'MANI', city: 'Ahmedabad', pincode: '380008' },
        { id: 'a9', name: 'Paldi', code: 'PALDI', city: 'Ahmedabad', pincode: '380007' },
        { id: 'a10', name: 'Science City', code: 'SCICITY', city: 'Ahmedabad', pincode: '380060' },
        { id: 'a11', name: 'Varachha', code: 'VAR', city: 'Surat', pincode: '395006' },
        { id: 'a12', name: 'Adajan', code: 'ADAJ', city: 'Surat', pincode: '395009' }
      ]
    },
    {
      tabId: 'allergies',
      tabName: 'Known Allergies',
      items: [
        { id: 'al1', name: 'None', code: 'NONE', category: 'General', severity: 'None' },
        { id: 'al2', name: 'Penicillin', code: 'PEN', category: 'Drug Allergy', severity: 'Severe' },
        { id: 'al3', name: 'Sulfa Drugs', code: 'SULFA', category: 'Drug Allergy', severity: 'Moderate' },
        { id: 'al4', name: 'Aspirin / NSAIDs', code: 'ASP', category: 'Drug Allergy', severity: 'Moderate' },
        { id: 'al5', name: 'Dust / Pollen', code: 'DUST', category: 'Environmental', severity: 'Mild' },
        { id: 'al6', name: 'Peanuts / Nuts', code: 'NUT', category: 'Food Allergy', severity: 'Severe' },
        { id: 'al7', name: 'Latex', code: 'LAT', category: 'Contact Allergy', severity: 'Mild' },
        { id: 'al8', name: 'Ciprofloxacin', code: 'CIP', category: 'Drug Allergy', severity: 'Moderate' },
        { id: 'al9', name: 'Amoxicillin', code: 'AMOX', category: 'Drug Allergy', severity: 'Moderate' }
      ]
    },
    {
      tabId: 'relations',
      tabName: 'Relation to Head',
      items: [
        { id: 'r1', name: 'Head', code: 'HEAD', category: 'Primary', description: 'Head of Family' },
        { id: 'r2', name: 'Wife', code: 'WIFE', category: 'Spouse', description: 'Wife of Head' },
        { id: 'r3', name: 'Husband', code: 'HUSB', category: 'Spouse', description: 'Husband of Head' },
        { id: 'r4', name: 'Son', code: 'SON', category: 'Child', description: 'Son of Head' },
        { id: 'r5', name: 'Daughter', code: 'DAU', category: 'Child', description: 'Daughter of Head' },
        { id: 'r6', name: 'Father', code: 'FATH', category: 'Parent', description: 'Father of Head' },
        { id: 'r7', name: 'Mother', code: 'MOTH', category: 'Parent', description: 'Mother of Head' },
        { id: 'r8', name: 'Brother', code: 'BRO', category: 'Sibling', description: 'Brother of Head' },
        { id: 'r9', name: 'Sister', code: 'SIS', category: 'Sibling', description: 'Sister of Head' },
        { id: 'r10', name: 'Grandfather', code: 'GFATH', category: 'Grandparent', description: 'Grandfather of Head' },
        { id: 'r11', name: 'Grandmother', code: 'GMOTH', category: 'Grandparent', description: 'Grandmother of Head' },
        { id: 'r12', name: 'Daughter-in-Law', code: 'DIL', category: 'In-Law', description: 'Daughter-in-Law of Head' },
        { id: 'r13', name: 'Son-in-Law', code: 'SIL', category: 'In-Law', description: 'Son-in-Law of Head' },
        { id: 'r14', name: 'Other', code: 'OTHER', category: 'Other', description: 'Other Relation' }
      ]
    },
    {
      tabId: 'societies',
      tabName: 'Society / Flat',
      items: [
        { id: 's1', name: 'Central Society', code: 'CENTRAL', area: 'Main Road' },
        { id: 's2', name: 'Shanti Niketan Apt', code: 'SHANTI', area: 'Vastrapur' },
        { id: 's3', name: 'Gokuldham Society', code: 'GOKUL', area: 'Satellite' },
        { id: 's4', name: 'Surya Kiran Heights', code: 'SURYA', area: 'Satellite' },
        { id: 's5', name: 'Radhe Krishna Bunglows', code: 'RADHE', area: 'Bopal' },
        { id: 's6', name: 'Vrindavan Society', code: 'VRIND', area: 'Thaltej' },
        { id: 's7', name: 'Royal Residency', code: 'ROYAL', area: 'Gota' },
        { id: 's8', name: 'Shivam Heights', code: 'SHIVAM', area: 'Maninagar' },
        { id: 's9', name: 'Silver Crest', code: 'SILVER', area: 'Science City' }
      ]
    },
    {
      tabId: 'shortcuts',
      tabName: 'Navigation Shortcuts',
      items: [
        { id: 'sh1', category: 'Navigation', title: 'Clinical Dashboard', target: 'dashboard', keyHint: 'F4' },
        { id: 'sh2', category: 'Navigation', title: 'Family Head Registration', target: 'family', keyHint: 'F1' },
        { id: 'sh3', category: 'Navigation', title: 'Add Family Member / Patient', target: 'patient', keyHint: 'F2' },
        { id: 'sh4', category: 'Navigation', title: 'Patient Record & Case Consultation', target: 'case', keyHint: 'F3' },
        { id: 'sh5', category: 'Navigation', title: 'Appointments & Tokens', target: 'appointments', keyHint: 'Alt+A' },
        { id: 'sh6', category: 'Navigation', title: 'Medical Certificate Generator', target: 'certificates', keyHint: 'F6' },
        { id: 'sh7', category: 'Navigation', title: 'Clinical Reports & Analytics', target: 'reports', keyHint: 'F5' },
        { id: 'sh8', category: 'Navigation', title: 'Send Complaint & Feedback Helpdesk', target: 'feedback', keyHint: 'F8' },
        { id: 'sh9', category: 'Navigation', title: 'Clinical Master Data Setup', target: 'masters', keyHint: 'F7' },
        { id: 'sh10', category: 'Action', title: 'Quick Global Search', target: 'quick_search', keyHint: '/' },
        { id: 'sh11', category: 'Action', title: 'Print Prescription Preview Modal', target: 'print_prescription', keyHint: 'Ctrl+P' },
        { id: 'sh12', category: 'Action', title: 'Save / Submit Current Case Record', target: 'submit_case', keyHint: 'Ctrl+S' },
        { id: 'sh13', category: 'Action', title: 'Close Modal / Unfocus / Cancel Drawer', target: 'close_modal', keyHint: 'Esc' }
      ]
    }
  ];
}

/**
 * Retrieve or Seed Clinic Master Data document
 */
async function getOrCreateClinicMaster(clinicId) {
  let doc = await MasterData.findOne({ clinicId });
  if (!doc) {
    const defaultTabs = getDefaultClinicMasterTabs();
    doc = new MasterData({
      clinicId,
      tabs: defaultTabs
    });
    await doc.save();
  }
  return doc;
}

exports.getMasters = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const doc = await getOrCreateClinicMaster(clinicId);

    // Build convenient lookup maps
    const shortcuts = {};
    const dietaryMap = {};

    doc.tabs.forEach((tab) => {
      if (tab.tabId === 'dietary') {
        tab.items.forEach((item) => {
          if (item.code) {
            dietaryMap[item.code.toUpperCase()] = {
              code: item.code,
              disease: item.disease,
              eat: item.eat,
              avoid: item.avoid
            };
          }
        });
      }

      if (!shortcuts[tab.tabId]) shortcuts[tab.tabId] = {};
      tab.items.forEach((item) => {
        if (item.name && item.code) {
          shortcuts[tab.tabId][item.name] = item.code;
          shortcuts[tab.tabId][item.id || item.code] = item.code;
        }
      });
    });

    res.status(200).json({
      success: true,
      clinicId,
      data: doc.tabs,
      tabs: doc.tabs,
      shortcuts,
      dietary: dietaryMap
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createMaster = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.body.clinicId || req.query.clinicId || 'demo';
    const tabId = req.body.tabId || req.body.type || 'dietary';
    const rawItem = req.body.item || req.body;
    const { tabId: _t, type: _ty, clinicId: _c, ...itemProps } = rawItem;

    const doc = await getOrCreateClinicMaster(clinicId);

    let targetTab = doc.tabs.find((t) => t.tabId === tabId);
    if (!targetTab) {
      targetTab = {
        tabId: tabId || 'custom',
        tabName: tabId ? (tabId.charAt(0).toUpperCase() + tabId.slice(1)) : 'Custom',
        items: []
      };
      doc.tabs.push(targetTab);
    }

    const newItem = {
      id: itemProps.id || `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ...itemProps
    };

    // If item with same ID or same name exists in this tab, update it
    const existingIdx = targetTab.items.findIndex(
      (i) => (newItem.id && i.id === newItem.id) || (newItem.name && i.name && i.name.toLowerCase() === newItem.name.toLowerCase()) || (newItem.code && i.code && i.code.toLowerCase() === newItem.code.toLowerCase() && tabId === 'dietary')
    );

    if (existingIdx !== -1) {
      targetTab.items[existingIdx] = { ...targetTab.items[existingIdx].toObject(), ...newItem };
    } else {
      targetTab.items.push(newItem);
    }

    await doc.save();
    res.status(201).json({ success: true, message: 'Master item saved to database for clinic', data: newItem, tabs: doc.tabs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateMaster = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.body.clinicId || req.query.clinicId || 'demo';
    const { id } = req.params; // Item ID, code, or name
    const tabId = req.body.tabId || req.body.type;
    const rawItem = req.body.item || req.body;
    const { tabId: _t, type: _ty, clinicId: _c, ...itemProps } = rawItem;

    const doc = await getOrCreateClinicMaster(clinicId);

    let updated = false;

    doc.tabs.forEach((tab) => {
      if (!tabId || tab.tabId === tabId) {
        tab.items.forEach((it, idx) => {
          if (it.id === id || it.code === id || it.name === id || (it.id && itemProps.id && it.id === itemProps.id) || (it.name && itemProps.name && it.name.toLowerCase() === itemProps.name.toLowerCase())) {
            tab.items[idx] = { ...it.toObject(), ...itemProps };
            updated = true;
          }
        });
      }
    });

    if (!updated && tabId) {
      let targetTab = doc.tabs.find((t) => t.tabId === tabId);
      if (targetTab) {
        targetTab.items.push({
          id: id || `item_${Date.now()}`,
          ...itemProps
        });
        updated = true;
      }
    }

    await doc.save();
    res.status(200).json({ success: true, message: 'Master item updated in database for clinic', tabs: doc.tabs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteMaster = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const { id } = req.params;
    const { tabId } = req.query;

    const doc = await getOrCreateClinicMaster(clinicId);

    doc.tabs.forEach((tab) => {
      if (!tabId || tab.tabId === tabId) {
        tab.items = tab.items.filter((it) => it.id !== id && it.code !== id && it.name !== id);
      }
    });

    await doc.save();
    res.status(200).json({ success: true, message: 'Master item deleted from database for clinic', tabs: doc.tabs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetMasters = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.body.clinicId || 'demo';
    const defaultTabs = getDefaultClinicMasterTabs();
    
    let doc = await MasterData.findOne({ clinicId });
    if (!doc) {
      doc = new MasterData({ clinicId, tabs: defaultTabs });
    } else {
      doc.tabs = defaultTabs;
    }
    await doc.save();
    res.status(200).json({ success: true, message: 'Clinic master data reset to defaults', data: doc.tabs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
