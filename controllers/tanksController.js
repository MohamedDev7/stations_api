const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");

const { getModel } = require("../utils/modelSelect");

exports.getTanksByStationId = catchAsync(async (req, res, next) => {
	try {
		const TankModel = getModel(req.headers["x-year"], "tank");
		const SubstanceModel = getModel(req.headers["x-year"], "substance");
		const tanks = await TankModel.findAll({
			where: {
				station_id: req.params.id,
			},
			include: [{ model: SubstanceModel, attributes: ["id", "name"] }],
		});
		res.status(200).json({
			state: "success",
			tanks,
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.updateTank = catchAsync(async (req, res, next) => {
	try {
		const SubstanceModel = getModel(req.headers["x-year"], "substance");

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
