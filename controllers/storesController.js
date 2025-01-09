const catchAsync = require("../utils/catchAsync");
const StoreMovmentModel = require("./../models/storeMovmentModel");
const StoreModel = require("./../models/storeModel");
const { Op } = require("sequelize");
const sequelize = require("./../connection");
const AppError = require("../utils/appError");
const SubstanceModel = require("../models/substanceModel");
exports.getStoreByStationId = catchAsync(async (req, res, next) => {
	try {
		const stores = await StoreModel.findAll({
			where: {
				station_id: req.params.id,
			},
			include: [
				{
					model: SubstanceModel,
					attributes: ["id", "name", "price"], // Specify the attributes you want to include
				},
			],
		});
		res.status(200).json({
			state: "success",
			stores,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStoresMovmentByMovmentIdAndShiftNumber = catchAsync(
	async (req, res, next) => {
		try {
			await sequelize.transaction(async (t) => {
				const storesMovments = await StoreMovmentModel.findAll({
					where: {
						movment_id: +req.params.id,
						shift_number: +req.params.shiftNumber,
					},
					attributes: ["id", "prev_value", "curr_value", "movment_id"],
					include: [
						{
							model: StoreModel,
							attributes: ["id", "type", "name"],
							include: [
								{
									model: SubstanceModel,
									attributes: ["id", "name", "price"],
								},
							],
						},
					],
				});
				res.status(200).json({
					state: "success",
					storesMovments,
				});
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
