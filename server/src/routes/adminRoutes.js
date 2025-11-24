const router = require('express').Router();
const {
  loginAdmin,
  getAllResponses,
  deleteResponse,
} = require('../controllers/adminController');
const protectAdmin = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/responses', protectAdmin, getAllResponses);
router.delete('/responses/:id', protectAdmin, deleteResponse);

module.exports = router;

