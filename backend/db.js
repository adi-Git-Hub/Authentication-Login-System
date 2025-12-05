const { Pool } = require("pg");

const pool = new Pool({
  user: "mac",          // ← आपका PostgreSQL user
  host: "localhost",
  database: "auth_demo", // ← IMPORTANT: यही आपका सही DB है
  password: "",          // अगर पासवर्ड है तो यहाँ डालना
  port: 5432,
});

module.exports = pool;

