// backend/routes/campaigns.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/rbac");
const campaignController = require("../controllers/campaignController");

// Everyone must be logged in to use campaigns APIs
router.use(auth);

// Everyone can view campaign list + details (read-only is allowed)
router.get("/", campaignController.listCampaigns);
router.get("/:campaignId", campaignController.getCampaign);

// Only Admin + Instructor can create campaigns
router.post("/", allowRoles("admin", "instructor"), campaignController.createCampaign);

// Only Admin + Instructor can view recipient emails
router.get("/:campaignId/recipients", allowRoles("admin", "instructor"), campaignController.getRecipients);

// Launch: Admin + Instructor, but controller enforces "instructor only launches own"
router.post("/:campaignId/launch", allowRoles("admin", "instructor"), campaignController.launchCampaign);

// Delete: Admin only
router.delete("/:campaignId", allowRoles("admin"), campaignController.deleteCampaign);

module.exports = router;
