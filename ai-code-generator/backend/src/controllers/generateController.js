const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');

// @desc    Generate code using Gemini
// @route   POST /api/generate
// @access  Private
exports.generateCode = async (req, res) => {
  try {
    const { prompt, language, framework } = req.body;

    if (!prompt || !language) {
      return res.status(400).json({ success: false, error: 'Prompt and language are required' });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const systemInstruction = `You are an expert ${language} and ${framework || 'general'} developer.
Generate production-ready code based on the user's prompt. 
Provide the complete code, explanation, and any necessary run/install commands.
Structure your response clearly. Use markdown formatting.
If the request is ambiguous, make reasonable assumptions for a premium, clean solution.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
        }
    });

    const generatedCode = response.text;

    // --- Analytics Tracking ---
    if (req.user && req.user.id) {
      const charCount = (prompt?.length || 0) + (generatedCode?.length || 0);
      
      // Estimate or extract tokens
      let tokens = 0;
      if (response.usageMetadata && response.usageMetadata.totalTokenCount) {
        tokens = response.usageMetadata.totalTokenCount;
      } else {
        tokens = Math.ceil(charCount / 4); // rough estimation
      }

      // Estimate time saved based on output length
      let timeSaved = 2; // < 500 chars = 2 mins
      if (charCount > 2000) timeSaved = 10;
      else if (charCount > 500) timeSaved = 5;

      const user = await User.findById(req.user.id);
      if (user) {
        const now = new Date();
        const lastGen = user.stats.lastGenerationAt;
        
        // Check if last generation was today
        const isToday = lastGen && 
          lastGen.getDate() === now.getDate() && 
          lastGen.getMonth() === now.getMonth() && 
          lastGen.getFullYear() === now.getFullYear();
                        
        if (isToday) {
          user.stats.generationsToday = (user.stats.generationsToday || 0) + 1;
        } else {
          user.stats.generationsToday = 1;
        }
        
        user.stats.totalGenerations = (user.stats.totalGenerations || 0) + 1;
        user.stats.totalTokensUsed = (user.stats.totalTokensUsed || 0) + tokens;
        user.stats.totalTimeSaved = (user.stats.totalTimeSaved || 0) + timeSaved;
        user.stats.lastGenerationAt = now;
        
        await user.save({ validateBeforeSave: false }); // Skip validation just in case password missing
      }
    }

    res.status(200).json({
      success: true,
      data: generatedCode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to generate code. Please try again later.' });
  }
};
