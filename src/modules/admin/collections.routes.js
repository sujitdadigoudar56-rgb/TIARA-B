const express = require('express');
const Collection = require('./collection.model');
const { makeCrudController } = require('./crudFactory');

const controller = makeCrudController(Collection, {
  searchFields: ['title', 'slug'],
  populate: { path: 'products', select: 'title slug price images' },
  label: 'Collection',
});
const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
