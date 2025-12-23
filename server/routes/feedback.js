import express from 'express';


const router = express.Router();

/**
 * POST /api/feedback
 * Log user feedback (thumbs up/down)
 */
router.post('/', async (req, res) => {
  try {
    const { query, response, feedback, comment } = req.body;
    
    if (!feedback || !['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({
        error: 'Invalid feedback. Must be "positive" or "negative"',
      });
    }
    
    logUserFeedback({
      query,
      response: response?.substring(0, 200), // Store first 200 chars
      feedback,
      comment: comment || '',
      timestamp: new Date().toISOString(),
    });
    
    res.json({
      success: true,
      message: 'Feedback received. Thank you!',
    });
    
  } catch (error) {
    console.error('Error logging feedback:', error);
    res.status(500).json({
      error: 'Failed to log feedback',
    });
  }
});

/**
 * GET /api/feedback/analytics
 * Get analytics summary (for internal use)
 */
router.get('/analytics', async (req, res) => {
  try {
    const { getAnalyticsSummary } = await import('../utils/logger.js');
    const analytics = getAnalyticsSummary();
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
    });
  }
});

export default router;