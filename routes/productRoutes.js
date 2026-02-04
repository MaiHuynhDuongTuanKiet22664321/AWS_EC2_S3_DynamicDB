const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');

// Configure multer for memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', productController.getAllProducts);
router.get('/add', productController.getAddProductPage);
router.post('/add', upload.single('image'), productController.createProduct);
router.get('/edit/:id', productController.getEditProductPage);
router.post('/edit/:id', upload.single('image'), productController.updateProduct);
router.post('/delete/:id', productController.deleteProduct);

module.exports = router;
