const catchAsync = require("../utils/catchAsync");
const SubstanceModel = require("./../models/substanceModel");
const AppError = require("../utils/appError");
const SubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
const sequelize = require("./../connection");
exports.getAllSubstances = catchAsync(async (req, res, next) => {
	try {
		const substances = await SubstanceModel.findAll();
		res.status(200).json({
			state: "success",
			substances,
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
					price: +req.body.price,
				},
				{ transaction: t }
			);
			console.log(`substance`, substance.id);
			await SubstancePriceMovmentModel.create(
				{
					prev_price: req.body.price,
					curr_price: req.body.price,
					substance_id: substance.id,
					type: "تسعيرة اولية",
					start_date: new Date(),
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
	console.log(`req.params`, req.params);
	try {
		await sequelize.transaction(async (t) => {
			await SubstanceModel.update(
				{ price: req.body.newPrice },
				{
					where: { id: req.params.id },
					transaction: t,
				}
			);
			await SubstancePriceMovmentModel.create(
				{
					prev_price: req.body.price,
					curr_price: req.body.newPrice,
					substance_id: req.params.id,
					start_date: req.body.date,
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
		console.log(`error`, error);
		return next(new AppError(error, 500));
	}
});
