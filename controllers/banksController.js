const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");

exports.getAllBanks = catchAsync(async (req, res, next) => {
	const BanksModel = getModel(req.headers["x-year"], "bank");
	try {
		const banks = await BanksModel.findAll({});
		res.status(200).json({
			state: "success",
			banks,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addBank = catchAsync(async (req, res, next) => {
	const BanksModel = getModel(req.headers["x-year"], "bank");
	try {
		await BanksModel.create({
			name: req.body.name,
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteBank = catchAsync(async (req, res, next) => {
	const BanksModel = getModel(req.headers["x-year"], "bank");
	try {
		await BanksModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateBank = catchAsync(async (req, res, next) => {
	const BanksModel = getModel(req.headers["x-year"], "bank");
	try {
		await BanksModel.update(
			{ name: req.body.name },
			{
				where: { id: req.params.id },
			}
		);
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
