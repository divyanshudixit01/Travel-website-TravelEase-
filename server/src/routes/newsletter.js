import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: cleanEmail });

    if (existing) {
      return res.json({
        success: true,
        message: "You're already subscribed to TravelEase VIP Fare Radar! Check your inbox for secret drops."
      });
    }

    await Newsletter.create({ email: cleanEmail });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to TravelEase VIP Radar! A 15% welcome travel voucher has been dispatched to your inbox."
    });
  } catch (error) {
    console.error('[Newsletter Route Error]:', error);
    res.status(500).json({ success: false, message: 'Server error subscribing to newsletter.' });
  }
});

export default router;
