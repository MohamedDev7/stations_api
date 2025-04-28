const express = require("express");
const calibrationsController = require("./../controllers/calibrationsController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(calibrationsController.addCalibration)
	.get(calibrationsController.getAllCalibrations);
router
	.route("/movment/:movment_id/:shift_id")
	.get(calibrationsController.getCalibrationsByMovmentIdAndShiftId);
router.route("/:id").delete(calibrationsController.deleteCalibrationReport);

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
