const { randomUUID } = require('crypto');
const asyncHandler = require('../../common/asyncHandler');
const ApiError = require('../../common/ApiError');
const { uploadImage } = require('../../config/s3');

const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

const uploadProductImages = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files?.length) throw new ApiError(400, 'No files uploaded');

  const urls = await Promise.all(
    files.map((file) => {
      const ext = EXT_BY_MIME[file.mimetype] || 'jpg';
      const key = `products/uploads/${randomUUID()}.${ext}`;
      return uploadImage(key, file.buffer, file.mimetype);
    })
  );

  res.status(201).json({ urls });
});

module.exports = { uploadProductImages };
