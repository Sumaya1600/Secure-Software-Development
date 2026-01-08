// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const db = require('../config/database');

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || 'localhost',
  port: process.env.MAILHOG_PORT || 1025,
  secure: false,
  ignoreTLS: true
});

const replaceVariables = (template, variables) => {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  return result;
};

const sendPhishingEmail = async (campaign, recipient) => {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  const variables = {
    link: `${baseUrl}/click/${recipient.tracking_token}`,
    recipient_email: recipient.email,
    tracking_pixel: `${baseUrl}/track/${recipient.tracking_token}`,
    report_link: `${process.env.FRONTEND_URL}/report/${recipient.tracking_token}`
  };
  
  const emailBody = replaceVariables(campaign.template_body, variables);
  const emailSubject = replaceVariables(campaign.template_subject, variables);
  
  const bodyWithTracking = emailBody + 
    `<img src="${variables.tracking_pixel}" width="1" height="1" style="display:none" alt="" />`;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'security-training@company.com',
      to: recipient.email,
      subject: emailSubject,
      html: bodyWithTracking
    });
    
    await db.query(
      `INSERT INTO events (recipient_id, event_type) VALUES (?, ?)`,
      [recipient.id, 'sent']
    );
    
    return { success: true, email: recipient.email };
  } catch (error) {
    console.error(`Failed to send to ${recipient.email}:`, error.message);
    return { success: false, email: recipient.email, error: error.message };
  }
};

exports.sendCampaignEmails = async (campaign, recipients) => {
  const results = { total: recipients.length, sent: 0, failed: 0, errors: [] };
  
  for (let i = 0; i < recipients.length; i++) {
    const result = await sendPhishingEmail(campaign, recipients[i]);
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push(result);
    }
    
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Campaign ${campaign.id}: Sent ${results.sent}/${results.total} emails`);
  return results;
};

exports.testEmailConfig = async () => {
  try {
    await transporter.verify();
    return { success: true, message: 'Email server is ready' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};