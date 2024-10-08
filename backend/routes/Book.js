const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/Book');


router.get('/', bookCtrl.getAllBook);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.createRating);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;