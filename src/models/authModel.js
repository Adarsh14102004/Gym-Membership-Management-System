const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.loginUser = async(email, password) => {
    const [rows] = await db.query('SELECT * FROM members WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) return null;

    const user = rows[0];
    const storedHash = user.password_hash || '';
    const isMatch = storedHash.startsWith('$2') ?
        await bcrypt.compare(password, storedHash) :
        password === storedHash;

    if (!isMatch) return null;

    return user;
};

exports.loginAdmin = async(email, password) => {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) return null;

    const admin = rows[0];
    const storedHash = admin.password_hash || '';
    const isMatch = storedHash.startsWith('$2') ?
        await bcrypt.compare(password, storedHash) :
        password === storedHash;

    if (!isMatch) return null;

    return admin;
};