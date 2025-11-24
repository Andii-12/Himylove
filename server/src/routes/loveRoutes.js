const router = require('express').Router();
const {
  getPrompts,
  getRandomDare,
  createResponse,
  getLatestResponses,
} = require('../controllers/loveController');

router.get('/prompts', getPrompts);
router.get('/dares/random', getRandomDare);
router
  .route('/responses')
  .post(createResponse);
router.get('/responses/latest', getLatestResponses);

module.exports = router;

