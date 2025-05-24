const express = require("express");
const creditSalesController = require("./../controllers/creditSalesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router.route("").get(creditSalesController.getAllCreditSales);
router
	.route("/settlements")
	.get(creditSalesController.getAllCreditSalesSettlements);

// router.route("/station/:id").get(
// 	// authController.restrictTo("editEmployee"),
// 	employeesController.getEmployeesByStationId
// );

// router
// 	.route("/:id")
// 	.patch(creditSalesController.updateReceive)
// 	.get(creditSalesController.getReceive)
// 	.delete(creditSalesController.deleteReceive);
module.exports = router;
