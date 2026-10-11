import express from 'express';
import { processChatMessage, queryOmniRoute } from '../lib/chatEngine.js';
import { requireAuth } from '../middleware/auth.js';
import { sensitiveLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', sensitiveLimiter, requireAuth, async (req, res) => {
  try {
    const { 
      message, 
      messages, 
      preferredLanguage: rawLang = 'en',
      modelMode = 'cloud',
      history = []
    } = req.body;
    const preferredLanguage = ['en', 'ta', 'te', 'hi', 'ml'].includes(rawLang) ? rawLang : 'en';

    // Support either single message string or array of messages from UI
    let queryText = message;
    if (!queryText && Array.isArray(messages) && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user' || m.role === 'user');
      queryText = lastUserMsg ? (lastUserMsg.text || lastUserMsg.content) : '';
    }

    if (!queryText || typeof queryText !== 'string' || queryText.length > 500) {
      return res.status(400).json({ error: 'A message (max 500 characters) is required' });
    }

    let result;
    if (modelMode === 'cloud') {
      try {
        result = await queryOmniRoute({
          message: queryText,
          preferredLanguage,
          history: Array.isArray(history) && history.length > 0 ? history : (Array.isArray(messages) ? messages : [])
        });
      } catch (cloudErr) {
        console.warn('OmniRoute cloud model unavailable, falling back to local engine:', cloudErr.message);
        const localResult = await processChatMessage({
          message: queryText,
          preferredLanguage
        });
        result = {
          ...localResult,
          mode: 'local_fallback',
          fallbackNotice: `Cloud OmniRoute unreachable (${cloudErr.message}). Answered via Local Grounded Model.`
        };
      }
    } else {
      result = await processChatMessage({
        message: queryText,
        preferredLanguage
      });
      result.mode = 'local';
      result.model = 'local-grounded';
    }

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
