const express = require("express");
const receivesController = require("./../controllers/receivesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(receivesController.addReceive)
	.get(receivesController.getAllReceives);

// router.route("/station/:id").get(
// 	// authController.restrictTo("editEmployee"),
// 	employeesController.getEmployeesByStationId
// );

router
	.route("/:id")
	.patch(receivesController.updateReceive)
	.get(receivesController.getReceive)
	.delete(receivesController.deleteReceive);
module.exports = router;
