const asyncHandler = require('../../common/asyncHandler');
const ApiError = require('../../common/ApiError');
const Contact = require('./contact.model');

const create = asyncHandler(async (req, res) => {
  const { name, email, phone, comment } = req.body;
  if (!email || !comment) throw new ApiError(400, 'email and comment are required');
  const contact = await Contact.create({ name, email, phone, comment });
  res.status(201).json({ ok: true, id: contact._id });
});

module.exports = { create };
