import express from 'express';
import { processChatMessage } from '../lib/chatEngine.js';
import { sensitiveLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', sensitiveLimiter, async (req, res) => {
  try {
    const { message, messages, preferredLanguage = 'en' } = req.body;
    // Support either single message string or array of messages from previous UI
    let queryText = message;
    if (!queryText && Array.isArray(messages) && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user' || m.role === 'user');
      queryText = lastUserMsg ? (lastUserMsg.text || lastUserMsg.content) : '';
    }

    if (!queryText || typeof queryText !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
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
      error: 'Failed to process chat message',
      message: err.message
    });
  }
});

export default router;
