const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Printer = require('../models/Printer');
const mongoose = require('mongoose');

exports.addItemToCart = asyncHandler(async (req, res) => {
  const { printerId, quantity } = req.body;
  const userId = req.user._id;

  // Check if printerId is provided and is a valid ObjectId
  if (printerId && !mongoose.Types.ObjectId.isValid(printerId)) {
    return res.status(400).json({ message: 'Invalid printerId' });
  }

  // Check if the printer exists
  const printer = await Printer.findById(printerId);
  if (!printer) {
    return res.status(404).json({ message: 'Printer not found' });
  }

  // Find the cart for the user
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create a new cart if not found
    cart = await Cart.create({ userId, items: [] });
  }

  // Set default quantity if not provided
  const itemQuantity = quantity || 1;

  // Check if the item is already in the cart
  const cartItem = cart.items.find(item => item.printerId.toString() === printerId);

  if (cartItem) {
    // Update the quantity if the item is already in the cart
    cartItem.quantity += itemQuantity;
  } else {
    // Add new item to the cart
    cart.items.push({ printerId, quantity: itemQuantity });
  }

  await cart.save();
  res.status(200).json(cart);
});

exports.getCartItems = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate('items.printerId', '_id productTitle price discountPercentage discountedPrice');

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  res.json(cart);
});

exports.removeItemFromCart = asyncHandler(async (req, res) => {
  const { printerId } = req.params;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(item => item.printerId.toString() === printerId);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  res.json(cart);
});

exports.updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { printerId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than zero' });
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const cartItem = cart.items.find(item => item.printerId.toString() === printerId);

  if (!cartItem) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  cartItem.quantity = quantity;
  await cart.save();
  res.json(cart);
});
