const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

exports.getunPaidBranchWithdrawalsByStationIdAndStoreId = catchAsync(
	async (req, res, next) => {
		try {
			const BranchWithdrawalsModel = getModel(
				req.headers["x-year"],
				"branch_withdrawals"
			);
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const branchWithdrawals = await BranchWithdrawalsModel.findAll({
				where: {
					station_id: req.params.stationId,
					store_id: req.params.storeId,
					isSettled: false,
				},
				include: [
					{
						model: MovmentModel,
						attributes: ["date"],
					},
				],
			});
			res.status(200).json({
				state: "success",
				branchWithdrawals,
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
