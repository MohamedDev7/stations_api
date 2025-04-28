const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const DepositModel = require("../models/depositModel");
const StationModel = require("../models/stationModel");
const BankModel = require("../models/bankModel");
const { Sequelize } = require("sequelize");

exports.getAllDeposits = catchAsync(async (req, res, next) => {
	try {
		const deposits = await DepositModel.findAll({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
			include: [
				{ model: StationModel, attributes: ["name"] },
				{ model: BankModel, attributes: ["name"] },
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await DepositModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		res.status(200).json({
			state: "success",
			deposits,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getDeposit = catchAsync(async (req, res, next) => {
	try {
		const deposit = await DepositModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			deposit,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addDeposits = catchAsync(async (req, res, next) => {
	try {
		await DepositModel.create({
			station_id: req.body.station,
			amount: req.body.amount,
			bank_id: req.body.bank,
			invoice_date: req.body.invoiceDate,
			number: req.body.number,
			statement: req.body.statement,
			user_id: req.user.id,
			date: req.body.date,
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteDeposit = catchAsync(async (req, res, next) => {
	try {
		await DepositModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateDeposit = catchAsync(async (req, res, next) => {
	try {
		await DepositModel.update(
			{
				station_id: req.body.station,
				amount: req.body.amount,
				bank_id: req.body.bank,
				invoice_date: req.body.invoiceDate,
				number: req.body.number,
				statement: req.body.statement,
				user_id: req.user.id,
				date: req.body.date,
			},
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
