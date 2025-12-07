const express = require("express");
const storesController = require("./../controllers/storesController");
// const authController = require("../controllers/authController");
const router = express.Router();
router
	.route("")
	.post(storesController.addStore)
	.get(storesController.getAllstores);

router.route("/station/:id").get(storesController.getStoreByStationId);
router
	.route("/station/client/:station_id/:client_id")
	.get(storesController.getStoreByStationIdAndClientId);
router.route("/movments/shifts/:id/:shift_id").get(
	// authController.restrictTo("editstore"),
	storesController.getStoresMovmentByMovmentIdAndShiftId
);
module.exports = router;
