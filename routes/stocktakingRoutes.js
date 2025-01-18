const express = require("express");
const stocktakingController = require("./../controllers/stocktakingController");

const router = express.Router();
router.route("").post(stocktakingController.addStocktaking);
router
	.route("/movment/:id")
	.get(stocktakingController.getStocktakingByMovmentId);

module.exports = router;
