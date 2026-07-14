const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // No token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Invalid or expired token
        }

        req.user = user; // { username, role, lensoDivision }
        next();
    });
}

module.exports = authenticateToken;
