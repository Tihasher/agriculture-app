require("dotenv").config(); // Ensure a server reads the .env file

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware"); // Import authentication middleware
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection (User Management)
const user_db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = { user_db };

// User Registration
app.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        
        // Validate input
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the email already exists
        const [existingUser] = await user_db.promise().query("SELECT email FROM users WHERE email = ?", [email]);
        if (existingUser.length) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const query = "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)";
        const [result] = await user_db.promise().query(query, [first_name, last_name, email, hashedPassword]);

        // Get inserted user ID
        const userId = result.insertId;

        // Generate JWT Token for the new user
        const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// User Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [results] = await user_db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Protected Route: Get User Profile
app.get("/profile", authMiddleware, async (req, res) => {
    try {
        const [user] = await user_db.promise().query(
            "SELECT id, first_name, last_name, email FROM users WHERE id = ?",
            [req.user.userId]
        );

        if (!user.length) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user[0]);
    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Protected Route: Delete User Account
app.delete("/delete-account", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Extract userId from the middleware

        // Check if the user exists before deleting
        const [user] = await user_db.promise().query("SELECT * FROM users WHERE id = ?", [userId]);
        if (user.length === 0) return res.status(404).json({ message: "User not found" });

        // Delete the user from the database
        await user_db.promise().query("DELETE FROM users WHERE id = ?", [userId]);

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Account deletion error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

// Route to serve the login/registration form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});