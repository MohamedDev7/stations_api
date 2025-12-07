const express = require("express");
const surplusesController = require("./../controllers/surplusesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(surplusesController.addSurplus)
	.get(surplusesController.getAllSurpluses);
router
	.route("/movment/:movment_id/:shift_id")
	.get(surplusesController.getSurplusesByMovmentIdAndShiftId);
router
	.route("/movment/date/:movment_id/:date")
	.get(surplusesController.getSurplusesByMovmentIdAndDate);

router.route("/:id").delete(surplusesController.deleteSurplus);
router.route("/spicial").patch(surplusesController.spicialAddSurplus);
// .patch(
// 	// authController.restrictTo("editTreasury"),
// 	substancesController.updateSubstance
// )
// .get(
// 	// authController.restrictTo("editSubstance"),
// 	substancesController.getSubstance
// )

module.exports = router;
