import express from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const router = express.Router();

// Create campaign
router.post("/create", async (req, res) => {
  const { name, subject, emailBody, recipients, sendDate } = req.body;

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        emailBody,
        sendDate: new Date(sendDate),
      },
    });

    // Create unique tracking tokens
    for (const email of recipients) {
      await prisma.result.create({
        data: {
          recipient: email,
          token: uuidv4(),
          campaignId: campaign.id,
        },
      });
    }

    res.json({ message: "Campaign created", campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating campaign" });
  }
});

// Send emails (MailHog)
router.post("/send/:id", async (req, res) => {
  const campaignId = Number(req.params.id);

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { results: true },
  });

  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  // MailHog transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
  });

  for (const result of campaign.results) {
    const link = `http://localhost:4000/track/${result.token}`;

    await transporter.sendMail({
      from: "security@example.com",
      to: result.recipient,
      subject: campaign.subject,
      html: `${campaign.emailBody}<br><br>
             <a href="${link}">View Message</a>`,
    });
  }

  res.json({ message: "Emails sent (check MailHog)" });
});

export default router;
