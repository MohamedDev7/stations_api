const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const StationModel = require("../models/stationModel");
const EmployeesModel = require("../models/employeeModel");
const { Sequelize } = require("sequelize");
const CreditSaleModel = require("../models/creditSaleModel");
const MovmentModel = require("../models/movmentModel");
const CreditSaleSettlementModel = require("../models/creditSaleSettlementModel");
exports.getAllCreditSales = catchAsync(async (req, res, next) => {
	try {
		const creditSales = await CreditSaleModel.findAll({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
			include: [
				{
					model: StationModel,
					attributes: ["name"],
				},
				{
					model: MovmentModel,
					attributes: ["date"],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await CreditSaleModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		console.log(creditSales);
		res.status(200).json({
			state: "success",
			creditSales,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getAllCreditSalesSettlements = catchAsync(async (req, res, next) => {
	try {
		const creditSalesSettlements = await CreditSaleSettlementModel.findAll({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
			include: [
				{
					model: StationModel,
					attributes: ["name"],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await CreditSaleSettlementModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		console.log(creditSales);
		res.status(200).json({
			state: "success",
			creditSalesSettlements,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
// exports.getReceive = catchAsync(async (req, res, next) => {
// 	try {
// 		const receive = await ReceivesModel.findByPk(req.params.id);
// 		res.status(200).json({
// 			state: "success",
// 			receive,
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });

// exports.addReceive = catchAsync(async (req, res, next) => {
// 	try {
// 		await ReceivesModel.create({
// 			date: req.body.date,
// 			station_id: req.body.station,
// 			amount: +req.body.amount,
// 			user_id: req.user.id,
// 			employee_id: req.body.employee,
// 			title: req.body.title,
// 		});
// 		res.status(200).json({
// 			state: "success",
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
// exports.deleteReceive = catchAsync(async (req, res, next) => {
// 	try {
// 		await ReceivesModel.destroy({
// 			where: { id: req.params.id },
// 		});
// 		res.status(200).json({
// 			state: "success",
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });

// exports.updateReceive = catchAsync(async (req, res, next) => {
// 	try {
// 		await ReceivesModel.update(
// 			{
// 				date: req.body.date,
// 				station_id: req.body.station,
// 				amount: +req.body.amount,
// 				user_id: req.user.id,
// 				title: req.body.title,
// 				employee_id: req.body.employee,
// 			},
// 			{
// 				where: { id: req.params.id },
// 			}
// 		);
// 		res.status(200).json({
// 			state: "success",
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
