const planModel = require('../models/planModel');

exports.getPlans = async(req, res) => {
    try {
        const plans = await planModel.getAllPlans();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch plans.' });
    }
};

exports.getPlan = async(req, res) => {
    try {
        const plan = await planModel.getPlanById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found.' });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch plan.' });
    }
};

exports.createPlan = async(req, res) => {
    try {
        const { name, price, duration, description } = req.body;
        if (!name || !price) return res.status(400).json({ message: 'Plan name and price are required.' });

        const result = await planModel.createPlan({ name, price, duration, description });
        res.status(201).json({ message: 'Plan created successfully.', planId: result.id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create plan.' });
    }
};

exports.updatePlan = async(req, res) => {
    try {
        const result = await planModel.updatePlan(req.params.id, req.body);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Plan not found.' });
        res.json({ message: 'Plan updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update plan.' });
    }
};

exports.deletePlan = async(req, res) => {
    try {
        const result = await planModel.deletePlan(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Plan not found.' });
        res.json({ message: 'Plan deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete plan.' });
    }
};