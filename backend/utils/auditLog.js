// backend/utils/auditLog.js
const db = require("../config/database");

async function auditLog({ userId, action, resourceType = null, resourceId = null, details = null, req }) {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
    const jsonDetails = details ? JSON.stringify(details) : null;

    await db.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, resourceType, resourceId, jsonDetails, ip]
    );
  } catch (e) {
    // Don't crash app if audit log fails
    console.error("Audit log failed:", e.message);
  }
}

module.exports = { auditLog };
