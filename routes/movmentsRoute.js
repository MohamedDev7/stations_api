const express = require("express");
const movmentsController = require("./../controllers/movmentsController ");
// const authController = require("../controllers/authController");
const router = express.Router();
router.route("").post(movmentsController.addMovment);
router
	.route("/shift")
	.post(movmentsController.addShiftMovment)
	.patch(movmentsController.editShiftMovment);

router.route("").get(movmentsController.getAllMovments);
router.route("/report/:id").get(movmentsController.getMovmentReport);
router.route("/state/:id").post(movmentsController.changeMovmentState);
router
	.route("/:id")
	.get(
		// authController.restrictTo("editstore"),
		movmentsController.getMovmentsByStationId
	)
	.delete(movmentsController.deleteMovment);
router.route("/station/date/:id/:date").get(
	// authController.restrictTo("editstore"),
	movmentsController.getStationMovmentByDate
);
router.route("/:station_id/:movment_number").get(
	// authController.restrictTo("editstore"),
	movmentsController.getStationMovment
);
router.route("/pending/station/:id").get(
	// authController.restrictTo("editstore"),
	movmentsController.getStationPendingMovment
);
module.exports = router;
