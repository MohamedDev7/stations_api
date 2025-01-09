const catchAsync = require("../utils/catchAsync");
const SubstanceModel = require("./../models/substanceModel");
const AppError = require("../utils/appError");
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
	console.log(`foo`, req.body.price);
	try {
		const substance = await SubstanceModel.create({
			name: req.body.name,
			price: req.body.price,
		});
		res.status(200).json({
			state: "success",
			substance,
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
			{ name: req.body.name, price: req.body.price },
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
