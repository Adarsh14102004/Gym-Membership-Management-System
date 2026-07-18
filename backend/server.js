const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Gym Backend is Running...");
});

const PORT = 5000;
app.post("/contact", (req, res) => {
    const { name, email, phone, message } = req.body;

    const sql = `
        INSERT INTO members
        (Name, email, phone, membership_plan, joining_date, fees)
        VALUES (?, ?, ?, ?, CURDATE(), ?)
    `;

    db.query(
        sql, [name, email, phone, "Basic", 999],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            res.json({
                success: true,
                message: "Data Saved Successfully"
            });
        }
    );
});
// Get All Members
app.get("/members", (req, res) => {

    const sql = "SELECT * FROM members";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            data: result
        });

    });

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});