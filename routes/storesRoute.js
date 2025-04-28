const express = require("express");
const storesController = require("./../controllers/storesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	// .post(storesController.addstore)
	.get(storesController.getAllstores);

router.route("/station/:id").get(
	// authController.restrictTo("editstore"),
	storesController.getStoreByStationId
);
router.route("/movments/shifts/:id/:shift_id").get(
	// authController.restrictTo("editstore"),
	storesController.getStoresMovmentByMovmentIdAndShiftId
);
module.exports = router;
