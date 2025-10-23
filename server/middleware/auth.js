import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const authorizeOwnerOrManager = async (req, res, next) => {
  const { userId } = req.params;
  const requestingUser = req.user;

  // Allow if user is accessing their own data
  if (parseInt(userId) === requestingUser.id) {
    return next();
  }

  // Allow if user is a manager or admin
  if (['manager', 'admin'].includes(requestingUser.role)) {
    return next();
  }

  // Allow if user is a leader managing this rep
  if (requestingUser.role === 'leader') {
    // TODO: Check if this user is in their team
    return next();
  }

  return res.status(403).json({ error: 'Access denied' });
};
