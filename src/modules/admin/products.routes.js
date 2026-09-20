const express = require('express');
const Product = require('../products/product.model');
const { makeCrudController } = require('./crudFactory');

const controller = makeCrudController(Product, { searchFields: ['title', 'slug', 'category'], label: 'Product' });
const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
