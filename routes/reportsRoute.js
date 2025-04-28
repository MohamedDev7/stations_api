const express = require("express");
const reportsController = require("./../controllers/reportsController ");
const authController = require("../controllers/authController");
const router = express.Router();
router.route("/storesMovment").get(reportsController.getStoresMovmentInPeriod);
router
	.route("/storesMovmentSummary")
	.get(reportsController.getStoresMovmentSummaryInPeriod);
router
	.route("/accountStatement/employee")
	.get(reportsController.getEmployeeAccountStatementReport);
router
	.route("/accountStatement/box")
	.get(reportsController.getBoxAccountStatementReport);
router
	.route("/accountStatement/station")
	.get(reportsController.getStationAccountStatementReport);
router
	.route("/DispensersMovment")
	.get(reportsController.getDispensersMovmentInPeriod);
router
	.route("/incomesMovment")
	.get(reportsController.getIncomesMovmentInPeriod);
router
	.route("/depositsMovment")
	.get(reportsController.getDepositsMovmentInPeriod);
router.route("/calibration/:id").get(reportsController.getCalibrationReport);
router.route("/overview").get(reportsController.getOverview);
router
	.route("/StocktakingPrice/:id")
	.get(reportsController.getStocktakingPriceReport);

module.exports = router;
