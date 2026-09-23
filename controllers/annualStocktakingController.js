const sequelize = require("./../connection");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Sequelize, Op } = require("sequelize");
const { getModel } = require("../utils/modelSelect");
exports.addAnnualStocktaking = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingMemberModel = getModel(
				req.year,
				"annual_stocktaking_member"
			);
			const AnnualStocktakingCashModel = getModel(
				req.year,
				"annual_stocktaking_cash"
			);
			const AnnualStocktakingTankModel = getModel(
				req.year,
				"annual_stocktaking_tank"
			);
			const AnnualStocktakingModel = getModel(req.year, "annual_stocktaking");
			const SubstancePriceMovmentModel = getModel(
				req.year,
				"substance_price_movment"
			);
			const AnnualStocktakingSurplusDeficitModel = getModel(
				req.year,
				"annual_stocktaking_surplus_deficit"
			);

			const MovmentModel = getModel(req.year, "movment");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const SurplusModel = getModel(req.year, "surplus");
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const QuantityDeductionMemberModel = getModel(
				req.year,
				"quantity_deduction_member"
			);
			const StoresModel = getModel(req.year, "store");
			const StoreMovmentModel = getModel(req.year, "store_movment");

			const movment = await MovmentModel.findOne({
				where: {
					station_id: req.body.station,
					date: req.body.date,
				},
				raw: true,
			});
			//last shift

			const movmentShift = await MovmentsShiftsModel.findOne({
				where: {
					movment_id: movment.id,
					number: movment.shifts,
				},
				raw: true,
			});
			const prices = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: `${req.year}-12-31` } },
						{ end_date: { [Op.gte]: `${req.year}-12-31` } },
					],
				},
				raw: true,
			});
			const annualStocktaking = await AnnualStocktakingModel.create(
				{
					station_id: req.body.station,
					date: req.body.date,
					time: req.body.time,
					number: req.body.number,
					last_income_id: req.body.lastIncome,
					last_movment_id: req.body.lastMovment,
					last_deposit_id: req.body.lastDeposit,
					day: req.body.day,
					portfolio_number: req.body.portfolioNum,
					portfolio_date: req.body.portfolioDate,
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
			const stores = await StoresModel.findAll({
				where: {
					station_id: req.body.station,
					type: "نقدي",
				},
				raw: true,
			});
			const stationSoresMovment = await StoreMovmentModel.findAll({
				where: {
					movment_id: movment.id,
					shift_id: movmentShift.id,
					store_id: {
						[Op.in]: stores.map((el) => el.id),
					},
				},
				raw: true,
			});
			const substancesData = req.body.substancesData.map((el) => {
				const storesMovment = el.storesMovment.filter(
					(el) => el.title === "العجز/الفائض"
				)[0];
				const store = stores.filter((ele) => ele.substance_id === el.id)[0];

				return {
					station_id: req.body.station,
					substance_id: el.id,
					deficit: Math.abs(storesMovment.spent),
					surplus: storesMovment.income,
					price: prices.filter((ele) => ele.substance_id === el.id)[0].price,
					annual_stocktaking_id: annualStocktaking.id,
					store_id: store.id,
					movment_id: movment.id,
					shift_id: movmentShift.id,
					date: req.body.date,
				};
			});

			const surplues = substancesData.filter((el) => el.surplus > 0);
			const deficit = substancesData.filter((el) => el.deficit > 0);

			const surpluesIds = await SurplusModel.bulkCreate(
				surplues.map((el) => {
					return {
						...el,
						amount: el.surplus,
						state: "approved",
						is_annual_stocktaking: 1,
					};
				}),
				{
					transaction: t,
					returning: true,
					raw: true,
				}
			);
			const deficitIds = await QuantityDeductionModel.bulkCreate(
				deficit.map((el) => {
					const storeMovment = stationSoresMovment.filter(
						(ele) => ele.store_id === el.store_id
					)[0];
					return {
						...el,
						amount: el.deficit,
						curr_value: storeMovment.curr_value,
						prev_value: storeMovment.curr_value - el.deficit,
						with_value: 0,
						is_annual_stocktaking: 1,
					};
				}),
				{
					transaction: t,
					returning: true,
				}
			);

			// Add members to quantity deduction records
			if (deficitIds.length > 0) {
				const quantityDeductionMembers = deficitIds.flatMap((deficitRecord) =>
					req.body.members.map((member) => ({
						quantity_deduction_id: deficitRecord.id,
						name: member.name,
					}))
				);
				await QuantityDeductionMemberModel.bulkCreate(
					quantityDeductionMembers,
					{
						transaction: t,
					}
				);
			}

			const updatedSubstancesData = substancesData.map((el) => {
				if (el.surplus > 0) {
					return {
						...el,
						surplus_id: surpluesIds.find((ele) => ele.store_id === el.store_id)
							.id,
					};
				} else if (el.deficit > 0) {
					return {
						...el,
						deficit_id: deficitIds.find((ele) => ele.store_id === el.store_id)
							.id,
					};
				}
				return el;
			});
			await AnnualStocktakingSurplusDeficitModel.bulkCreate(
				updatedSubstancesData,
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
// exports.getStocktakingByMovmentId = catchAsync(async (req, res, next) => {
// 	try {
// 		await req.db.transaction(async (t) => {
// 			const StoreModel = getModel(req.year, "store");
// 			const SubstanceModel = getModel(req.year, "substance");
// 			const StocktakingStoresMovmentsModel = getModel(
// 				req.year,
// 				"stocktaking_stores_movment"
// 			);
// 			const stores = await StocktakingStoresMovmentsModel.findAll({
// 				where: {
// 					movment_id: req.params.id,
// 				},
// 				include: [
// 					{
// 						model: StoreModel,
// 						attributes: ["id", "type", "name"],
// 						include: [
// 							{
// 								model: SubstanceModel,
// 								attributes: ["id", "name"],
// 							},
// 						],
// 					},
// 				],
// 			});
// 			res.status(200).json({
// 				state: "success",
// 				stores,
// 			});
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
// exports.getStocktakingById = catchAsync(async (req, res, next) => {
// 	try {
// 		await req.db.transaction(async (t) => {
// 			const StocktakingStoresMovmentsModel = getModel(
// 				req.year,
// 				"stocktaking_stores_movment"
// 			);
// 			const StoreModel = getModel(req.year, "store");
// 			const SubstanceModel = getModel(req.year, "substance");
// 			const stores = await StocktakingStoresMovmentsModel.findAll({
// 				where: {
// 					stocktaking_id: req.params.id,
// 				},
// 				include: [
// 					{
// 						model: StoreModel,
// 						attributes: ["id", "type", "name"],
// 						include: [
// 							{
// 								model: SubstanceModel,
// 								attributes: ["id", "name"],
// 							},
// 						],
// 					},
// 				],
// 			});
// 			res.status(200).json({
// 				state: "success",
// 				stores,
// 			});
// 		});
// 	} catch (error) {
// 		return next(new AppError(error, 500));
// 	}
// });
exports.getAllAnnualStocktaking = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingModel = getModel(req.year, "annual_stocktaking");
			const StationModel = getModel(req.year, "station");
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
exports.updateAnnualStocktaking = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingMemberModel = getModel(
				req.year,
				"annual_stocktaking_member"
			);
			const AnnualStocktakingCashModel = getModel(
				req.year,
				"annual_stocktaking_cash"
			);
			const AnnualStocktakingTankModel = getModel(
				req.year,
				"annual_stocktaking_tank"
			);
			const AnnualStocktakingModel = getModel(req.year, "annual_stocktaking");
			const SubstancePriceMovmentModel = getModel(
				req.year,
				"substance_price_movment"
			);
			const AnnualStocktakingSurplusDeficitModel = getModel(
				req.year,
				"annual_stocktaking_surplus_deficit"
			);
			const MovmentModel = getModel(req.year, "movment");
			const MovmentsShiftsModel = getModel(req.year, "movments_shift");
			const SurplusModel = getModel(req.year, "surplus");
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const StoresModel = getModel(req.year, "store");
			const StoreMovmentModel = getModel(req.year, "store_movment");

			const annualStocktakingId = req.params.id;

			// Get existing surplus/deficit records to delete related records
			const existingSurplusDeficit =
				await AnnualStocktakingSurplusDeficitModel.findAll({
					where: { annual_stocktaking_id: annualStocktakingId },
					transaction: t,
					raw: true,
				});

			// Delete existing surplus records
			await SurplusModel.destroy({
				where: {
					id: {
						[Op.in]: existingSurplusDeficit
							.filter((el) => el.surplus_id)
							.map((el) => el.surplus_id),
					},
				},
				transaction: t,
			});

			// Delete existing quantity deduction records
			await QuantityDeductionModel.destroy({
				where: {
					id: {
						[Op.in]: existingSurplusDeficit
							.filter((el) => el.deficit_id)
							.map((el) => el.deficit_id),
					},
				},
				transaction: t,
			});

			// Delete existing related records
			await AnnualStocktakingTankModel.destroy({
				where: { annual_stocktaking_id: annualStocktakingId },
				transaction: t,
			});
			await AnnualStocktakingMemberModel.destroy({
				where: { annual_stocktaking_id: annualStocktakingId },
				transaction: t,
			});
			await AnnualStocktakingCashModel.destroy({
				where: { annual_stocktaking_id: annualStocktakingId },
				transaction: t,
			});
			await AnnualStocktakingSurplusDeficitModel.destroy({
				where: { annual_stocktaking_id: annualStocktakingId },
				transaction: t,
			});

			// Get movment data
			const movment = await MovmentModel.findOne({
				where: {
					station_id: req.body.station,
					date: req.body.date,
				},
				raw: true,
			});

			const movmentShift = await MovmentsShiftsModel.findOne({
				where: {
					movment_id: movment.id,
					number: movment.shifts,
				},
				raw: true,
			});

			const prices = await SubstancePriceMovmentModel.findAll({
				where: {
					[Op.and]: [
						{ start_date: { [Op.lte]: `${req.year}-12-31` } },
						{ end_date: { [Op.gte]: `${req.year}-12-31` } },
					],
				},
				raw: true,
			});

			// Update main annual stocktaking record
			await AnnualStocktakingModel.update(
				{
					station_id: req.body.station,
					date: req.body.date,
					time: req.body.time,
					number: req.body.number,
					last_income_id: req.body.lastIncome,
					last_movment_id: req.body.lastMovment,
					last_deposit_id: req.body.lastDeposit,
					day: req.body.day,
					portfolio_number: req.body.portfolioNum,
					portfolio_date: req.body.portfolioDate,
				},
				{
					where: { id: annualStocktakingId },
					transaction: t,
				}
			);

			// Create new tanks
			const tanks = req.body.tanks.map((el) => ({
				station_id: req.body.station,
				tank_id: el.id,
				tank_height: el.tankHeight,
				height_in_cm: el.heightInCm,
				height_in_liter: el.heightInLiter,
				annual_stocktaking_id: annualStocktakingId,
			}));
			await AnnualStocktakingTankModel.bulkCreate(tanks, { transaction: t });

			// Create new members
			const members = req.body.members.map((el) => ({
				station_id: req.body.station,
				name: el.name,
				title: el.title,
				annual_stocktaking_id: annualStocktakingId,
			}));
			await AnnualStocktakingMemberModel.bulkCreate(members, {
				transaction: t,
			});

			// Create new cash
			let cash = {
				station_id: req.body.station,
				annual_stocktaking_id: annualStocktakingId,
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

			// Get stores for surplus/deficit
			const stores = await StoresModel.findAll({
				where: {
					station_id: req.body.station,
					type: "نقدي",
				},
				raw: true,
			});

			const stationSoresMovment = await StoreMovmentModel.findAll({
				where: {
					movment_id: movment.id,
					shift_id: movmentShift.id,
					store_id: { [Op.in]: stores.map((el) => el.id) },
				},
				raw: true,
			});

			// Create new surplus/deficit data
			const substancesData = req.body.substancesData.map((el) => {
				const storesMovment = el.storesMovment.filter(
					(el) => el.title === "العجز/الفائض"
				)[0];
				const store = stores.filter((ele) => ele.substance_id === el.id)[0];

				return {
					station_id: req.body.station,
					substance_id: el.id,
					deficit: Math.abs(storesMovment.spent),
					surplus: storesMovment.income,
					price: prices.filter((ele) => ele.substance_id === el.id)[0].price,
					annual_stocktaking_id: annualStocktakingId,
					store_id: store.id,
					movment_id: movment.id,
					shift_id: movmentShift.id,
					date: req.body.date,
				};
			});

			const surplues = substancesData.filter((el) => el.surplus > 0);
			const deficit = substancesData.filter((el) => el.deficit > 0);

			const surpluesIds = await SurplusModel.bulkCreate(
				surplues.map((el) => ({
					...el,
					amount: el.surplus,
					state: "pending",
				})),
				{ transaction: t, returning: true, raw: true }
			);

			const deficitIds = await QuantityDeductionModel.bulkCreate(
				deficit.map((el) => {
					const storeMovment = stationSoresMovment.filter(
						(ele) => ele.store_id === el.store_id
					)[0];
					return {
						...el,
						amount: el.deficit,
						curr_value: storeMovment.curr_value,
						prev_value: storeMovment.curr_value - el.deficit,
						with_value: 0,
					};
				}),
				{ transaction: t, returning: true }
			);

			const updatedSubstancesData = substancesData.map((el) => {
				if (el.surplus > 0) {
					return {
						...el,
						surplus_id: surpluesIds.find((ele) => ele.store_id === el.store_id)
							.id,
					};
				} else if (el.deficit > 0) {
					return {
						...el,
						deficit_id: deficitIds.find((ele) => ele.store_id === el.store_id)
							.id,
					};
				}
				return el;
			});

			await AnnualStocktakingSurplusDeficitModel.bulkCreate(
				updatedSubstancesData,
				{ transaction: t }
			);

			res.status(200).json({
				state: "success",
			});
		});
	} catch (error) {
		return next(new AppError(error, 500));
	}
});

exports.deleteAnnualStocktaking = catchAsync(async (req, res, next) => {
	try {
		await req.db.transaction(async (t) => {
			const AnnualStocktakingModel = getModel(req.year, "annual_stocktaking");
			const AnnualStocktakingSurplusDeficitModel = getModel(
				req.year,
				"annual_stocktaking_surplus_deficit"
			);
			const SurplusModel = getModel(req.year, "surplus");
			const QuantityDeductionModel = getModel(req.year, "quantity_deduction");
			const AnnualStocktakingSurplusDeficitIds =
				await AnnualStocktakingSurplusDeficitModel.findAll({
					where: {
						annual_stocktaking_id: req.params.id,
					},
					transaction: t,
					raw: true,
				});
			await SurplusModel.destroy({
				where: {
					id: {
						[Op.in]: AnnualStocktakingSurplusDeficitIds.map(
							(el) => el.surplus_id
						),
					},
				},
				transaction: t,
			});
			await QuantityDeductionModel.destroy({
				where: {
					id: {
						[Op.in]: AnnualStocktakingSurplusDeficitIds.map(
							(el) => el.deficit_id
						),
					},
				},
				transaction: t,
			});

			await AnnualStocktakingModel.destroy({
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
