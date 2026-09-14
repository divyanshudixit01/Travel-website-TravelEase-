import express from 'express';
import Inquiry from '../models/Inquiry.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const newInquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our concierge team will reach out within 2 business hours.',
      inquiryId: newInquiry._id
    });
  } catch (error) {
    console.error('[Inquiry Route Error]:', error);
    res.status(500).json({ success: false, message: 'Server error processing inquiry. Please try again later.' });
  }
});

export default router;
