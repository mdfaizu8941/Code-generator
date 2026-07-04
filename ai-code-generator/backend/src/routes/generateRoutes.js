const express = require('express');
const { generateCode } = require('../controllers/generateController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, generateCode);

module.exports = router;
