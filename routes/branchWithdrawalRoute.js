const express = require("express");
const branchWithdrawalsController = require("./../controllers/branchWithdrawalsController");
// const authController = require("../controllers/authController");
const router = express.Router();

router
	.route("/store/:stationId/:storeId")
	.get(
		branchWithdrawalsController.getunPaidBranchWithdrawalsByStationIdAndStoreId
	);
module.exports = router;
