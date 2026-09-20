const asyncHandler = require('../../common/asyncHandler');
const ApiError = require('../../common/ApiError');

// Generic admin CRUD for a Mongoose model: paginated/searchable list, get/create/update/delete.
// Used where a resource has no special logic beyond "manage this collection" — products,
// categories, collections. Orders and users need custom rules, so they don't use this.
function makeCrudController(Model, { searchFields = [], populate = null, label = 'Item' } = {}) {
  const list = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q && searchFields.length) {
      filter.$or = searchFields.map((f) => ({ [f]: { $regex: q, $options: 'i' } }));
    }
    const skip = (Number(page) - 1) * Number(limit);
    let query = Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    if (populate) query = query.populate(populate);
    const [items, total] = await Promise.all([query, Model.countDocuments(filter)]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  });

  const get = asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const item = await query;
    if (!item) throw new ApiError(404, `${label} not found`);
    res.json(item);
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(item);
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw new ApiError(404, `${label} not found`);
    res.json(item);
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, `${label} not found`);
    res.json({ ok: true });
  });

  return { list, get, create, update, remove };
}

module.exports = { makeCrudController };
