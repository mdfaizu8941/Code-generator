const { GoogleGenAI } = require('@google/genai');

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

    res.status(200).json({
      success: true,
      data: generatedCode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to generate code. Please try again later.' });
  }
};
