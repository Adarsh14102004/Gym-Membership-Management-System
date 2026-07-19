// Express framework ko import kiya hai
const express = require("express");

// Frontend aur Backend ko connect karne ke liye
const cors = require("cors");

// Database connection import kiya hai
const db = require("./db");

// Express application create ki hai
const app = express();

// CORS enable kiya hai
app.use(cors());

// JSON data receive karne ke liye
app.use(express.json());

// Test route (Check karne ke liye ki server chal raha hai)
app.get("/", (req, res) => {
    res.send("Gym Backend is Running...");
});

// Server kis port par chalega
const PORT = 5000;

// Contact form ka data save karne ki API
app.post("/contact", (req, res) => {

    // Frontend se aaya hua data lena
    const {
        name,
        email,
        phone,
        membership_plan,
        joining_date,
        fees,
        message
    } = req.body;

    // Database me data insert karne ki SQL Query
    const sql = `
        INSERT INTO members
        (Name, email, phone, membership_plan, joining_date, fees)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // SQL Query execute karna
    db.query(
        sql, [name, email, phone, membership_plan, joining_date, fees],
        (err, result) => {

            // Database error handle karna
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            // Success response bhejna
            res.json({
                success: true,
                message: "Data Saved Successfully"
            });
        }
    );
});

// Database se sabhi members ka data lana
app.get("/members", (req, res) => {

    // Sabhi members ko select karne ki query
    const sql = "SELECT * FROM members";

    // Query execute karna
    db.query(sql, (err, result) => {

        // Error handle karna
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        // Members ka data frontend ko bhejna
        res.json({
            success: true,
            data: result
        });

    });

});

// Server start karna
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});