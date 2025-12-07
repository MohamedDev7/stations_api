const sequelize = require("./../connection");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Sequelize, Op } = require("sequelize");
const { getModel } = require("../utils/modelSelect");
exports.addAnnualStocktaking = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingMemberModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_member"
			);
			const AnnualStocktakingCashModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_cash"
			);
			const AnnualStocktakingTankModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_tank"
			);
			const AnnualStocktakingModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking"
			);
			const SubstancePriceMovmentModel = getModel(
				req.headers["x-year"],
				"substance_price_movment"
			);
			const AnnualStocktakingSurplusDeficitModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking_surplus_deficit"
			);
			const prices = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: `${req.headers["x-year"]}-12-31` } },
						{ end_date: { [Op.gte]: `${req.headers["x-year"]}-12-31` } },
					],
				},
				raw: true,
			});
			const annualStocktaking = await AnnualStocktakingModel.create(
				{
					station_id: req.body.station,
				},
				{ transaction: t }
			);
			const tanks = req.body.tanks.map((el) => {
				return {
					station_id: req.body.station,
					tank_id: el.id,
					tank_height: el.tankHeight,
					height_in_cm: el.heightInCm,
					height_in_liter: el.heightInLiter,
					annual_stocktaking_id: annualStocktaking.id,
				};
			});

			await AnnualStocktakingTankModel.bulkCreate(tanks, { transaction: t });
			const members = req.body.members.map((el) => {
				return {
					station_id: req.body.station,
					name: el.name,
					title: el.title,
					annual_stocktaking_id: annualStocktaking.id,
				};
			});
			await AnnualStocktakingMemberModel.bulkCreate(members, {
				transaction: t,
			});
			let cash = {
				station_id: req.body.station,
				annual_stocktaking_id: annualStocktaking.id,
				1000: 0,
				500: 0,
				200: 0,
				100: 0,
				50: 0,
				20: 0,
				10: 0,
				5: 0,
				1: 0,
			};
			req.body.cash.forEach((el) => {
				cash[el.number] = el.amount;
			});

			await AnnualStocktakingCashModel.create(cash, { transaction: t });
			const substancesData = req.body.substancesData.map((el) => {
				const storesMovment = el.storesMovment.filter(
					(el) => el.title === "العجز/الفائض"
				)[0];

				return {
					station_id: req.body.station,
					substance_id: el.id,
					deficit: Math.abs(storesMovment.spent),
					surplus: storesMovment.income,
					price: prices.filter((ele) => ele.substance_id === el.id)[0].price,
					annual_stocktaking_id: annualStocktaking.id,
				};
			});
			await AnnualStocktakingSurplusDeficitModel.bulkCreate(substancesData, {
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
		await req.db.transaction(async (t) => {
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const StocktakingStoresMovmentsModel = getModel(
				req.headers["x-year"],
				"stocktaking_stores_movment"
			);
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
		await req.db.transaction(async (t) => {
			const StocktakingStoresMovmentsModel = getModel(
				req.headers["x-year"],
				"stocktaking_stores_movment"
			);
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
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
exports.getAllAnnualStocktaking = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingModel = getModel(
				req.headers["x-year"],
				"annual_stocktaking"
			);
			const StationModel = getModel(req.headers["x-year"], "station");
			const stocktaking = await AnnualStocktakingModel.findAll({
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
			const total = await AnnualStocktakingModel.count({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
			});

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
		await req.db.transaction(async (t) => {
			const StocktakingModel = getModel(req.headers["x-year"], "stocktaking");
			const MovmentModel = getModel(req.headers["x-year"], "movment");
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
