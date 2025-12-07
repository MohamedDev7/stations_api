const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");
const { Sequelize } = require("sequelize");
exports.getAllReceives = catchAsync(async (req, res, next) => {
	try {
		const ReceivesModel = getModel(req.headers["x-year"], "receive");
		const StationModel = getModel(req.headers["x-year"], "station");
		const EmployeesModel = getModel(req.headers["x-year"], "employee");
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
		const ReceivesModel = getModel(req.headers["x-year"], "receive");
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
		const ReceivesModel = getModel(req.headers["x-year"], "receive");
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
		const ReceivesModel = getModel(req.headers["x-year"], "receive");
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
		const ReceivesModel = getModel(req.headers["x-year"], "receive");
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
