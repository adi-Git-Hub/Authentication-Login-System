const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

// =============================================
// TEMP REGISTRATION MEMORY STORE
// =============================================
let tempUsers = {}; 
// tempUsers[email] = { username, email, otp, role, otpVerified, updatedAt }

// =============================================
// EMAIL CONFIG (GMAIL SMTP)
// =============================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =============================================
// AUTO CLEANUP FOR tempUsers (10 min)
// =============================================
setInterval(() => {
  const now = Date.now();
  for (const email in tempUsers) {
    if (now - tempUsers[email].updatedAt > 10 * 60 * 1000) {
      delete tempUsers[email];
    }
  }
}, 5 * 60 * 1000);


// =====================================================================
// REGISTER STEP 1 → SEND OTP
// =====================================================================
router.post("/register-step1", async (req, res) => {
  const { username, email } = req.body;

  try {
    const usernameCheck = await pool.query(
      "SELECT 1 FROM users WHERE username=$1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res.json({ success: false, message: "Username already exists" });
    }

    const emailCheck = await pool.query(
      "SELECT 1 FROM users WHERE email=$1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.json({ success: false, message: "Email already taken" });
    }

    if (tempUsers[email]) delete tempUsers[email];

    const count = await pool.query("SELECT COUNT(*) FROM users");
    const role = Number(count.rows[0].count) === 0 ? "admin" : "user";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    tempUsers[email] = {
      username,
      email,
      otp,
      role,
      otpVerified: false,
      updatedAt: Date.now(),
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification OTP",
      html: `<h2>Your OTP: ${otp}</h2>`,
    });

    return res.json({ success: true, message: "OTP sent!", role });

  } catch (err) {
    console.error("REGISTER STEP 1 ERROR:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// =====================================================================
// REGISTER STEP 2 → VERIFY OTP
// =====================================================================
router.post("/register-step2", (req, res) => {
  const { email, otp } = req.body;

  const t = tempUsers[email];

  if (!t)
    return res.json({ success: false, message: "Session expired. Restart signup." });

  if (t.otp !== otp)
    return res.json({ success: false, message: "Invalid OTP" });

  tempUsers[email].otpVerified = true;
  tempUsers[email].updatedAt = Date.now();

  return res.json({ success: true, message: "OTP Verified!" });
});


// =====================================================================
// REGISTER STEP 3 → SET PASSWORD + SAVE TO DB
// =====================================================================
router.post("/set-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    const t = tempUsers[email];

    if (!t)
      return res.json({
        success: false,
        message: "Session expired. Restart registration."
      });

    if (!t.otpVerified)
      return res.json({
        success: false,
        message: "OTP not verified yet."
      });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password, email_verified, role) VALUES ($1,$2,$3,$4,$5)",
      [t.username, t.email, hashed, true, t.role]
    );

    delete tempUsers[email];

    return res.json({ success: true, message: "Account created!" });

  } catch (err) {
    console.error("SET PASSWORD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// =====================================================================
// LOGIN
// =====================================================================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: "Invalid Username or Password" });

    const user = result.rows[0];

    if (!user.email_verified)
      return res.status(401).json({ success: false, message: "Email not verified." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid Username or Password" });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      success: true,
      message: "Login Success",
      token,
      role: user.role
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// =====================================================================
// FORGOT PASSWORD – STEP 1 → SEND RESET OTP
// =====================================================================
router.post("/forgot-password", async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND email=$2",
      [username, email]
    );

    if (user.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "UPDATE users SET reset_otp=$1, reset_verified=false WHERE email=$2",
      [otp, email]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your Password Reset OTP: ${otp}</h2>`
    });

    return res.json({ success: true, message: "Reset OTP sent!" });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// =====================================================================
// FORGOT PASSWORD – STEP 2 → VERIFY RESET OTP
// =====================================================================
router.post("/forgot-password-verify", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND reset_otp=$2",
      [email, otp]
    );

    if (user.rows.length === 0) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    await pool.query(
      "UPDATE users SET reset_verified=true WHERE email=$1",
      [email]
    );

    return res.json({ success: true, message: "OTP verified!" });

  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// =====================================================================
// FORGOT PASSWORD – STEP 3 → RESET PASSWORD
// =====================================================================
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND reset_verified=true",
      [email]
    );

    if (user.rows.length === 0) {
      return res.json({ success: false, message: "OTP not verified" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users 
       SET password=$1, reset_otp=NULL, reset_verified = false 
       WHERE email=$2`,
      [hashed, email]
    );

    return res.json({ success: true, message: "Password updated!" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


module.exports = router;
