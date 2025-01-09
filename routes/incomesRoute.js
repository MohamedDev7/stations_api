const express = require("express");
const incomesController = require("./../controllers/incomesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router.route("").post(incomesController.addIncome);
// .get(substancesController.getAllSubstances);

// router
// 	.route("/:id")
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
