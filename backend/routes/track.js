import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Tracking route
router.get("/:token", async (req, res) => {
  const token = req.params.token;

  const event = await prisma.result.findUnique({
    where: { token },
    include: { campaign: true },
  });

  if (!event) return res.status(404).send("Invalid tracking link");

  // Mark as clicked
  await prisma.result.update({
    where: { token },
    data: { clicked: true },
  });

  // Redirect to teaching page
  res.redirect(`http://localhost:5173/landing?campaign=${event.campaignId}`);
});

export default router;
