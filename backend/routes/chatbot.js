const express = require('express');
const router = express.Router();

// Chat with AI health assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Basic validation
    if (!message || !userId) {
      return res.status(400).json({ message: 'Message and userId are required' });
    }

    // TODO: Implement Groq API integration
    // For now, return a dummy response
    const response = {
      message: 'This is a dummy response from the health assistant. Groq API integration coming soon.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat history
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    // TODO: Fetch chat history from Google Sheets
    res.json({ 
      message: 'Chat history',
      userId,
      history: [] // TODO: Implement actual data fetching
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
