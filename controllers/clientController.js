const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("../connection");
const { Sequelize, Op } = require("sequelize");
const { getModel } = require("../utils/modelSelect");

exports.getAllClients = catchAsync(async (req, res, next) => {
	try {
		const ClientModel = getModel(req.year, "client");
		const ClientStationsModel = getModel(req.year, "client_station");
		const clients = await ClientModel.findAll({
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit || 1000000,
			offset: +req.query.limit * +req.query.page || 0,
		});

		// Get all client stations
		const clientIds = clients.map((c) => c.id);
		const clientStations = await ClientStationsModel.findAll({
			where: {
				client_id: clientIds,
			},
			raw: true,
		});

		// Map clients with their stations
		const clientsWithStations = clients.map((client) => {
			const stations = clientStations
				.filter((cs) => cs.client_id === client.id)
				.map((cs) => cs.station_id);
			return {
				...client.toJSON(),
				stations,
			};
		});

		const total = await ClientModel.count();
		res.status(200).json({
			state: "success",
			clients: clientsWithStations,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addClient = catchAsync(async (req, res, next) => {
	try {
		const ClientModel = getModel(req.year, "client");
		const ClientStationsModel = getModel(req.year, "client_station");
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
		const ClientModel = getModel(req.year, "client");
		const ClientStationsModel = getModel(req.year, "client_station");
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
		const ClientModel = getModel(req.year, "client");
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
