const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'scoolize_super_secret_key_2024';

exports.generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        SECRET_KEY,
        { expiresIn: '24h' }
    );
};

exports.SECRET_KEY = SECRET_KEY;