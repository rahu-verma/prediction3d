const pgdb = require("./pgClient");

var storeChart = async function storeChart(consolidated) {
    var text =
        "INSERT INTO hm_chart(domain, month_year, admin_revenue, publisher_revenue) VALUES($1, $2, $3, $4)" +
        " ON CONFLICT (domain, month_year) DO UPDATE SET admin_revenue = $3, publisher_revenue = $4";
    try {
        return pgdb.query(text, [
            consolidated.domain,
            consolidated.month_year,
            consolidated.admin_revenue,
            consolidated.publisher_revenue,
        ]);
    } catch (e) {
        console.log(e);
    }
};

module.exports = storeChart;
