const express = require("express");

const authController = require("./../controllers/authController");
const router = express.Router();

router.route("/login").post(authController.login);
router.route("/signup");
// .post(
// 	authController.protect,
// 	authController.restrictTo("super_admin"),
// 	authController.register
// );

module.exports = router;
