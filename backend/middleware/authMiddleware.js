const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      // Allow demo access or fallback user context if header is not present
      const fallbackClinic = req.headers['x-clinic-id'] || 'demo';
      req.user = { id: 'demo', username: 'dhyey', role: 'doctor', activeClinicId: fallbackClinic };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wad_clinic_super_secure_jwt_token_2026_key');
    req.user = decoded;
    if (req.headers['x-clinic-id']) {
      req.user.activeClinicId = req.headers['x-clinic-id'];
    }
    next();
  } catch (error) {
    // If token invalid, still provide graceful demo user fallback for seamless frontend experience
    const fallbackClinic = req.headers['x-clinic-id'] || 'demo';
    req.user = { id: 'demo', username: 'dhyey', role: 'doctor', activeClinicId: fallbackClinic };
    next();
  }
};

module.exports = authMiddleware;
