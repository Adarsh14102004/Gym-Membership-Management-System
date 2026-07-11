const authModel = require('../models/authModel');

exports.login = async(req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        let user = null;

        if (role === 'admin') {
            user = await authModel.loginAdmin(email, password);
        } else {
            user = await authModel.loginUser(email, password);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};