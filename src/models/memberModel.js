const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllMembers = async() => {
    const [rows] = await db.query('SELECT * FROM members ORDER BY id DESC');
    return rows;
};

exports.getMemberById = async(id) => {
    const [rows] = await db.query('SELECT * FROM members WHERE id = ? LIMIT 1', [id]);
    return rows[0];
};

exports.createMember = async(member) => {
    const passwordHash = await bcrypt.hash(member.password, 10);
    const [result] = await db.query(
        'INSERT INTO members (full_name, email, phone, plan_id, status, password_hash) VALUES (?, ?, ?, ?, ?, ?)', [member.full_name, member.email, member.phone, member.plan_id || null, member.status || 'active', passwordHash]
    );
    return { id: result.insertId };
};

exports.updateMember = async(id, member) => {
    const [result] = await db.query(
        'UPDATE members SET full_name = ?, email = ?, phone = ?, plan_id = ?, status = ? WHERE id = ?', [member.full_name, member.email, member.phone, member.plan_id || null, member.status || 'active', id]
    );
    return result;
};

exports.deleteMember = async(id) => {
    const [result] = await db.query('DELETE FROM members WHERE id = ?', [id]);
    return result;
};