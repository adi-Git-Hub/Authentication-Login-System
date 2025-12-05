const db = require("../db");
const bcrypt = require("bcrypt");

// TEMPORARY OTP STORE (RESET ON SERVER RESTART)
const otpStore = {}; // { email: { username, otp } }

// ==========================
// 1) SEND OTP (No DB Insert)
// ==========================
exports.registration = async (req, res) => {
  const { username, email } = req.body;

  try {
    // Check if already final user exists
    const userExists = await db.query(
      "SELECT * FROM users WHERE email=$1 OR username=$2",
      [email, username]
    );

    if (userExists.rowCount > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store temporarily in memory
    otpStore[email] = { username, otp };

    console.log("Generated OTP:", otp); // Debug

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// 2) VERIFY OTP (Still No DB)
// ==========================
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!otpStore[email]) {
      return res.status(400).json({ error: "OTP not requested" });
    }

    if (otpStore[email].otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark as verified
    otpStore[email].verified = true;

    return res.json({ message: "OTP Verified" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// 3) CREATE PASSWORD (Only Now Insert to DB)
// ==========================
exports.createPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check OTP + user info exist
    if (!otpStore[email] || !otpStore[email].verified) {
      return res.status(400).json({ error: "OTP not verified" });
    }

    const username = otpStore[email].username;

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert final user into DB
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hash]
    );

    // Cleanup temp OTP store
    delete otpStore[email];

    return res.json({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

