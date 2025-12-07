const express = require("express");
const dispensersController = require("./../controllers/dispensersController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.get(dispensersController.getAllDispensers)
	.post(dispensersController.addDispenser);
router.route("/station/:id").get(dispensersController.getDispensersByStationId);

router.route("/state/:id").patch(dispensersController.updateDispenserState);

// router.route("/station/:id").get(
// 	// authController.restrictTo("editstore"),
// 	dispensersController.getDispensersByStationId
// );
router.route("/movments/shifts/:id/:shift_id").get(
	// authController.restrictTo("editstore"),
	dispensersController.getDispensersMovmentByMovmentIdAndShiftId
);
router
	.route("/annual/:station_id")
	.get(dispensersController.getAnnualDispensersMovment);
module.exports = router;
