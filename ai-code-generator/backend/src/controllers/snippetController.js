const Snippet = require('../models/Snippet');

// @desc    Get all snippets for a user with pagination, filtering, and sorting
// @route   GET /api/snippets
// @access  Private
exports.getSnippets = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      language, 
      framework, 
      search, 
      isFavorite, 
      sort = '-createdAt' 
    } = req.query;

    const query = { user: req.user.id };

    // Filters
    if (language && language !== 'all') query.language = language;
    if (framework && framework !== 'all') query.framework = framework;
    if (isFavorite === 'true') query.isFavorite = true;

    // Search by title or prompt
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } }
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await Snippet.countDocuments(query);

    // Build the query
    const snippets = await Snippet.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: snippets.length,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      },
      data: snippets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new snippet
// @route   POST /api/snippets
// @access  Private
exports.createSnippet = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const snippet = await Snippet.create(req.body);

    res.status(201).json({
      success: true,
      data: snippet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update snippet
// @route   PUT /api/snippets/:id
// @access  Private
exports.updateSnippet = async (req, res, next) => {
  try {
    let snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    // Make sure user owns snippet
    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this snippet' });
    }

    snippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: snippet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete snippet
// @route   DELETE /api/snippets/:id
// @access  Private
exports.deleteSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    // Make sure user owns snippet
    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this snippet' });
    }

    await Snippet.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
