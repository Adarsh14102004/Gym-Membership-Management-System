const db = require('../config/db');

exports.getAllPlans = async() => {
    const [rows] = await db.query('SELECT * FROM membership_plans ORDER BY id DESC');
    return rows;
};

exports.getPlanById = async(id) => {
    const [rows] = await db.query('SELECT * FROM membership_plans WHERE id = ? LIMIT 1', [id]);
    return rows[0];
};

exports.createPlan = async(plan) => {
    const [result] = await db.query(
        'INSERT INTO membership_plans (name, price, duration, description) VALUES (?, ?, ?, ?)', [plan.name, plan.price, plan.duration, plan.description]
    );
    return { id: result.insertId };
};

exports.updatePlan = async(id, plan) => {
    const [result] = await db.query(
        'UPDATE membership_plans SET name = ?, price = ?, duration = ?, description = ? WHERE id = ?', [plan.name, plan.price, plan.duration, plan.description, id]
    );
    return result;
};

exports.deletePlan = async(id) => {
    const [result] = await db.query('DELETE FROM membership_plans WHERE id = ?', [id]);
    return result;
};