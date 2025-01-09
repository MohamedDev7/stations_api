const express = require("express");
const employeesController = require("./../controllers/employeesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(employeesController.addEmployee)
	.get(employeesController.getAllEmployees);

router.route("/station/:id").get(
	// authController.restrictTo("editEmployee"),
	employeesController.getEmployeesByStationId
);

router
	.route("/:id")
	.patch(
		// authController.restrictTo("editTreasury"),
		employeesController.updateEmployee
	)
	.get(
		// authController.restrictTo("editEmployee"),
		employeesController.getEmployee
	)
	.delete(
		// authController.restrictTo("deleteEmployee"),
		employeesController.deleteEmployee
	);
module.exports = router;
