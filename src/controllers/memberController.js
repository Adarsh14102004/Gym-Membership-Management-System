const memberModel = require('../models/memberModel');

exports.getMembers = async(req, res) => {
    try {
        const members = await memberModel.getAllMembers();
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch members.' });
    }
};

exports.getMember = async(req, res) => {
    try {
        const member = await memberModel.getMemberById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch member.' });
    }
};

exports.createMember = async(req, res) => {
    try {
        const { full_name, email, phone, password, plan_id, status } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required.' });
        }

        const result = await memberModel.createMember({ full_name, email, phone, password, plan_id, status });
        res.status(201).json({ message: 'Member added successfully.', memberId: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add member.' });
    }
};

exports.updateMember = async(req, res) => {
    try {
        const result = await memberModel.updateMember(req.params.id, req.body);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Member not found.' });
        res.json({ message: 'Member updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update member.' });
    }
};

exports.deleteMember = async(req, res) => {
    try {
        const result = await memberModel.deleteMember(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Member not found.' });
        res.json({ message: 'Member deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete member.' });
    }
};