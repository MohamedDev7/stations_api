const express = require("express");
const financialOperationsController = require("./../controllers/financialOperationsController");
const router = express.Router();

router
	.route("")
	.post(financialOperationsController.addFinancialOperation)
	.get(financialOperationsController.getAllFinancialOperations);

router
	.route("/:id")
	.get(financialOperationsController.getFinancialOperation)
	.patch(financialOperationsController.updateFinancialOperation)
	.delete(financialOperationsController.deleteFinancialOperation);

module.exports = router;
