const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sequelize = require("./../connection");
const StationModel = require("../models/stationModel");
const MovmentModel = require("../models/movmentModel");
const StoreModel = require("../models/storeModel");
const SubstanceModel = require("../models/substanceModel");
const SurplusModel = require("../models/surplusModel");
const { Sequelize } = require("sequelize");

exports.getAllSurpluses = catchAsync(async (req, res, next) => {
	try {
		const surpluses = await SurplusModel.findAll({
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
			],
			order: [["createdAt", "DESC"]],
			limit: +req.query.limit,
			offset: +req.query.limit * +req.query.page,
		});
		const total = await SurplusModel.count({
			where: {
				station_id: {
					[Sequelize.Op.in]: req.stations,
				},
			},
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
exports.addSurplus = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
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
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteSurplus = catchAsync(async (req, res, next) => {
	try {
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
