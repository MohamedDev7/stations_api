const catchAsync = require("../utils/catchAsync");
const SubstanceModel = require("./../models/substanceModel");
const AppError = require("../utils/appError");
const SubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
const sequelize = require("./../connection");
const { Op } = require("sequelize");
exports.getAllSubstances = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const substances = await SubstanceModel.findAll({ transaction: t });
			const prices = await SubstancePriceMovmentModel.findAll({
				attributes: [
					"substance_id",
					[sequelize.fn("max", sequelize.col("number")), "max_number"],
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
		await sequelize.transaction(async (t) => {
			const prices = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: req.params.date } }, // Start date is less than or equal to requestDate
						{ end_date: { [Op.gte]: req.params.date } }, // End date is greater than or equal to requestDate
					],
				},
				raw: true,
			});

			res.status(200).json({
				state: "success",
				prices,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getSubstance = catchAsync(async (req, res, next) => {
	try {
		const substance = await SubstanceModel.findByPk(req.params.id);
		res.status(200).json({
			state: "success",
			substance,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.addSubstance = catchAsync(async (req, res, next) => {
	try {
		await sequelize.transaction(async (t) => {
			const substance = await SubstanceModel.create(
				{
					name: req.body.name,
				},
				{ transaction: t }
			);

			await SubstancePriceMovmentModel.create(
				{
					price: req.body.price,
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
		await sequelize.transaction(async (t) => {
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
