// IRCTC API Routes — Express router proxying IRCTC RapidAPI & Pan-India Timetable calls
import express from 'express';
import {
  getTrainsBetweenStations,
  getPnrStatus,
  getLiveTrainStatus,
  getTrainSchedule,
  getStationLiveBoard,
  getTrainDetails,
  getSeatAvailability,
  getCoachLayout,
  getRealFare,
  checkApiKeyHealth,
  searchStationsMaster,
  searchTrainsByNameOrNumber
} from '../services/irctcService.js';
import cache from '../utils/cacheManager.js';

const router = express.Router();

// GET /api/irctc/stations?query=tanakpur
router.get('/stations', (req, res) => {
  try {
    const { query } = req.query;
    const stations = searchStationsMaster(query);
    res.json({ success: true, count: stations.length, stations });
  } catch (error) {
    console.error('[IRCTC Route] /stations error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to search stations' });
  }
});

// GET /api/irctc/trains/search?query=triveni
router.get('/trains/search', (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Missing required param: query' });
    }
    const trains = searchTrainsByNameOrNumber(query);
    res.json({ success: true, count: trains.length, trains });
  } catch (error) {
    console.error('[IRCTC Route] /trains/search error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to search trains' });
  }
});

// GET /api/irctc/trains?from=SPN&to=LKO&date=20260905
router.get('/trains', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    if (!from || !to || !date) {
      return res.status(400).json({ success: false, message: 'Missing required params: from, to, date' });
    }
    const data = await getTrainsBetweenStations(from, to, date);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /trains error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch train data' });
  }
});

// GET /api/irctc/pnr/:pnr
router.get('/pnr/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;
    if (!pnr || pnr.length !== 10) {
      return res.status(400).json({ success: false, message: 'PNR must be a 10-digit number' });
    }
    const data = await getPnrStatus(pnr);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[IRCTC Route] /pnr error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch PNR status' });
  }
});

// GET /api/irctc/live-status?train_number=12230&date=20260905
router.get('/live-status', async (req, res) => {
  try {
    const { train_number, date } = req.query;
    if (!train_number) {
      return res.status(400).json({ success: false, message: 'Missing required param: train_number' });
    }
    const data = await getLiveTrainStatus(train_number, date);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /live-status error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch live status' });
  }
});

// GET /api/irctc/schedule?train_number=12230
router.get('/schedule', async (req, res) => {
  try {
    const { train_number } = req.query;
    if (!train_number) {
      return res.status(400).json({ success: false, message: 'Missing required param: train_number' });
    }
    const data = await getTrainSchedule(train_number);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /schedule error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch train schedule' });
  }
});

// GET /api/irctc/schedule/:trainNumber
router.get('/schedule/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    if (!trainNumber) {
      return res.status(400).json({ success: false, message: 'Missing required param: trainNumber' });
    }
    const data = await getTrainSchedule(trainNumber);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /schedule/:trainNumber error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch train schedule' });
  }
});

// GET /api/irctc/station-board/:stationCode
router.get('/station-board/:stationCode', async (req, res) => {
  try {
    const { stationCode } = req.params;
    if (!stationCode) {
      return res.status(400).json({ success: false, message: 'Missing stationCode parameter' });
    }
    const data = await getStationLiveBoard(stationCode);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /station-board error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch station board' });
  }
});

// GET /api/irctc/train/:trainNumber
router.get('/train/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    if (!trainNumber) {
      return res.status(400).json({ success: false, message: 'Missing trainNumber parameter' });
    }
    const data = await getTrainDetails(trainNumber);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /train/:trainNumber error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch train details' });
  }
});

// GET /api/irctc/seat-availability?train=12004&from=LKO&to=NDLS&date=20260906&class=3A
router.get('/seat-availability', async (req, res) => {
  try {
    const { train, from, to, date, class: classType } = req.query;
    if (!train) {
      return res.status(400).json({ success: false, message: 'Missing train parameter' });
    }
    const data = await getSeatAvailability(train, from, to, date, classType);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /seat-availability error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch seat availability' });
  }
});

// GET /api/irctc/fare?train=12004&from=NDLS&to=LKO&class=3A
router.get('/fare', async (req, res) => {
  try {
    const { train, from, to, class: classType } = req.query;
    if (!train) {
      return res.status(400).json({ success: false, message: 'Missing train parameter' });
    }
    const data = await getRealFare(train, from, to, classType);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /fare error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch fare' });
  }
});

// GET /api/irctc/coach-position/:trainNumber
router.get('/coach-position/:trainNumber', async (req, res) => {
  try {
    const { trainNumber } = req.params;
    if (!trainNumber) {
      return res.status(400).json({ success: false, message: 'Missing trainNumber parameter' });
    }
    const data = await getCoachLayout(trainNumber);
    res.json(data);
  } catch (error) {
    console.error('[IRCTC Route] /coach-position error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch coach layout' });
  }
});

// GET /api/irctc/key-status — audit and health check of RapidAPI key
router.get('/key-status', async (req, res) => {
  try {
    const health = await checkApiKeyHealth();
    res.json({ success: true, health });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/irctc/cache-stats — real-time cache analytics, hits, saved API quota
router.get('/cache-stats', (req, res) => {
  res.json({ success: true, stats: cache.getStats() });
});

// POST /api/irctc/cache/flush — flush cache
router.post('/cache/flush', (req, res) => {
  cache.flush();
  res.json({ success: true, message: 'All IRCTC cache entries flushed successfully' });
});

export default router;
