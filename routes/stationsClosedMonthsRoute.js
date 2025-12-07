const express = require("express");
const stationsClosedMonthsController = require("./../controllers/stationsClosedMonthsController");
const router = express.Router();
router
	.route("/:month")
	.patch(stationsClosedMonthsController.changeState)
	.get(stationsClosedMonthsController.getStateByMonth);
router.route("/").patch(stationsClosedMonthsController.changeState);

// router
// 	.route("/:id")
// 	.patch(banksController.updateBank)
// 	.delete(banksController.deleteBank);
module.exports = router;
