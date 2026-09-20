const mongoose = require("mongoose");

// Singleton document (fixed _id) holding the image content the frontend used to hardcode:
// the home hero, collection tiles, promo banners, and the look book gallery.
const siteContentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "site" },
    hero: {
      image: { type: String, default: "" },
    },
    collections: [
      {
        _id: false,
        category: String,
        title: String,
        subtitle: String,
        image: String,
      },
    ],
    banners: [
      {
        _id: false,
        label: String,
        href: String,
        image: String,
      },
    ],
    lookbook: [
      {
        _id: false,
        image: String,
        ratio: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
