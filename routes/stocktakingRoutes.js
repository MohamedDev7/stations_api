const express = require("express");
const stocktakingController = require("./../controllers/stocktakingController");

const router = express.Router();
router
	.route("")
	.post(stocktakingController.addStocktaking)
	.get(stocktakingController.getAllStocktakings);
router
	.route("/:id")
	.delete(stocktakingController.deleteStocktaking)
	.get(stocktakingController.getStocktakingById);
router
	.route("/movment/:id")
	.get(stocktakingController.getStocktakingByMovmentId);

module.exports = router;
