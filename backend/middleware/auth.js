const jwt = require('jsonwebtoken');

module.exports = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'Authentification requise !' });
            }
            
            const token = authHeader.split(' ')[1];
            
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            
            const userId = decodedToken.userId;
            const userRole = decodedToken.role;

            if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
                return res.status(403).json({ message: 'Accès interdit : droits insuffisants.' });
            }

            req.auth = {
                userId: userId,
                role: userRole
            };
            
            next();
        } catch (error) {
            res.status(401).json({ message: 'Token invalide ou expiré !' });
        }
    };
};