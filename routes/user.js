const express = require("express");
const router = express.Router();

const isAuth = require("../utils/isAuth");
const userController = require("../controllers/user");

router.get("/", userController.getAll);
router.get("/profile", isAuth, userController.getProfile);

module.exports = router;
