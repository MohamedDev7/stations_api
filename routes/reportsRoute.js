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
// router
// 	.route("/accountStatement/branch")
// 	.get(reportsController.getBranchStatementReport);
router
	.route("/accountStatement/creditSales")
	.get(reportsController.getCreditSalesStatementReport);
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
	.route("/creditSales")
	.get(reportsController.getCreditSalesByStoreIdAndClientsIds);
router
	.route("/depositsMovment")
	.get(reportsController.getDepositsMovmentInPeriod);
router.route("/calibration/:id").get(reportsController.getCalibrationReport);
router.route("/overview").get(reportsController.getOverview);
router
	.route("/StocktakingPrice/:id")
	.get(reportsController.getStocktakingPriceReport);

router
	.route("/annualIncomes/:station_id")
	.get(reportsController.getAnnualIncomes);
router
	.route("/annualStoresMovment/:station_id")
	.get(reportsController.getAnnualStoresMovment);
router
	.route("/annualStocktaking/:id")
	.get(reportsController.getAnnualStocktakingReport);
module.exports = router;
