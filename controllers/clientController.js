const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("../connection");
const { Sequelize, Op } = require("sequelize");
const { getModel } = require("../utils/modelSelect");

exports.getAllClients = catchAsync(async (req, res, next) => {
	try {
		const ClientModel = getModel(req.headers["x-year"], "client");

		const clients = await ClientModel.findAll({
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await ClientModel.count();
		res.status(200).json({
			state: "success",
			clients,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addClient = catchAsync(async (req, res, next) => {
	try {
		const ClientModel = getModel(req.headers["x-year"], "client");
		const ClientStationsModel = getModel(
			req.headers["x-year"],
			"client_station"
		);
		await req.db.transaction(async (t) => {
			const client = await ClientModel.create(
				{
					name: req.body.name,
				},
				{ transaction: t }
			);
			const stationsArr = req.body.stations.map((el) => {
				return {
					station_id: el.station_id,
					client_id: client.id,
					allow_credit: el.allowCredit,
				};
			});
			await ClientStationsModel.bulkCreate(stationsArr, {
				transaction: t,
			});
		});

		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getClientsByStationId = catchAsync(async (req, res, next) => {
	try {
		const ClientModel = getModel(req.headers["x-year"], "client");
		const ClientStationsModel = getModel(
			req.headers["x-year"],
			"client_station"
		);
		let clients = [];
		clients = await ClientStationsModel.findAll({
			where: { station_id: req.params.stationId },
			include: [
				{
					model: ClientModel,
				},
			],
		});
		res.status(200).json({
			state: "success",
			clients,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.deleteClient = catchAsync(async (req, res, next) => {
	try {
		const ClientModel = getModel(req.headers["x-year"], "client");
		await ClientModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
