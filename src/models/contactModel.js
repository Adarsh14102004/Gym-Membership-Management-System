const db = require('../config/db');

exports.createMessage = async(message) => {
    const [result] = await db.query(
        'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)', [message.name, message.email, message.phone, message.message]
    );
    return { id: result.insertId };
};

exports.getAllMessages = async() => {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY id DESC');
    return rows;
};