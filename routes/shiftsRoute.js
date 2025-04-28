const express = require("express");
const shiftsController = require("./../controllers/shiftsController");
// const authController = require("../controllers/authController");
const router = express.Router();
// router
// 	.route("")
// 	.post(tanksController.addtank)
// 	.get(tanksController.getAlltanks);
router.route("/station/:id").get(shiftsController.getShiftsByStationId);
router.route("/movment/:id").get(shiftsController.getMovmentsShiftsByMovmentId);
router
	.route("/movment/shift/:id/:shift")
	.get(shiftsController.getShiftDataByMovmentIdAndShiftId)
	.delete(shiftsController.deleteShiftBYMovmentIdAndShiftId);
router
	.route("/last/movment/:id")
	.get(shiftsController.getLastShiftIdByMovmentId);
module.exports = router;
