const express = require("express");
const shiftsController = require("./../controllers/shiftsController");
// const authController = require("../controllers/authController");
const router = express.Router();
// router
// 	.route("")
// 	.post(tanksController.addtank)
// 	.get(tanksController.getAlltanks);
router.route("/station/:id").get(
	// authController.restrictTo("edittank"),
	shiftsController.getShiftsByStationId
);
router.route("/movment/:id").get(
	// authController.restrictTo("edittank"),
	shiftsController.getShiftsByMovmentId
);
router.route("/movment/shift/:id/:shift").get(
	// authController.restrictTo("edittank"),
	shiftsController.getShiftDataByMovmentIdAndShiftNumber
);

// .delete(
// 	// authController.restrictTo("deletetank"),
// 	tanksController.deletetank
// );
module.exports = router;
