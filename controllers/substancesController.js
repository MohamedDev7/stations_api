const catchAsync = require("../utils/catchAsync");
const { getModel } = require("../utils/modelSelect");
const AppError = require("../utils/appError");

const sequelize = require("./../connection");
const { Op, Sequelize } = require("sequelize");

exports.getAllSubstances = catchAsync(async (req, res, next) => {
	try {
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const SubstancePriceMovmentModel = getModel(
			req.headers["x-year"],
			"substance_price_movment"
		);
		await req.db.transaction(async (t) => {
			const substances = await SubstanceModel.findAll({ transaction: t });
			const prices = await SubstancePriceMovmentModel.findAll({
				attributes: [
					"substance_id",
					[req.db.fn("max", req.db.col("number")), "max_number"],
				],
				group: ["substance_id"],
				raw: true,
			});

			res.status(200).json({
				state: "success",
				substances,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getSubstancesPricesByDate = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const SubstancePriceMovmentModel = getModel(
				req.headers["x-year"],
				"substance_price_movment"
			);
			const prices = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: req.params.date } }, // Start date is less than or equal to requestDate
						{ end_date: { [Op.gte]: req.params.date } }, // End date is greater than or equal to requestDate
					],
				},
				raw: true,
			});
			const maxBySubstance = {};

			prices.forEach((item) => {
				const id = item.substance_id;
				// If this is the first time we've seen this substance, or this item has a higher 'number'
				if (!maxBySubstance[id] || item.number > maxBySubstance[id].number) {
					maxBySubstance[id] = item;
				}
			});

			// Convert the result to an array of elements
			const result = Object.values(maxBySubstance);

			res.status(200).json({
				state: "success",
				prices: result,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getSubstance = catchAsync(async (req, res, next) => {
	try {
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const SubstancePriceMovmentModel = getModel(
			req.headers["x-year"],
			"substance_price_movment"
		);
		const lastPriceNumber = await SubstancePriceMovmentModel.max("number", {
			where: { substance_id: req.params.id },
		});
		const lastPrice = await SubstancePriceMovmentModel.findOne({
			where: { substance_id: req.params.id, number: lastPriceNumber },
		});
		const substance = await SubstanceModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			substance: {
				...substance.dataValues,
				price: lastPrice.price,
				prev_price: lastPrice.prev_price,
			},
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getSubstancesStocksByMovmentIdAndShiftID = catchAsync(
	async (req, res, next) => {
		try {
			const StoreMovmentModel = getModel(
				req.headers["x-year"],
				"store_movment"
			);
			const StoreModel = getModel(req.headers["x-year"], "store");
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const stocks = await StoreMovmentModel.findAll({
				where: {
					movment_id: req.query.movmentId,
					shift_id: req.query.shiftId,
				},
				include: [
					{
						model: StoreModel,
						attributes: ["substance_id"],
						where: {
							substance_id: { [Op.in]: req.query.substanceIds.split(",") },
						},
						include: [{ model: SubstanceModel, attributes: ["name"] }],
					},
				],
				attributes: [
					"store.substance_id", // Include substance_id for grouping
					[req.db.fn("SUM", req.db.col("curr_value")), "amount"],
				],
				group: ["store.substance_id"],
				raw: true,
			});

			res.status(200).json({
				state: "success",
				stocks,
			});
		} catch (error) {
			return next(new AppError(error, 500));
		}
	}
);
exports.addSubstance = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const SubstanceModel = getModel(req.headers["x-year"], "substance");
			const SubstancePriceMovmentModel = getModel(
				req.headers["x-year"],
				"substance_price_movment"
			);
			const substance = await SubstanceModel.create(
				{
					name: req.body.name,
				},
				{ transaction: t }
			);

			await SubstancePriceMovmentModel.create(
				{
					price: req.body.price,
					prev_price: req.body.price,
					substance_id: substance.id,
					type: "تسعيرة اولية",
					start_date: new Date(),
					end_date: new Date("2100-12-31"),
					number: 0,
					name: req.body.name,
				},
				{ transaction: t }
			);
			res.status(200).json({
				state: "success",
				substance,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.deleteSubstance = catchAsync(async (req, res, next) => {
	try {
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		await SubstanceModel.destroy({
			where: { id: req.params.id },
		});
		res.status(200).json({
			state: "success",
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.updateSubstance = catchAsync(async (req, res, next) => {
	try {
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		await SubstanceModel.update(
			{ name: req.body.name },
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
exports.updateSubstancePrice = catchAsync(async (req, res, next) => {
	const SubstancePriceMovmentModel = getModel(
		req.headers["x-year"],
		"substance_price_movment"
	);

	const lastPriceNumber = await SubstancePriceMovmentModel.max("number", {
		where: { substance_id: req.params.id },
	});
	const lastPrice = await SubstancePriceMovmentModel.findOne({
		where: { substance_id: req.params.id, number: lastPriceNumber },
	});
	const currDate = new Date(req.body.date);
	const previousDay = new Date(currDate);
	previousDay.setDate(currDate.getDate() - 1);
	try {
		await req.db.transaction(async (t) => {
			await SubstancePriceMovmentModel.update(
				{
					end_date: previousDay,
				},
				{ where: { id: lastPrice.id }, transaction: t }
			);
			await SubstancePriceMovmentModel.create(
				{
					number: +lastPrice.number + 1,
					price: req.body.newPrice,
					prev_price: lastPrice.price,
					substance_id: req.params.id,
					start_date: req.body.date,
					end_date: new Date("2100-12-31"),
					name: req.body.name,
					type: "تحريك تسعيرة",
				},
				{
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
exports.getSubstancePriceMovment = catchAsync(async (req, res, next) => {
	try {
		const SubstancePriceMovmentModel = getModel(
			req.headers["x-year"],
			"substance_price_movment"
		);
		const currDate = new Date(req.query.date);
		const nextDay = new Date(currDate);
		nextDay.setDate(currDate.getDate() + 1);
		const PriceMovment = await SubstancePriceMovmentModel.findAll({
			where: {
				start_date: nextDay,
				// end_date: "2100-12-31",
				substance_id: { [Op.in]: req.query.substanceIds.split(",") },
			},
		});
		res.status(200).json({
			state: "success",
			PriceMovment,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
