import express from 'express';
import { processChatMessage } from '../lib/chatEngine.js';
import { requireAuth } from '../middleware/auth.js';
import { sensitiveLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', sensitiveLimiter, requireAuth, async (req, res) => {
  try {
    const { message, messages, preferredLanguage: rawLang = 'en' } = req.body;
    const preferredLanguage = ['en', 'ta', 'hi', 'ml'].includes(rawLang) ? rawLang : 'en';
    // Support either single message string or array of messages from previous UI
    let queryText = message;
    if (!queryText && Array.isArray(messages) && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user' || m.role === 'user');
      queryText = lastUserMsg ? (lastUserMsg.text || lastUserMsg.content) : '';
    }

    if (!queryText || typeof queryText !== 'string' || queryText.length > 500) {
      return res.status(400).json({ error: 'A message (max 500 characters) is required' });
    }

    const result = await processChatMessage({
      message: queryText,
      preferredLanguage
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Chat processing error:', err);
    res.status(500).json({
      error: 'Failed to process chat message'
    });
  }
});

export default router;
