const express = require("express");
const dispensersController = require("./../controllers/dispensersController");
// const authController = require("../controllers/authController");
const router = express.Router();
// router
// 	.route("")
// 	.post(storesController.addstore)
// 	.get(storesController.getAllstores);

// router.route("/station/:id").get(
// 	// authController.restrictTo("editstore"),
// 	dispensersController.getDispensersByStationId
// );
router.route("/movments/shifts/:id/:shiftNumber").get(
	// authController.restrictTo("editstore"),
	dispensersController.getDispensersMovmentByMovmentIdAndShiftNumber
);
module.exports = router;
