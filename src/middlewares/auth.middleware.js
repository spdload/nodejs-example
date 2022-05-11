import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateJWT (req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403).send('Wrong passwword');
      }
      if (user.status !== 'active') {
        return res.sendStatus(401).send('User not active')
      }
      req.user = user;
      next();
    });
  } else {
    return res.sendStatus(401);
  }
}

export function checkRole(roles = []) {
  return (req, res, next) => {
    const userRole = req.user.role;
    if(roles.length === 0 || roles.includes(userRole)) return next();
    return res.status(403).json({
      'message': "You don`t have access"
    });
  }
}
