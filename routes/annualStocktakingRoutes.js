const express = require("express");
const annualStocktakingController = require("./../controllers/annualStocktakingController");

const router = express.Router();
router
	.route("")
	.get(annualStocktakingController.getAllAnnualStocktaking)
	.post(annualStocktakingController.addAnnualStocktaking);
router
	.route("/:id")
	.patch(annualStocktakingController.updateAnnualStocktaking)
	.delete(annualStocktakingController.deleteAnnualStocktaking);

module.exports = router;
