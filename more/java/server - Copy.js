const express = require("express");
const mysql = require('mysql2');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3306;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser()); // Add cookie parser middleware

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Alpinehacker1212",
    database: "personalbudget",
    port: 3333,
});

db.connect((err) => {
    if (err) {
        console.error("MySQL Connection Error:", err);
        throw err;
    }
    console.log("MySQL Connected...");
});

// Root route
app.get("/", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        // Check if the token exists in the database
        db.query("SELECT * FROM users WHERE id = ?", [token], (err, result) => {
            if (err || result.length === 0) {
                // If the token is invalid or expired, continue to index
                res.send("Welcome to the server! Please log in.");
            } else {
                // If the token is valid, redirect to the dashboard
                res.redirect("/dashboard");
            }
        });
    } else {
        // No token, show the index page (login page or welcome page)
        res.send("Welcome to the server! Please log in.");
    }
});

// Check if user is logged in (middleware)
const checkAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    db.query("SELECT * FROM users WHERE id = ?", [token], (err, result) => {
        if (err || result.length === 0) {
            return res.status(401).json({ error: "Invalid session" });
        }
        req.user = result[0]; // Attach user info to the request object
        next(); // Proceed to the dashboard route
    });
};

// Get user info for dashboard
app.get("/dashboard", checkAuth, (req, res) => {
    const userId = req.userId;
    db.query("SELECT id, username, password FROM users WHERE id = ?", [userId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(404).json({ error: "User not found" });

        const user = result[0];
        res.json({
            id: user.id,
            username: user.username,
            password: user.password,  // In production, you shouldn't send passwords, just a placeholder
        });
    });
});

// Register User
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        try {
            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into DB
            db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Database insertion error:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                // Get the inserted user's ID (for authentication)
                const userId = result.insertId;

                // Set a cookie with the user id or session identifier
                res.cookie("token", userId, { httpOnly: true, secure: false, maxAge: 86400000 }); // 1 day cookie
                res.status(201).json({ message: "User registered successfully!", username: username });
            });
        } catch (err) {
            console.error("Password hashing error:", err);
            return res.status(500).json({ error: "Password hashing failed" });
        }
    });
});

// Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid password" });
            }

            // Set a cookie with the user id or session identifier
            res.cookie("token", user.id, { httpOnly: true, secure: false, maxAge: 86400000 }); // 1 day cookie
            res.status(200).json({ message: "Login successful", username: user.username });
        } catch (err) {
            console.error("Password comparison error:", err);
            return res.status(500).json({ error: "Password comparison failed" });
        }
    });
});

// Dashboard route (protected)
app.get("/dashboard", checkAuth, (req, res) => {
    res.status(200).json({ message: `Welcome to the dashboard, ${req.user.username}!` });
});

// Logout route
app.post("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the cookie on logout
    res.status(200).json({ message: "Logged out successfully" });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
