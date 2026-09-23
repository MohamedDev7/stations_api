const express = require("express");

const authController = require("./../controllers/authController");
const router = express.Router();

router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);

// SESSION ROUTES COMMENTED OUT - Using JWT tokens instead
// router.route("/check-session").get(authController.checkSession);
// router.route("/debug-session").get(authController.debugSession);
// router
// 	.route("/sessions/:sessionId")
// 	.delete(authController.protect, authController.deleteSession);
// router
// 	.route("/sessions/user/:userId")
// 	.delete(
// 		authController.protect,
// 		authController.restrictTo("admin"),
// 		authController.deleteAllUserSessions
// 	);

router.route("/signup");
// .post(
// 	authController.protect,
// 	authController.restrictTo("super_admin"),
// 	authController.register
// );

module.exports = router;
