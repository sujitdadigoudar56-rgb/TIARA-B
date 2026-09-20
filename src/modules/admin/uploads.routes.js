const express = require('express');
const multer = require('multer');
const ApiError = require('../../common/ApiError');
const controller = require('./uploads.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new ApiError(400, 'Only image files are allowed'));
    cb(null, true);
  },
});

const router = express.Router();

router.post('/products', upload.array('images', 10), controller.uploadProductImages);

module.exports = router;
