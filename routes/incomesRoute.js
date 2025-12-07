const express = require("express");
const incomesController = require("./../controllers/incomesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(incomesController.addIncome)
	.get(incomesController.getAllIncomes);
router
	.route("/movment/:movment_id/:shift_id")
	.get(incomesController.getIncomesByMovmentIdAndShiftId);

router.route("/:id").delete(incomesController.deleteIncome);
router.route("/spicial").patch(incomesController.spicialAddIncome);
// 	.patch(
// 		// authController.restrictTo("editTreasury"),
// 		substancesController.updateSubstance
// 	)
// 	.get(
// 		// authController.restrictTo("editSubstance"),
// 		substancesController.getSubstance
// 	)
// 	.delete(
// 		// authController.restrictTo("deleteSubstance"),
// 		substancesController.deleteSubstance
// 	);
module.exports = router;
