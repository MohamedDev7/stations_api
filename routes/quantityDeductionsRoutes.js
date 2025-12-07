const express = require("express");
const quantityDeductionsController = require("./../controllers/quantityDeductionsController");

const router = express.Router();
router
	.route("")
	.post(quantityDeductionsController.addQuantityDeductions)
	.get(quantityDeductionsController.getAllQuantityDeductions);
router
	.route("/:id")
	.delete(quantityDeductionsController.deleteQuantityDeductions);
module.exports = router;
