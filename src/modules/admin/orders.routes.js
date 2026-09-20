const express = require('express');
const controller = require('./orders.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.remove);

module.exports = router;
