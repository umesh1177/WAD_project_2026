const { generatePrescriptionHTML } = require('../utils/generatePDF');

const DIETARY_LIBRARY = {
  DB: 'Diabetic diet: avoid sugar, sweets and fried food. Prefer high-fibre meals, eat on time.',
  CV: 'Low-salt, low-oil diet. Avoid red meat and packaged/processed food.',
  LQ: 'Plenty of fluids and light, easily digestible food until fever/cough settles.',
  SUGAR: 'Avoid direct sugar, jaggery, honey, sweets, sweet fruits like mango & banana.',
  BP: 'Strict low salt diet. Avoid pickles, papad, processed cheese and salty snacks.',
  ACID: 'Avoid spicy food, oily dishes, tea, coffee, citrus fruits. Drink cool milk or coconut water.',
};

const expandDietaryAdvice = (dietaryString, customLibrary = {}) => {
  if (!dietaryString || !dietaryString.trim()) return '';
  const combined = { ...DIETARY_LIBRARY, ...customLibrary };
  const codes = dietaryString.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);

  const expanded = [];
  for (const c of codes) {
    if (combined[c]) {
      expanded.push(combined[c]);
    } else {
      expanded.push(c);
    }
  }
  return expanded.join('\n\n');
};

const getDietaryLibrary = () => DIETARY_LIBRARY;

module.exports = {
  DIETARY_LIBRARY,
  expandDietaryAdvice,
  getDietaryLibrary,
  generatePrescriptionHTML,
};
