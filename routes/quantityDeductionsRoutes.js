const express = require("express");
const quantityDeductionsController = require("./../controllers/quantityDeductionsController");

const router = express.Router();
router
	.route("")
	.post(quantityDeductionsController.addQuantityDeductions)
	.get(quantityDeductionsController.getAllQuantityDeductions);
router
	.route("/:id")
	.get(quantityDeductionsController.getQuantityDeductionById)
	.patch(quantityDeductionsController.editQuantityDeductions)
	.delete(quantityDeductionsController.deleteQuantityDeductions);
router
	.route("/:id/state")
	.patch(quantityDeductionsController.changeQuantityDeductionState);
module.exports = router;
