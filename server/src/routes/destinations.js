import express from 'express';
import Destination from '../models/Destination.js';

const router = express.Router();

// GET /api/destinations
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const destinations = await Destination.find(query).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (error) {
    console.error('Destinations fetch error:', error);
    res.status(500).json({ message: 'Error fetching destinations.' });
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found.' });
    }
    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destination details.' });
  }
});

// POST /api/destinations (Admin)
router.post('/', async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ message: 'Error creating destination.', error: error.message });
  }
});

export default router;
