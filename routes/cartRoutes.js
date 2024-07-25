const express = require('express');
const { addItemToCart, getCartItems, removeItemFromCart, updateCartItemQuantity } = require('../controllers/cartController');
const { protect } = require('../controllers/authController');
const router = express.Router();

// Add to cart items
router.post('/', protect, addItemToCart);

// Get cart items 
router.get('/', protect, getCartItems);

// remove from cart items
router.delete('/:printerId', protect, removeItemFromCart);

// update cart item quantity 
router.put('/:printerId', protect, updateCartItemQuantity);

module.exports = router;
