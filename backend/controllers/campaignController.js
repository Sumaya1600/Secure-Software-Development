// backend/controllers/campaignController.js
const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");
const { auditLog } = require("../utils/auditLog");

// Admin/Instructor can create
async function createCampaign(req, res) {
  try {
    const { name, template_subject, template_body, scheduled_at, recipients } = req.body;

    if (!name || !template_subject || !template_body) {
      return res.status(400).json({ message: "Missing campaign fields" });
    }

    const list = Array.isArray(recipients)
      ? recipients
      : String(recipients || "")
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean);

    if (list.length === 0) return res.status(400).json({ message: "Recipients required" });
    if (list.length > 1000) return res.status(400).json({ message: "Max 1000 recipients per campaign" });

    const campaignId = uuidv4();
    await db.query(
      `INSERT INTO campaigns (id, name, template_subject, template_body, created_by, scheduled_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
      [campaignId, name, template_subject, template_body, req.user.id, scheduled_at || null]
    );

    // Insert recipients
    for (const email of list) {
      const token = uuidv4();
      await db.query(
        `INSERT INTO recipients (id, campaign_id, email, tracking_token)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), campaignId, email, token]
      );
    }

    await auditLog({
      userId: req.user.id,
      action: "CREATE_CAMPAIGN",
      resourceType: "campaign",
      resourceId: campaignId,
      details: { name, recipientCount: list.length },
      req
    });

    return res.status(201).json({ id: campaignId, message: "Campaign created" });
  } catch (err) {
    console.error("createCampaign error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Everyone can view campaigns list, but data differs by role
async function listCampaigns(req, res) {
  try {
    const { rows: campaigns } = await db.query(
      `SELECT c.id, c.name, c.status, c.scheduled_at, c.created_at, u.email AS created_by_email, c.created_by
       FROM campaigns c
       LEFT JOIN users u ON u.id = c.created_by
       ORDER BY c.created_at DESC`,
      []
    );

    // If Viewer: don't include recipient emails anywhere, only summary
    return res.json({ campaigns });
  } catch (err) {
    console.error("listCampaigns error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Everyone can view campaign summary
async function getCampaign(req, res) {
  try {
    const { campaignId } = req.params;

    const { rows } = await db.query(
      `SELECT id, name, template_subject, template_body, created_by, scheduled_at, status, created_at
       FROM campaigns WHERE id = ?`,
      [campaignId]
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: "Not found" });

    return res.json(rows[0]);
  } catch (err) {
    console.error("getCampaign error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Only Admin/Instructor can view recipients (emails)
async function getRecipients(req, res) {
  try {
    const { campaignId } = req.params;

    const { rows } = await db.query(
      `SELECT id, email, tracking_token, created_at
       FROM recipients
       WHERE campaign_id = ?
       ORDER BY created_at ASC`,
      [campaignId]
    );

    return res.json({ recipients: rows });
  } catch (err) {
    console.error("getRecipients error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Admin can delete. Instructor cannot.
async function deleteCampaign(req, res) {
  try {
    const { campaignId } = req.params;

    await db.query(`DELETE FROM campaigns WHERE id = ?`, [campaignId]);

    await auditLog({
      userId: req.user.id,
      action: "DELETE_CAMPAIGN",
      resourceType: "campaign",
      resourceId: campaignId,
      details: {},
      req
    });

    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteCampaign error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Admin/Instructor can launch, BUT Instructor can only launch their own campaign
async function launchCampaign(req, res) {
  try {
    const { campaignId } = req.params;

    const { rows: cRows } = await db.query(`SELECT * FROM campaigns WHERE id = ?`, [campaignId]);
    if (!cRows || cRows.length === 0) return res.status(404).json({ message: "Not found" });

    const campaign = cRows[0];

    if (req.user.role === "instructor" && campaign.created_by !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: instructors can only launch their own campaigns" });
    }

    await db.query(`UPDATE campaigns SET status = 'active' WHERE id = ?`, [campaignId]);

    await auditLog({
      userId: req.user.id,
      action: "LAUNCH_CAMPAIGN",
      resourceType: "campaign",
      resourceId: campaignId,
      details: {},
      req
    });

    return res.json({ message: "Campaign launched" });
  } catch (err) {
    console.error("launchCampaign error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createCampaign,
  listCampaigns,
  getCampaign,
  getRecipients,
  deleteCampaign,
  launchCampaign
};
