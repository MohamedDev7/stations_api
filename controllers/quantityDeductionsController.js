const sequelize = require("./../connection");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getModel } = require("../utils/modelSelect");
const { Sequelize } = require("sequelize");

exports.addQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");

			const QuantityDeductionMemberModel = getModel(
				req.year,
				"quantity_deduction_member"
			);
			const [day, month, year] = req.body.date.trim().split("/");
			const currDate = new Date(`${year}-${month}-${day}`);
			const nextDay = new Date(currDate);
			nextDay.setDate(currDate.getDate() + 1);

			const quantityDeduction = await QuantityDeductionModel.create(
				{
					movment_id: req.body.movmentId,
					date: currDate,
					station_id: +req.body.station,
					type: req.body.type,
					amount: req.body.amount,
					// substance_id: req.body.substance,
					prev_value: req.body.prevValue,
					curr_value: req.body.currValue,
					price: req.body.price,
					store_id: req.body.store,
					with_value: req.body.withValue,
				},
				{ transaction: t, raw: true }
			);
			const members = req.body.members.map((el) => {
				return {
					quantity_deduction_id: quantityDeduction.id,
					name: el.name,
				};
			});
			await QuantityDeductionMemberModel.bulkCreate(members, {
				transaction: t,
			});

			// const storesArr = req.body.stores.map((el) => {
			// 	return {
			// 		movment_id: req.body.movmentId,
			// 		station_id: +req.body.station,
			// 		price: el.price,
			// 		quantity_deduction_id: quantityDeduction.id,
			// 	};
			// });
			// await QuantityDeductionStoresMovmentsModel.bulkCreate(storesArr, {
			// 	transaction: t,
			// });
			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});
exports.getAllQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const StationModel = getModel(req.year, "station");
			const quantityDeduction = await QuantityDeductionModel.findAll({
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

			const total = await QuantityDeductionModel.count({
				where: {
					station_id: {
						[Sequelize.Op.in]: req.stations,
					},
				},
			});

			res.status(200).json({
				state: "success",
				quantityDeduction,
				total,
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.getQuantityDeductionById = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const QuantityDeductionMemberModel = getModel(
				req.year,
				"quantity_deduction_member"
			);
			const StationModel = getModel(req.year, "station");
			const StoreModel = getModel(req.year, "store");
			const SubstanceModel = getModel(req.year, "substance");

			const quantityDeduction = await QuantityDeductionModel.findOne({
				where: { id: req.params.id },
				include: [
					{
						model: StationModel,
						attributes: ["id", "name"],
					},
					{
						model: StoreModel,
						attributes: ["id", "name", "type"],
						include: [
							{
								model: SubstanceModel,
								attributes: ["id", "name"],
							},
						],
					},
				],
				transaction: t,
			});

			if (!quantityDeduction) {
				return next(new AppError("Quantity deduction not found", 404));
			}

			const members = await QuantityDeductionMemberModel.findAll({
				where: { quantity_deduction_id: req.params.id },
				attributes: ["id", "name"],
				transaction: t,
			});

			res.status(200).json({
				state: "success",
				data: {
					...quantityDeduction.toJSON(),
					members,
				},
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.editQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const QuantityDeductionMemberModel = getModel(
				req.year,
				"quantity_deduction_member"
			);

			const [day, month, year] = req.body.date.trim().split("/");
			const currDate = new Date(`${year}-${month}-${day}`);

			// Update quantity deduction record
			await QuantityDeductionModel.update(
				{
					movment_id: req.body.movmentId,
					date: currDate,
					station_id: +req.body.station,
					type: req.body.type,
					amount: req.body.amount,
					prev_value: req.body.prevValue,
					curr_value: req.body.currValue,
					price: req.body.price,
					store_id: req.body.store,
					with_value: req.body.withValue,
				},
				{
					where: { id: req.params.id },
					transaction: t,
				}
			);

			// Delete existing members
			await QuantityDeductionMemberModel.destroy({
				where: { quantity_deduction_id: req.params.id },
				transaction: t,
			});

			// Create new members
			const members = req.body.members.map((el) => ({
				quantity_deduction_id: +req.params.id,
				name: el.name,
			}));
			await QuantityDeductionMemberModel.bulkCreate(members, {
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

exports.deleteQuantityDeductions = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			await QuantityDeductionModel.destroy({
				where: {
					id: req.params.id,
				},
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

exports.changeQuantityDeductionState = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");

			const quantityDeduction = await QuantityDeductionModel.findOne({
				where: { id: req.params.id },
				transaction: t,
			});

			if (!quantityDeduction) {
				return next(new AppError("Quantity deduction not found", 404));
			}

			const newWithValue = quantityDeduction.with_value === 1 ? 0 : 1;
	
			await QuantityDeductionModel.update(
				{ with_value: newWithValue },
				{
					where: { id: req.params.id },
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
