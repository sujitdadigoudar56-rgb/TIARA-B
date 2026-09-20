const asyncHandler = require("../../common/asyncHandler");
const SiteContent = require("./site-content.model");

const get = asyncHandler(async (req, res) => {
  const content = (await SiteContent.findById("site")) || { hero: {}, collections: [], banners: [], lookbook: [] };
  res.json(content);
});

module.exports = { get };
