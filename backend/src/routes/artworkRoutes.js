const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/artworkController');

router.get('/', c.list);
router.get('/:id', c.getById);

router.post('/', auth, c.create);
router.put('/:id', auth, c.update);
router.delete('/:id', auth, c.remove);

module.exports = router;
