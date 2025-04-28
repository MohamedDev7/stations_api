const express = require("express");
const stationsController = require("./../controllers/stationsController");
const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(stationsController.addStation)
	.get(stationsController.getAllStations);

router
	.route("/:id")
	.patch(
		// authController.restrictTo("editTreasury"),

		stationsController.updateStation
	)
	.get(
		// authController.restrictTo("editSubstance"),
		stationsController.getStation
	)
	.delete(
		// authController.restrictTo("deleteSubstance"),
		stationsController.deleteStation
	);
module.exports = router;
