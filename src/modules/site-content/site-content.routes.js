const express = require("express");
const controller = require("./site-content.controller");

const router = express.Router();

router.get("/", controller.get);

module.exports = router;
