const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../images/multer-config');
const optimizeImage = require('../images/sharp-config');

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, optimizeImage, bookCtrl.createBook);
router.get('/bestrating', bookCtrl.bestRatedBooks);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, optimizeImage, bookCtrl.modifyBook);
router.delete('/:id', auth, multer, bookCtrl.deleteBook);

module.exports = router;