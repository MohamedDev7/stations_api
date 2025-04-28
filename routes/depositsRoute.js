const express = require("express");
const depositsController = require("./../controllers/depositsController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(depositsController.addDeposits)
	.get(depositsController.getAllDeposits);

// router.route("/station/:id").get(
// 	// authController.restrictTo("editEmployee"),
// 	employeesController.getEmployeesByStationId
// );

router
	.route("/:id")
	.patch(depositsController.updateDeposit)
	.get(depositsController.getDeposit)
	.delete(depositsController.deleteDeposit);
module.exports = router;
