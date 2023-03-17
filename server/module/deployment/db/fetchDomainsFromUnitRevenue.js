const pgdb = require("./pgClient");

async function fetchDomainsFromUnitRevenue(dates) {
    var text = "SELECT DISTINCT(domain) AS domain FROM hm_unit_revenue WHERE date_time BETWEEN SYMMETRIC $1 AND $2";

    try {
        return pgdb.query(text, [dates[0], dates[1]]);
    } catch (e) {
        console.log(e);
    }
}

module.exports = fetchDomainsFromUnitRevenue;
