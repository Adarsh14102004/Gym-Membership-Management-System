const contactModel = require('../models/contactModel');

exports.submitContact = async(req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email and message are required.' });
        }

        const result = await contactModel.createMessage({ name, email, phone, message });
        res.status(201).json({ message: 'Message saved successfully.', contactId: result.id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save contact message.' });
    }
};

exports.getContacts = async(req, res) => {
    try {
        const messages = await contactModel.getAllMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch contact messages.' });
    }
};