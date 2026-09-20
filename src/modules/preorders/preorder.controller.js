const asyncHandler = require('../../common/asyncHandler');
const ApiError = require('../../common/ApiError');
const Preorder = require('./preorder.model');

const create = asyncHandler(async (req, res) => {
  const { fullName, email, countryCode, phone, age, gender } = req.body;
  if (!fullName || !email || !phone) throw new ApiError(400, 'fullName, email and phone are required');
  const preorder = await Preorder.create({ fullName, email, countryCode, phone, age, gender });
  res.status(201).json({ ok: true, id: preorder._id });
});

module.exports = { create };
