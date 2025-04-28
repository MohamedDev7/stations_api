const express = require("express");

const usersController = require("./../controllers/usersController");
const authController = require("../controllers/authController");
const router = express.Router();

router
	.route("")
	.get(usersController.getAllUsers)
	.post(authController.restrictTo("addUser"), usersController.addUser);

router
	.route("/:id")
	.get(authController.restrictTo("editUser"), usersController.getUser)
	.patch(authController.restrictTo("editUser"), usersController.updateUser)
	.delete(authController.restrictTo("deleteUser"), usersController.deleteUser);
router.route("/username/:id").get(usersController.getUsername);
router.route("/password").post(usersController.changePassword);
router.route("/passwordByAdmin/:id").get(usersController.changePasswordByAdmin);

module.exports = router;
