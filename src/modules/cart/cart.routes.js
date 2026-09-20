const express = require('express');
const controller = require('./cart.controller');

const router = express.Router();

router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.patch('/items/:itemId', controller.updateItem);
router.delete('/items/:itemId', controller.removeItem);

module.exports = router;
