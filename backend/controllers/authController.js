// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { auditLog } = require("../utils/auditLog");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const storedHash = (user.password_hash || "").trim();
    const ok = await bcrypt.compare(password, storedHash);

    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    await auditLog({
      userId: user.id,
      action: "LOGIN",
      resourceType: "user",
      resourceId: user.id,
      details: { email: user.email, role: user.role },
      req
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { login };
