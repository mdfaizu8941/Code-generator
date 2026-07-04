const express = require('express');
const { getSnippets, createSnippet, updateSnippet, deleteSnippet } = require('../controllers/snippetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getSnippets)
  .post(protect, createSnippet);

router.route('/:id')
  .put(protect, updateSnippet)
  .delete(protect, deleteSnippet);

module.exports = router;
