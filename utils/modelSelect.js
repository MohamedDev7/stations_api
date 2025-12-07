// modelSelector.js

const { sequelizeStations } = require("../connection");
const defineStationModel = require("../models/stationModel");
const defineShiftModel = require("../models/shiftModel");
const defineStoreModel = require("../models/storeModel");
const defineSubstanceModel = require("../models/substanceModel");
const defineSubstancePriceMovmentModel = require("../models/substancePriceMovmentModel");
const defineTankModel = require("../models/tankModel");
const defineTankMovmentModel = require("../models/tankMovmentModel");
const defineDispenserModel = require("../models/dispenserModel");
const defineDispenserMovmentModel = require("../models/dispenserMovmentModel");
const defineDispenserWheelCounterMovmentModel = require("../models/dispenserWheelCounterMovmentModel");
const defineMovmentModel = require("../models/movmentModel");
const defineIncomeModel = require("../models/incomeModel");
const defineSurplusModel = require("../models/surplusModel");
const defineStocktakingModel = require("../models/stocktakingModel");
const defineStocktakingMembersModel = require("../models/stocktakingMembersModel");
const defineStocktakingStoresMovmentsModel = require("../models/stocktakingStoresMovmentsModel");
const defineStoreMovmentModel = require("../models/storeMovmentModel");
const defineQuantityDeductionStoresMovmentsModel = require("../models/quantityDeductionStoresMovmentsModel");
const defineQuantityDeductionModel = require("../models/quantityDeductionModel ");
const defineStoresTransferModel = require("../models/storesTransferModel");
const defineBranchWithdrawalsModel = require("../models/branchWithdrawalsModel");
const defineOtherModel = require("../models/otherModel");
const defineStationsClosedMonthModel = require("../models/stationsClosedMonthModel");
const defineUserModel = require("../models/userModel");
const definePermissionModel = require("../models/permissionModel");
const defineEmployeesModel = require("../models/employeeModel");
const defineReceiveModel = require("../models/receiveModel");
const defineDepositModel = require("../models/depositModel");
const defineBankModel = require("../models/bankModel");
const defineUserStationModel = require("../models/userStationModel");
const defineUserDeviceModel = require("../models/userDeviceModel");
const defineDeviceModel = require("../models/deviceModel");
const defineUnauthorizedDevice = require("../models/unauthorizedDevice");
const defineClientModel = require("../models/clientModel");
const defineClientStationsModel = require("../models/clientStationsModel");
const defineCreditSaleModel = require("../models/creditSaleModel");
const defineCreditSaleSettlementModel = require("../models/creditSaleSettlementModel");
const defineCalibrationModel = require("../models/calibrationModel");
const defineCalibrationReportModel = require("../models/calibrationReportModel");
const defineCalibrationMemberModel = require("../models/calibrationMemberModel");
const defineMovmentsShiftsModel = require("../models/movmentsShiftsModel");
const definePriceMovmentEntriesModel = require("../models/priceMovmentEntriesModel");
const defineAnnualStocktakingMemberModel = require("../models/annualStocktakingMemberModel");
const defineAnnualStocktakingCashModel = require("../models/annualStocktakingCashModel");
const defineAnnualStocktakingTankModel = require("../models/annualStocktakingTankModel");
const defineAnnualStocktakingModel = require("../models/annualStocktakingModel");
const defineAnnualStocktakingSurplusDeficitModel = require("../models/annualStocktakingsSurplusDeficitModel");
function initModels(sequelize) {
	const BankModel = defineBankModel(sequelize);
	const DeviceModel = defineDeviceModel(sequelize);
	const StationModel = defineStationModel(sequelize);
	const ShiftModel = defineShiftModel(sequelize, { StationModel });
	const SubstanceModel = defineSubstanceModel(sequelize);
	const SubstancePriceMovmentModel =
		defineSubstancePriceMovmentModel(sequelize);
	const StoreModel = defineStoreModel(sequelize, {
		StationModel,
		SubstanceModel,
		SubstancePriceMovmentModel,
	});

	const TankModel = defineTankModel(sequelize, {
		SubstancePriceMovmentModel,
		SubstanceModel,
	});
	const TankMovmentModel = defineTankMovmentModel(sequelize, {
		StationModel,
		SubstancePriceMovmentModel,
		TankModel,
	});
	const DispenserModel = defineDispenserModel(sequelize, {
		TankModel,
		StationModel,
	});

	const DispenserWheelCounterMovmentModel =
		defineDispenserWheelCounterMovmentModel(sequelize, { DispenserModel });
	const MovmentModel = defineMovmentModel(sequelize, {
		StationModel,
	});
	const DispenserMovmentModel = defineDispenserMovmentModel(sequelize, {
		DispenserModel,
		MovmentModel,
		ShiftModel,
	});
	const IncomeModel = defineIncomeModel(sequelize, {
		StoreModel,
		StationModel,
		MovmentModel,
	});

	const StocktakingModel = defineStocktakingModel(sequelize, {
		StationModel,
		SubstanceModel,
	});
	const SurplusModel = defineSurplusModel(sequelize, {
		StoreModel,
		StationModel,
		MovmentModel,
		StocktakingModel,
	});
	const StocktakingMembersModel = defineStocktakingMembersModel(sequelize, {
		StocktakingModel,
	});
	const StocktakingStoresMovmentsModel = defineStocktakingStoresMovmentsModel(
		sequelize,
		{
			StoreModel,
		}
	);
	const StoreMovmentModel = defineStoreMovmentModel(sequelize, {
		StoreModel,
	});
	const QuantityDeductionStoresMovmentsModel =
		defineQuantityDeductionStoresMovmentsModel(sequelize, { StoreModel });
	const QuantityDeductionModel = defineQuantityDeductionModel(sequelize, {
		StoreModel,
		SubstanceModel,
		StationModel,
	});
	const StoresTransferModel = defineStoresTransferModel(sequelize, {
		StoreModel,
	});
	const BranchWithdrawalsModel = defineBranchWithdrawalsModel(sequelize, {
		StoreModel,
		MovmentModel,
	});
	const OtherModel = defineOtherModel(sequelize, {
		StoreModel,
		MovmentModel,
	});
	const StationsClosedMonthModel = defineStationsClosedMonthModel(sequelize, {
		StationModel,
	});
	const UserModel = defineUserModel(sequelize);
	const PermissionModel = definePermissionModel(sequelize);
	const EmployeesModel = defineEmployeesModel(sequelize, { StationModel });
	const ReceiveModel = defineReceiveModel(sequelize, {
		StationModel,
		EmployeesModel,
	});
	const DepositModel = defineDepositModel(sequelize, {
		StationModel,
		BankModel,
	});

	const UserStationModel = defineUserStationModel(sequelize, {
		StationModel,
		UserModel,
	});
	const UserDeviceModel = defineUserDeviceModel(sequelize, {
		UserModel,
		DeviceModel,
	});

	const UnauthorizedDevice = defineUnauthorizedDevice(sequelize);
	const ClientModel = defineClientModel(sequelize);
	const ClientStationsModel = defineClientStationsModel(sequelize, {
		ClientModel,
	});

	const CreditSaleSettlementModel = defineCreditSaleSettlementModel(sequelize, {
		StoreModel,
		ClientModel,
		StationModel,
	});
	const CalibrationModel = defineCalibrationModel(sequelize, {
		StoreModel,
		StationModel,
		MovmentModel,
		DispenserModel,
	});
	const CalibrationReportModel = defineCalibrationReportModel(sequelize, {
		StationModel,
		MovmentModel,
	});
	const CalibrationMemberModel = defineCalibrationMemberModel(sequelize, {
		CalibrationModel,
		UserModel,
	});
	const MovmentsShiftsModel = defineMovmentsShiftsModel(sequelize, {
		StationModel,
		MovmentModel,
	});
	const PriceMovmentEntriesModel = definePriceMovmentEntriesModel(sequelize, {
		StationModel,
		StocktakingModel,
		StoreModel,
	});
	const CreditSaleModel = defineCreditSaleModel(sequelize, {
		StoreModel,
		ClientModel,
		StationModel,
		MovmentModel,
		EmployeesModel,
		CreditSaleSettlementModel,
	});
	const AnnualStocktakingModel = defineAnnualStocktakingModel(sequelize, {
		StationModel,
	});
	const AnnualStocktakingMemberModel = defineAnnualStocktakingMemberModel(
		sequelize,
		{ StationModel }
	);
	const AnnualStocktakingCashModel = defineAnnualStocktakingCashModel(
		sequelize,
		{ StationModel }
	);
	const AnnualStocktakingTankModel = defineAnnualStocktakingTankModel(
		sequelize,
		{ TankModel, StationModel }
	);
	const AnnualStocktakingSurplusDeficitModel =
		defineAnnualStocktakingSurplusDeficitModel(sequelize, {
			StationModel,
			SubstanceModel,
		});
	return {
		bank: BankModel,
		device: DeviceModel,
		station: StationModel,
		shift: ShiftModel,
		store: StoreModel,
		substance: SubstanceModel,
		substance_price_movment: SubstancePriceMovmentModel,
		tank: TankModel,
		tank_movment: TankMovmentModel,
		dispenser: DispenserModel,
		dispenser_movment: DispenserMovmentModel,
		dispenser_wheel_counter_movment: DispenserWheelCounterMovmentModel,
		movment: MovmentModel,
		income: IncomeModel,
		surplus: SurplusModel,
		stocktaking: StocktakingModel,
		stocktaking_members: StocktakingMembersModel,
		stocktaking_stores_movments: StocktakingStoresMovmentsModel,
		store_movment: StoreMovmentModel,
		quantity_deduction_stores_movments: QuantityDeductionStoresMovmentsModel,
		quantity_deduction: QuantityDeductionModel,
		stores_transfer: StoresTransferModel,
		branch_withdrawals: BranchWithdrawalsModel,
		other: OtherModel,
		stations_closed_month: StationsClosedMonthModel,
		user: UserModel,
		permission: PermissionModel,
		employee: EmployeesModel,
		receive: ReceiveModel,
		deposit: DepositModel,
		user_station: UserStationModel,
		user_device: UserDeviceModel,
		unauthorized_device: UnauthorizedDevice,
		client: ClientModel,
		client_station: ClientStationsModel,
		credit_sale: CreditSaleModel,
		credit_sale_settlement: CreditSaleSettlementModel,
		calibration: CalibrationModel,
		calibration_report: CalibrationReportModel,
		calibration_member: CalibrationMemberModel,
		movments_shift: MovmentsShiftsModel,
		annual_stocktaking: AnnualStocktakingModel,
		price_movment_entries: PriceMovmentEntriesModel,
		annual_stocktaking_member: AnnualStocktakingMemberModel,
		annual_stocktaking_cash: AnnualStocktakingCashModel,
		annual_stocktaking_tank: AnnualStocktakingTankModel,
		annual_stocktaking_surplus_deficit: AnnualStocktakingSurplusDeficitModel,
	};
}

const models = {
	stations: initModels(sequelizeStations),
};

function getModel(year, modelName) {
	const serverYear = process.env.YEAR;
	let dbKey = null;
	if (year === serverYear) {
		dbKey = "stations";
	} else {
		dbKey = `stations-${year}`;
	}
	if (!models[dbKey]) {
		throw new Error(`Database instance for year '${year}' not configured`);
	}
	if (!models[dbKey][modelName]) {
		throw new Error(`Model '${modelName}' not found for database '${dbKey}'`);
	}

	return models[dbKey][modelName];
}

module.exports = {
	getModel,
};
