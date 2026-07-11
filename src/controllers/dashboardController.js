const db = require('../config/db');

exports.getDashboardStats = async(req, res) => {
    try {
        const [members] = await db.query('SELECT COUNT(*) AS totalMembers FROM members');
        const [activeMembers] = await db.query("SELECT COUNT(*) AS activeMembers FROM members WHERE status = 'active'");
        const [trainers] = await db.query('SELECT COUNT(*) AS totalTrainers FROM trainers');
        const [revenue] = await db.query('SELECT COALESCE(SUM(price), 0) AS totalRevenue FROM membership_plans');

        res.json({
            totalMembers: members[0].totalMembers,
            activeMembers: activeMembers[0].activeMembers,
            totalTrainers: trainers[0].totalTrainers,
            totalRevenue: revenue[0].totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load dashboard stats.' });
    }
};