const attendanceModel = require('../models/attendanceModel');

exports.getAttendance = async(req, res) => {
    try {
        const attendance = await attendanceModel.getAllAttendance();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch attendance.' });
    }
};

exports.markAttendance = async(req, res) => {
    try {
        const { member_id, check_in_date, status } = req.body;
        if (!member_id) return res.status(400).json({ message: 'member_id is required.' });

        const result = await attendanceModel.markAttendance({ member_id, check_in_date, status });
        res.status(201).json({ message: 'Attendance marked successfully.', attendanceId: result.id });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark attendance.' });
    }
};