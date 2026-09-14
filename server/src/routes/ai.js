// ─── AI Routes — Groq LPU™ Powered Travel Agent ────────────────────────────
// All AI inference happens server-side. No API keys exposed to clients.
import express from 'express';
import { aiChat, aiItinerary, aiBudgetPlanner, aiStatus } from '../services/groqService.js';

const router = express.Router();

// ─── 1. AI Chat — Full Conversational Travel Agent ─────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message = '', history = [] } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const result = await aiChat(message, history);

    res.json({
      success: true,
      reply: result.reply,
      actions: result.actions || [],
      source: result.source,
      model: result.model,
      latencyMs: result.latencyMs,
      cached: result.cached || false
    });
  } catch (error) {
    console.error('[AI Chat Route Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'AI agent is momentarily occupied. Please try again.',
      reply: "I'm experiencing a brief connection issue. Please try your question again in a moment — I'm here to help you plan the perfect trip! 🌍",
      actions: [
        { label: 'Explore Destinations', path: '/destinations', icon: 'compass' },
        { label: 'AI Trip Planner', path: '/itinerary', icon: 'sparkles' }
      ]
    });
  }
});

// ─── 2. AI Itinerary Generation — Neural Trip Synthesis ────────────────────
router.post('/itinerary', async (req, res) => {
  try {
    const {
      destination = 'Dubai',
      days = 4,
      pax = 2,
      budgetINR,
      budgetUSD,
      vibe = 'Luxury & Culture'
    } = req.body;

    const result = await aiItinerary({
      destination,
      days: Math.min(Math.max(Number(days) || 3, 1), 14),
      pax: Math.min(Math.max(Number(pax) || 2, 1), 10),
      budgetINR: budgetINR ? Number(budgetINR) : undefined,
      budgetUSD: budgetUSD ? Number(budgetUSD) : undefined,
      vibe
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Itinerary Route Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating AI itinerary.'
    });
  }
});

// ─── 3. AI Budget Planner — Multi-Destination Optimizer ────────────────────
router.post('/budget-planner', async (req, res) => {
  try {
    const {
      budgetUSD = 500,
      pax = 2,
      days = 4,
      preferences = ''
    } = req.body;

    const result = await aiBudgetPlanner({
      budgetUSD: Math.min(Math.max(Number(budgetUSD) || 500, 50), 50000),
      pax: Math.min(Math.max(Number(pax) || 2, 1), 10),
      days: Math.min(Math.max(Number(days) || 4, 1), 30),
      preferences: String(preferences).substring(0, 500)
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Budget Planner Route Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating budget plan.'
    });
  }
});

// ─── 4. AI Engine Status — Health Check & Metrics ──────────────────────────
router.get('/status', (_req, res) => {
  try {
    const status = aiStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
