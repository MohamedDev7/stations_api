const express = require("express");
const tanksController = require("./../controllers/tanksController");
// const authController = require("../controllers/authController");
const router = express.Router();
// router
// 	.route("")
// 	.post(tanksController.addtank)
// 	.get(tanksController.getAlltanks);

router.route("/:id").patch(
	// authController.restrictTo("editTreasury"),
	tanksController.updateTank
);
router.route("/station/:id").get(
	// authController.restrictTo("edittank"),
	tanksController.getTanksByStationId
);

// .delete(
// 	// authController.restrictTo("deletetank"),
// 	tanksController.deletetank
// );
module.exports = router;
