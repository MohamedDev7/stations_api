const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const StationModel = require("../models/stationModel");
const ReceivesModel = require("../models/receiveModel");
const EmployeesModel = require("../models/employeeModel");
const { Sequelize } = require("sequelize");
exports.getAllReceives = catchAsync(async (req, res, next) => {
	try {
		const receives = await ReceivesModel.findAll({
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
					model: EmployeesModel,
					attributes: ["name"],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await ReceivesModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
		});
		res.status(200).json({
			state: "success",
			receives,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getReceive = catchAsync(async (req, res, next) => {
	try {
		const receive = await ReceivesModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			receive,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.addReceive = catchAsync(async (req, res, next) => {
	try {
		await ReceivesModel.create({
			date: req.body.date,
			station_id: req.body.station,
			amount: +req.body.amount,
			user_id: req.user.id,
			employee_id: req.body.employee,
			title: req.body.title,
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteReceive = catchAsync(async (req, res, next) => {
	try {
		await ReceivesModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.updateReceive = catchAsync(async (req, res, next) => {
	try {
		await ReceivesModel.update(
			{
				date: req.body.date,
				station_id: req.body.station,
				amount: +req.body.amount,
				user_id: req.user.id,
				title: req.body.title,
				employee_id: req.body.employee,
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
