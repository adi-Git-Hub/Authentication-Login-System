// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// JWT
// =========================
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

// =========================
// EMAIL TRANSPORTER
// =========================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =========================
// TEMP REGISTER STORAGE
// =========================
let tempUsers = {};

// AUTO CLEANUP – every 5 min
setInterval(() => {
  const now = Date.now();
  for (const email in tempUsers) {
    if (now > tempUsers[email].expiryAt) {
      delete tempUsers[email];
    }
  }
}, 5 * 60 * 1000);

// =====================================================================
// REGISTER STEP 1 — SEND OTP (30-sec expiry)
// =====================================================================
app.post("/register-step1", async (req, res) => {
  const { username, email } = req.body;

  try {
    const check = await pool.query(
      "SELECT 1 FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );
    if (check.rows.length > 0)
      return res.json({ success: false, message: "User already exists" });

    // remove old session if exists
    if (tempUsers[email]) delete tempUsers[email];

    const count = await pool.query("SELECT COUNT(*) FROM users");
    const role = Number(count.rows[0].count) === 0 ? "admin" : "user";

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ⭐ 30-second expiry added
    tempUsers[email] = {
      username,
      email,
      otp,
      otpVerified: false,
      role,
      updatedAt: Date.now(),
      expiryAt: Date.now() + 30 * 1000 // 30 sec expiry
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification OTP",
      html: `<h2>Your OTP: ${otp}</h2>`,
    });

    return res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    console.error("REGISTER STEP1 ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// =====================================================================
// REGISTER STEP 2 — VERIFY OTP + CHECK EXPIRY
// =====================================================================
app.post("/register-step2", (req, res) => {
  const { email, otp } = req.body;

  const t = tempUsers[email];
  if (!t)
    return res.json({ success: false, message: "Session expired" });

  // ⭐ EXPIRY CHECK
  if (Date.now() > t.expiryAt) {
    delete tempUsers[email];
    return res.json({ success: false, message: "OTP expired, resend again" });
  }

  if (t.otp !== otp)
    return res.json({ success: false, message: "Invalid OTP" });

  tempUsers[email].otpVerified = true;
  tempUsers[email].updatedAt = Date.now();

  return res.json({ success: true, message: "OTP verified" });
});

// =====================================================================
// REGISTER STEP 3 — SET PASSWORD
// =====================================================================
app.post("/register-step3", async (req, res) => {
  const { email, password } = req.body;

  try {
    const t = tempUsers[email];
    if (!t)
      return res.json({ success: false, message: "Session expired" });

    if (!t.otpVerified)
      return res.json({ success: false, message: "OTP not verified" });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, email_verified, role)
       VALUES ($1, $2, $3, true, $4)`,
      [t.username, t.email, hashed, t.role]
    );

    delete tempUsers[email];
    return res.json({ success: true, message: "Account created" });

  } catch (err) {
    console.error("REGISTER STEP3 ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// =====================================================================
// LOGIN
// =====================================================================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0)
      return res.json({ success: false, message: "Invalid username or password" });

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({ success: true, token, role: user.role });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// =====================================================================
// FORGOT PASSWORD — STEP 1
// =====================================================================
app.post("/forgot-password", async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND email=$2",
      [username, email]
    );

    if (user.rows.length === 0)
      return res.json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "UPDATE users SET reset_otp=$1, reset_verified=false WHERE email=$2",
      [otp, email]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your Reset OTP: ${otp}</h2>`
    });

    return res.json({ success: true, message: "Reset OTP sent!" });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// =====================================================================
// FORGOT PASSWORD — STEP 2 (VERIFY)
// =====================================================================
app.post("/forgot-password-verify", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const cleanOtp = otp.trim();

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND reset_otp=$2",
      [email, cleanOtp]
    );

    if (user.rows.length === 0)
      return res.json({ success: false, message: "Invalid OTP" });

    await pool.query(
      "UPDATE users SET reset_verified=true WHERE email=$1",
      [email]
    );

    return res.json({ success: true, message: "OTP verified!" });

  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// =====================================================================
// FORGOT PASSWORD — STEP 3 (RESET PASSWORD)
// =====================================================================
app.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND reset_verified=true",
      [email]
    );

    if (check.rows.length === 0)
      return res.json({ success: false, message: "OTP not verified" });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password=$1, reset_verified=false, reset_otp=NULL WHERE email=$2",
      [hashed, email]
    );

    return res.json({ success: true, message: "Password updated!" });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// =====================================================================
// PROTECTED USER DASHBOARD
// =====================================================================
app.get("/protected-dashboard", (req, res) => {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ success: false, message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// =====================================================================
// START SERVER
// =====================================================================
app.listen(5000, () => console.log("Backend running on http://localhost:5000"));

