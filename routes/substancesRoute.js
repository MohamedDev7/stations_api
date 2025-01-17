const express = require("express");
const substancesController = require("./../controllers/substancesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(substancesController.addSubstance)
	.get(substancesController.getAllSubstances);
router.route("/date/:date").get(substancesController.getSubstancesPricesByDate);

router
	.route("/:id")
	.patch(
		// authController.restrictTo("editTreasury"),
		substancesController.updateSubstance
	)
	.get(
		// authController.restrictTo("editSubstance"),
		substancesController.getSubstance
	)
	.delete(
		// authController.restrictTo("deleteSubstance"),
		substancesController.deleteSubstance
	)
	.post(substancesController.updateSubstancePrice);
module.exports = router;
