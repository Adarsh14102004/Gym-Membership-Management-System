const db = require('../config/db');

exports.getAllAttendance = async() => {
    const [rows] = await db.query('SELECT * FROM attendance ORDER BY id DESC');
    return rows;
};

exports.markAttendance = async(attendance) => {
    const [result] = await db.query(
        'INSERT INTO attendance (member_id, check_in_date, status) VALUES (?, ?, ?)', [attendance.member_id, attendance.check_in_date || new Date().toISOString().slice(0, 10), attendance.status || 'present']
    );
    return { id: result.insertId };
};