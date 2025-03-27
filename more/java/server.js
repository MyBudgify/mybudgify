const express = require("express");
const mysql = require('mysql2');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Firebase Admin SDK
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-service-account.json"); // path to your Firebase service account JSON file
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mybudgify.firebaseio.com" // Your Firebase Realtime Database URL (if applicable)
});

const app = express();
const port = 3306;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// MySQL Connection (Updated)
const db = mysql.createConnection({
    host: "rs7cv.h.filess.io",  // New MySQL host
    user: "WebProject_upwardshop", // Your MySQL username
    password: "31e38226976e8eaa9d7790709be6e2812a69f421", // Your MySQL password
    database: "WebProject_upwardshop", // Your MySQL database
    port: 61002, // New port
});

db.connect((err) => {
    if (err) {
        console.error("MySQL Connection Error:", err);
        throw err;
    }
    console.log("MySQL Connected...");
});

// Firebase Authentication Check (middleware)
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    admin.auth().verifyIdToken(token)
        .then(decodedToken => {
            req.user = decodedToken;
            next(); // Continue to the next middleware or route handler
        })
        .catch(() => {
            return res.status(401).json({ error: "Unauthorized, invalid token" });
        });
};

// Register User
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Create Firebase user
        const userRecord = await admin.auth().createUser({
            email: `${username}@example.com`, // Use username as email
            password: password,
        });

        // Store user in MySQL
        db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], (err, result) => {
            if (err) return res.status(500).json({ error: "Database error" });

            res.status(201).json({ message: "User registered successfully!", userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Error registering user" });
    }
});

// Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        // Generate Firebase custom token
        const firebaseToken = await admin.auth().createCustomToken(user.id.toString());
        res.cookie("token", firebaseToken, { httpOnly: true, secure: false, maxAge: 86400000 }); // 1 day cookie
        res.status(200).json({ message: "Login successful", firebaseToken });
    });
});

// Dashboard route (protected)
app.get("/dashboard", verifyToken, (req, res) => {
    const userId = req.user.uid;  // Firebase user ID
    db.query("SELECT username FROM users WHERE id = ?", [userId], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: `Welcome to the dashboard, ${result[0].username}!` });
    });
});

// Logout route
app.post("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the cookie on logout
    res.status(200).json({ message: "Logged out successfully" });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
