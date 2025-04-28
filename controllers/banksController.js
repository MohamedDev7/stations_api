const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const BanksModel = require("../models/bankModel");

exports.getAllBanks = catchAsync(async (req, res, next) => {
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
// exports.getEmployee = catchAsync(async (req, res, next) => {
// 	try {
// 		const employee = await EmployeeModel.findByPk(req.params.id);
// 		res.status(200).json({
// 			state: "success",
// 			employee,
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
// exports.getEmployeesByStationId = catchAsync(async (req, res, next) => {
// 	try {
// 		const employees = await EmployeeModel.findAll({
// 			where: {
// 				station_id: req.params.id,
// 			},
// 		});
// 		res.status(200).json({
// 			state: "success",
// 			employees,
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
exports.addBank = catchAsync(async (req, res, next) => {
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
