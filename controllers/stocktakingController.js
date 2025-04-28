const sequelize = require("./../connection");
const StocktakingStoresMovmentsModel = require("../models/stocktakingStoresMovmentsModel");
const StocktakingModel = require("../models/stocktakingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const MovmentModel = require("../models/movmentModel");
const StoreModel = require("../models/storeModel");
const SubstanceModel = require("../models/substanceModel");
const { Sequelize } = require("sequelize");
const StationModel = require("../models/stationModel");
const SubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
const priceMovmentEntriesModel = require("../models/priceMovmentEntriesModel");
const StocktakingMembersModel = require("../models/stocktakingMembersModel");
const ShiftModel = require("../models/shiftModel");
const SurplusModel = require("../models/surplusModel");
exports.addStocktaking = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const [day, month, year] = req.body.date.trim().split("/");
			const currDate = new Date(`${year}-${month}-${day}`);
			const nextDay = new Date(currDate);
			nextDay.setDate(currDate.getDate() + 1);
			let lastPrice;
			if (req.body.type === "تسعيرة") {
				const lastPriceNumber = await SubstancePriceMovmentModel.max("number", {
					where: {
						start_date: nextDay,
						end_date: "2100-12-31",
						substance_id: req.body.substance,
					},
				});
				lastPrice = await SubstancePriceMovmentModel.findOne({
					where: { substance_id: req.body.substance, number: lastPriceNumber },
					raw: true,
				});
			} else {
				const lastPriceNumber = await SubstancePriceMovmentModel.max("number", {
					where: {
						substance_id: req.body.substance,
					},
				});
				lastPrice = await SubstancePriceMovmentModel.findOne({
					where: { substance_id: req.body.substance, number: lastPriceNumber },
					raw: true,
				});
				lastPrice.prev_price = lastPrice.price;
			}

			const stocktaking = await StocktakingModel.create(
				{
					movment_id: req.body.currMovmentId,
					date: currDate,
					station_id: +req.body.station,
					substance_id: +req.body.substance,
					prev_value: req.body.stocks[0].amount,
					curr_value: req.body.stocks[0].realAmount,
					prev_price: lastPrice.prev_price,
					curr_price: lastPrice.price,
					type: req.body.type,
				},
				{ transaction: t }
			);

			const storesArr = req.body.stores.map((el) => {
				return {
					prev_value: el.prev_value,
					curr_value: el.curr_value,
					store_id: el.store.id,
					movment_id: req.body.currMovmentId,
					station_id: +req.body.station,
					price: lastPrice.prev_price,
					stocktaking_id: stocktaking.id,
				};
			});
			const station = await StationModel.findByPk(+req.body.station);
			const shift = await ShiftModel.findOne({
				where: {
					station_id: +req.body.station,
					number: station.shifts,
				},
			});
			const surplus = req.body.stores
				.filter((el) => el.curr_value > el.prev_value)
				.map((el) => {
					return {
						station_id: +req.body.station,
						amount: el.curr_value - el.prev_value,
						store_id: el.store.id,
						movment_id: el.movment_id,
						shift_number: station.shifts,
						start: shift.start,
						end: shift.end,
						price: lastPrice.prev_price,
						stocktaking_id: stocktaking.id,
					};
				});

			await SurplusModel.bulkCreate(surplus, { transaction: t });
			await StocktakingStoresMovmentsModel.bulkCreate(storesArr, {
				transaction: t,
			});
			if (req.body.type === "تسعيرة") {
				const priceMovmentEntriesArr = req.body.stores
					.filter((el) => lastPrice.substance_id === el.store.substance.id)
					.map((el) => {
						let debtor = 0;
						let creditor = 0;
						let amount = 0;
						if (lastPrice.price > lastPrice.prev_price) {
							if (el.curr_value < el.prev_value) {
								debtor =
									(lastPrice.price - lastPrice.prev_price) * el.prev_value;
								amount = el.prev_value;
							}
							if (el.curr_value > el.prev_value) {
								debtor =
									(lastPrice.price - lastPrice.prev_price) * el.curr_value;
								amount = el.curr_value;
							}
						} else {
							if (el.curr_value < el.prev_value) {
								creditor =
									(lastPrice.prev_price - lastPrice.price) * el.prev_value;
								amount = el.prev_value;
							}
							if (el.curr_value > el.prev_value) {
								creditor =
									(lastPrice.prev_price - lastPrice.price) * el.curr_value;
								amount = el.curr_value;
							}
						}
						return {
							store_id: el.store.id,
							station_id: +req.body.station,
							amount,
							prev_price: lastPrice.prev_price,
							curr_price: lastPrice.price,
							date: nextDay,
							stocktaking_id: stocktaking.id,
							debtor,
							creditor,
						};
					});

				await priceMovmentEntriesModel.bulkCreate(priceMovmentEntriesArr, {
					transaction: t,
				});
			}
			await MovmentModel.update(
				{ has_stocktaking: 1, stocktaking_id: stocktaking.id },
				{
					where: {
						id: req.body.currMovmentId,
					},
					transaction: t,
				}
			);
			const menbersArr = req.body.members.map((el) => {
				return { stocktaking_id: stocktaking.id, name: el.name };
			});
			await StocktakingMembersModel.bulkCreate(menbersArr, {
				transaction: t,
			});
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getStocktakingByMovmentId = catchAsync(async (req, res, next) => {
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
		return next(new AppError(error, 500));
	}
});
exports.getStocktakingById = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const stores = await StocktakingStoresMovmentsModel.findAll({
				where: {
					stocktaking_id: req.params.id,
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
		return next(new AppError(error, 500));
	}
});
exports.getAllStocktakings = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const stocktaking = await StocktakingModel.findAll({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
				include: [
					{
						model: StationModel,
						attributes: ["id", "name"],
					},
				],
				order: [["createdAt", "DESC"]],
				limit: +req.query.limit,
				offset: +req.query.limit * +req.query.page,
			});

			const total = await StocktakingModel.count({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
			});
			console.log(total);
			res.status(200).json({
				state: "success",
				stocktaking,
				total,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteStocktaking = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const stocktaking = await StocktakingModel.findOne({
				where: {
					id: req.params.id,
				},
			});
			await StocktakingModel.destroy({
				where: {
					id: req.params.id,
				},
				transaction: t,
			});

			await MovmentModel.update(
				{ has_stocktaking: 0 },
				{
					where: {
						id: stocktaking.movment_id,
					},
					transaction: t,
				}
			);
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
