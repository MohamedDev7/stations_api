const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("./../connection");
const { getModel } = require("../utils/modelSelect");
const { Sequelize, Op } = require("sequelize");

exports.getAllSurpluses = catchAsync(async (req, res, next) => {
	try {
		const StationModel = getModel(req.headers["x-year"], "station");
		const MovmentModel = getModel(req.headers["x-year"], "movment");
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const SurplusModel = getModel(req.headers["x-year"], "surplus");
		const StocktakingModel = getModel(req.headers["x-year"], "stocktaking");
		const stations = req.query.stations
			? req.query.stations.split(",").filter((s) => s.length > 0)
			: [];
		const whereConditions = {
			station_id: {
				[Sequelize.Op.in]: stations.length > 0 ? stations : req.stations,
			},
		};
		const movmentWhereConditions = {};
		if (
			req.query.startDate &&
			req.query.startDate !== "null" &&
			req.query.endDate &&
			req.query.endDate !== "null"
		) {
			movmentWhereConditions.date = {
				[Sequelize.Op.between]: [req.query.startDate, req.query.endDate],
			};
		} else if (req.query.startDate && req.query.startDate !== "null") {
			movmentWhereConditions.date = {
				[Sequelize.Op.gte]: req.query.startDate,
			};
		} else if (req.query.endDate && req.query.endDate !== "null") {
			movmentWhereConditions.date = {
				[Sequelize.Op.lte]: req.query.endDate,
			};
		}
		const surpluses = await SurplusModel.findAll({
			where: whereConditions,
			include: [
				{
					model: StationModel,
					attributes: ["name"],
				},
				{
					model: MovmentModel,
					attributes: ["date"],
					where: movmentWhereConditions,
				},
				{
					model: StoreModel,
					attributes: ["id", "name"],
					include: [
						{
							model: SubstanceModel,
							attributes: ["name"],
						},
					],
				},
				{
					model: StocktakingModel,
					attributes: ["date"],
				},
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await SurplusModel.count({
			where: whereConditions,
			include: [
				{
					model: MovmentModel,
					where: movmentWhereConditions,
				},
			],
		});
		res.status(200).json({
			state: "success",
			surpluses,
			total,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getSurplusesByMovmentIdAndShiftId = catchAsync(
	async (req, res, next) => {
		try {
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const surpluses = await SurplusModel.findAll({
				where: {
					movment_id: req.params.movment_id,
					shift_id: req.params.shift_id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id"],
							},
						],
					},
				],
				order: [["createdAt", "DESC"]],
			});
			res.status(200).json({
				state: "success",
				surpluses,
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.getSurplusesByMovmentIdAndDate = catchAsync(async (req, res, next) => {
	try {
		const SurplusModel = getModel(req.headers["x-year"], "surplus");
		const StoreModel = getModel(req.headers["x-year"], "store");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const surpluses = await SurplusModel.findAll({
			where: {
				movment_id: req.params.movment_id,
				date: req.params.date,
			},
			include: [
				{
					model: StoreModel,
					attributes: ["id"],
					include: [
						{
							model: SubstanceModel,
							attributes: ["id"],
						},
					],
				},
			],
			order: [["createdAt", "DESC"]],
		});
		res.status(200).json({
			state: "success",
			surpluses,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.addSurplus = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			// check if there is momvnets or shifts after
			const currMovment = await MovmentModel.findByPk(req.body.movmentId, {
				raw: true,
			});
			const nextMovments = await MovmentModel.findAll({
				where: {
					station_id: currMovment.station_id,
					date: {
						[Op.gt]: currMovment.date,
					},
				},
			});
			const nextMovmentsIds = nextMovments.map((el) => el.id);
			const nextShifts = await MovmentsShiftsModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					number: {
						[Op.gt]: +req.body.shift.number,
					},
				},
			});

			const nextShiftsIds = nextShifts.map((el) => el.id);
			const nextShiftsStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					store_id: req.body.store.id,
					shift_id: {
						[Op.in]: nextShiftsIds,
					},
				},
				raw: true,
			});
			const nextShiftsStoreMovmentsIds = nextShiftsStoreMovments.map(
				(el) => el.id
			);
			const nextMovmentsStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: { [Op.in]: nextMovmentsIds },
					store_id: req.body.store.id,
				},
				raw: true,
			});
			const nextMovmentsStoreMovmentsIds = nextMovmentsStoreMovments.map(
				(el) => el.id
			);

			const currShiftStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					store_id: req.body.store.id,
					shift_id: +req.body.shift.id,
				},
				raw: true,
			});
			if (currShiftStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: req.db.literal(`curr_value + ${req.body.amount}`),
					},
					{
						where: {
							id: currShiftStoreMovments[0].id,
						},
						transaction: t,
					}
				);
			}
			if (nextShiftsStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: req.db.literal(`curr_value + ${req.body.amount}`),
						prev_value: req.db.literal(`prev_value + ${req.body.amount}`),
					},
					{
						where: {
							id: {
								[Op.in]: nextShiftsStoreMovmentsIds,
							},
						},
						transaction: t,
					}
				);
			}
			if (nextMovmentsStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: req.db.literal(`curr_value + ${req.body.amount}`),
						prev_value: req.db.literal(`prev_value + ${req.body.amount}`),
					},
					{
						where: {
							id: {
								[Op.in]: nextMovmentsStoreMovmentsIds,
							},
						},
						transaction: t,
					}
				);
			}
			await SurplusModel.create(
				{
					station_id: +req.body.station,
					amount: +req.body.amount,
					store_id: req.body.store.id,
					movment_id: req.body.movmentId,
					shift_id: req.body.shift.id,
					state: "pending",
					price: req.body.store.price,
				},
				{ transaction: t }
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.spicialAddSurplus = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const SurplusModel = getModel(req.headers["x-year"], "surplus");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const MovmentsShiftsModel = getModel(
				req.headers["x-year"],
				"movments_shift"
			);
			const StationModel = getModel(req.headers["x-year"], "station");

			// check if there is momvnets or shifts after
			const currMovment = await MovmentModel.findByPk(req.body.movmentId, {
				raw: true,
			});
			const station = await StationModel.findByPk(req.body.station_id, {
				raw: true, // Return raw data (plain object)
			});
			const nextMovments = await MovmentModel.findAll({
				where: {
					station_id: currMovment.station_id,
					date: {
						[Op.between]: [req.body.date, station.start_date],
					},
				},
			});
			const nextMovmentsIds = nextMovments.map((el) => el.id);
			const nextShifts = await MovmentsShiftsModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					number: {
						[Op.gt]: +req.body.shift.number,
					},
				},
			});

			const nextShiftsIds = nextShifts.map((el) => el.id);
			const nextShiftsStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					store_id: req.body.store.id,
					shift_id: {
						[Op.in]: nextShiftsIds,
					},
				},
				raw: true,
			});
			const nextShiftsStoreMovmentsIds = nextShiftsStoreMovments.map(
				(el) => el.id
			);
			const nextMovmentsStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: { [Op.in]: nextMovmentsIds },
					store_id: req.body.store.id,
				},
				raw: true,
			});
			const nextMovmentsStoreMovmentsIds = nextMovmentsStoreMovments.map(
				(el) => el.id
			);

			const currShiftStoreMovments = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.body.movmentId,
					store_id: req.body.store.id,
					shift_id: +req.body.shift.id,
				},
				raw: true,
			});
			if (currShiftStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: req.db.literal(`curr_value + ${req.body.amount}`),
					},
					{
						where: {
							id: currShiftStoreMovments[0].id,
						},
						transaction: t,
					}
				);
			}
			if (nextShiftsStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: req.db.literal(`curr_value + ${req.body.amount}`),
						prev_value: req.db.literal(`prev_value + ${req.body.amount}`),
					},
					{
						where: {
							id: {
								[Op.in]: nextShiftsStoreMovmentsIds,
							},
						},
						transaction: t,
					}
				);
			}
			if (nextMovmentsStoreMovments.length > 0) {
				await StoreMovmentModel.update(
					{
						curr_value: req.db.literal(`curr_value + ${req.body.amount}`),
						prev_value: req.db.literal(`prev_value + ${req.body.amount}`),
					},
					{
						where: {
							id: {
								[Op.in]: nextMovmentsStoreMovmentsIds,
							},
						},
						transaction: t,
					}
				);
			}
			await SurplusModel.create(
				{
					station_id: +req.body.station,
					amount: +req.body.amount,
					store_id: req.body.store.id,
					movment_id: req.body.movmentId,
					shift_id: req.body.shift.id,
					state: "pending",
					price: req.body.store.price,
				},
				{ transaction: t }
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteSurplus = catchAsync(async (req, res, next) => {
	try {
		const SurplusModel = getModel(req.headers["x-year"], "surplus");
		await SurplusModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
