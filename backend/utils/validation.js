/**
 * Request Payload Validation Utilities
 */

const validateFamily = (data) => {
  const errors = [];
  if (!data.headName || !data.headName.trim()) {
    errors.push('Family head name is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePatient = (data) => {
  const errors = [];
  if (!data.name || !data.name.trim()) {
    errors.push('Patient name is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateVisit = (data) => {
  const errors = [];
  if (!data.date) {
    errors.push('Visit date is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUser = (data) => {
  const errors = [];
  if (!data.username || !data.username.trim()) {
    errors.push('Username is required');
  }
  if (!data.password || data.password.length < 3) {
    errors.push('Password must be at least 3 characters long');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateFamily,
  validatePatient,
  validateVisit,
  validateUser,
};
