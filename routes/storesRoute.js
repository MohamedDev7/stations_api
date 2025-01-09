const express = require("express");
const storesController = require("./../controllers/storesController");
// const authController = require("../controllers/authController");
const router = express.Router();
// router
// 	.route("")
// 	.post(storesController.addstore)
// 	.get(storesController.getAllstores);

router.route("/station/:id").get(
	// authController.restrictTo("editstore"),
	storesController.getStoreByStationId
);
router.route("/movments/shifts/:id/:shiftNumber").get(
	// authController.restrictTo("editstore"),
	storesController.getStoresMovmentByMovmentIdAndShiftNumber
);
module.exports = router;
