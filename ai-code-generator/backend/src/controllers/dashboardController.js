const User = require('../models/User');

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Reset generationsToday if last generation wasn't today
    const now = new Date();
    const lastGen = user.stats.lastGenerationAt;
    const isToday = lastGen && 
      lastGen.getDate() === now.getDate() && 
      lastGen.getMonth() === now.getMonth() && 
      lastGen.getFullYear() === now.getFullYear();

    let generatedToday = user.stats.generationsToday || 0;
    if (lastGen && !isToday) {
      generatedToday = 0; // It resets
    }

    res.status(200).json({
      success: true,
      data: {
        generatedToday: generatedToday,
        totalGenerations: user.stats.totalGenerations || 0,
        savedSnippets: user.stats.savedSnippetCount || 0,
        tokensUsed: user.stats.totalTokensUsed || 0,
        timeSavedMinutes: user.stats.totalTimeSaved || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
