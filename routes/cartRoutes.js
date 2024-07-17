const express = require('express');
const { addItemToCart, getCartItems, removeItemFromCart, updateCartItemQuantity } = require('../controllers/cartController');
const { protect } = require('../controllers/authController');
const router = express.Router();

router.post('/', protect, addItemToCart);
router.get('/', protect, getCartItems);
router.delete('/:printerId', protect, removeItemFromCart);
router.put('/:printerId', protect, updateCartItemQuantity);

module.exports = router;
