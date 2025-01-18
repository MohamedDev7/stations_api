const sequelize = require("../connection");
const StocktakingStoresMovmentsModel = require("../models/stocktakingStoresMovmentsModel");
const StocktakingModel = require("../models/stocktakingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const MovmentModel = require("../models/movmentModel");
const StoreModel = require("../models/storeModel");
const SubstanceModel = require("../models/substanceModel");
exports.addStocktaking = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const movment = await MovmentModel.findOne({
				where: {
					station_id: req.body.station,
					date: req.body.date,
				},
				transaction: t,
			});
			console.log(`req.body.date`, req.body.date);
			const stocktaking = StocktakingModel.create({
				movment_id: movment.id,
				station_id: +req.body.station,
				date: req.body.date,
			});
			const storesArr = req.body.stores.map((el) => {
				return {
					prev_value: el.prev_value,
					curr_value: el.curr_value,
					store_id: el.store.id,
					movment_id: movment.id,
					station_id: +req.body.station,
					price: el.store.substance.price,
					stocktaking_id: stocktaking.id,
				};
			});
			await StocktakingStoresMovmentsModel.bulkCreate(storesArr, {
				transaction: t,
			});
			console.log(`movment.id`, movment.id);
			await MovmentModel.update(
				{ has_stocktaking: 1 },
				{
					where: {
						id: +movment.id,
					},
					transaction: t,
				}
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		console.log(`error`, error);
		return next(new AppError(error, 500));
	}
});
exports.getStocktakingByMovmentId = catchAsync(async (req, res, next) => {
	console.log(`req.params.id`, req.params.id);
	try {
		await sequelize.transaction(async (t) => {
			const stores = await StocktakingStoresMovmentsModel.findAll({
				where: {
					movment_id: req.params.id,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["id", "type", "name"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
			});
			res.status(200).json({
				state: "success",
				stores,
			});
		});
	} catch (error) {
		console.log(`error`, error);
		return next(new AppError(error, 500));
	}
});
