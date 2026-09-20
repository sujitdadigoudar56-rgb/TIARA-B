const express = require('express');
const Category = require('./category.model');
const { makeCrudController } = require('./crudFactory');

const controller = makeCrudController(Category, { searchFields: ['name', 'slug'], label: 'Category' });
const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
