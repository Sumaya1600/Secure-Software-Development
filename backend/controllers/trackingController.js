// backend/controllers/trackingController.js
const db = require('../config/database');

const recordEvent = async (trackingToken, eventType, req) => {
  try {
    const recipientResult = await db.query(
      'SELECT id, campaign_id FROM recipients WHERE tracking_token = ?',
      [trackingToken]
    );
    
    if (recipientResult.rows.length === 0) {
      return null;
    }
    
    const recipient = recipientResult.rows[0];
    
    const existingEvent = await db.query(
      'SELECT id FROM events WHERE recipient_id = ? AND event_type = ?',
      [recipient.id, eventType]
    );
    
    if (existingEvent.rows.length > 0 && eventType !== 'clicked') {
      return recipient;
    }
    
    await db.query(
      `INSERT INTO events (recipient_id, event_type, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [
        recipient.id,
        eventType,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]
    );
    
    return recipient;
    
  } catch (error) {
    console.error('Record event error:', error);
    return null;
  }
};

exports.trackOpen = async (req, res) => {
  const { token } = req.params;
  
  await recordEvent(token, 'opened', req);
  
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(pixel);
};

exports.trackClick = async (req, res) => {
  const { token } = req.params;
  
  const recipient = await recordEvent(token, 'clicked', req);
  
  if (!recipient) {
    return res.status(404).send('Invalid tracking link');
  }
  
  res.redirect(`${process.env.FRONTEND_URL}/education/${token}`);
};

exports.trackReport = async (req, res) => {
  const { token } = req.params;
  
  const recipient = await recordEvent(token, 'reported', req);
  
  if (!recipient) {
    return res.status(404).json({ error: 'Invalid token' });
  }
  
  res.json({ 
    success: true, 
    message: 'Thank you for reporting this suspicious email!' 
  });
};

exports.getCampaignStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const stats = await db.query(
      `SELECT 
        COUNT(DISTINCT r.id) as total_recipients,
        COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN r.id END) as opens,
        COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN r.id END) as clicks,
        COUNT(DISTINCT CASE WHEN e.event_type = 'reported' THEN r.id END) as reports,
        ROUND(
          (COUNT(DISTINCT CASE WHEN e.event_type = 'opened' THEN r.id END) / 
           NULLIF(COUNT(DISTINCT r.id), 0)) * 100, 
          2
        ) as open_rate,
        ROUND(
          (COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' THEN r.id END) / 
           NULLIF(COUNT(DISTINCT r.id), 0)) * 100, 
          2
        ) as click_rate,
        ROUND(
          (COUNT(DISTINCT CASE WHEN e.event_type = 'reported' THEN r.id END) / 
           NULLIF(COUNT(DISTINCT r.id), 0)) * 100, 
          2
        ) as report_rate
       FROM recipients r
       LEFT JOIN events e ON r.id = e.recipient_id
       WHERE r.campaign_id = ?`,
      [campaignId]
    );
    
    res.json({ stats: stats.rows[0] });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
};