const sequelize = require("./connection");

async function check() {
    try {
        const query = `
            SELECT 'income' as source, id, amount, price, amount*price as total FROM incomes WHERE station_id = 7 AND amount*price = 12972100
            UNION ALL
            SELECT 'surplus' as source, id, amount, price, amount*price as total FROM surpluses WHERE station_id = 7 AND amount*price = 12972100
            UNION ALL
            SELECT 'quantity_deductions' as source, id, amount, price, amount*price as total FROM quantity_deductions WHERE station_id = 7 AND amount*price = 12972100
            UNION ALL
            SELECT 'financial_operations debtor' as source, id, debtor as amount, 1 as price, debtor as total FROM financial_operations WHERE station_id = 7 AND debtor = 12972100
            UNION ALL
            SELECT 'price_movment_entries debtor' as source, id, debtor as amount, 1 as price, debtor as total FROM price_movment_entries WHERE station_id = 7 AND debtor = 12972100
            UNION ALL
            SELECT 'credit_sales' as source, id, amount, price, amount*price as total FROM credit_sales WHERE station_id = 7 AND amount*price = 12972100
        `;
        const [results] = await sequelize.query(query);
        console.log(results);
    } catch(e) { console.error(e); }
    process.exit(0);
}
check();
