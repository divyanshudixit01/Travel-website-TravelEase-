import express from 'express';
import Itinerary from '../models/Itinerary.js';

const router = express.Router();

// GET /api/itineraries
router.get('/', async (req, res) => {
  try {
    const itineraries = await Itinerary.find().sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching itineraries.' });
  }
});

// POST /api/itineraries
router.post('/', async (req, res) => {
  try {
    const itinerary = await Itinerary.create(req.body);
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(400).json({ message: 'Error creating itinerary.', error: error.message });
  }
});

// DELETE /api/itineraries/:id
router.delete('/:id', async (req, res) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Itinerary deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting itinerary.' });
  }
});

export default router;
