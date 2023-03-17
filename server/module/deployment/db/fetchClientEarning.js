const pgdb = require("./pgClient");

var fetchClientEarning = async function fetchClientEarning(domain, date_time) {
    var text =
        "SELECT SUM(admin_revenue) AS admin_revenue, SUM(publisher_revenue) AS publisher_revenue FROM hm_unit_revenue WHERE domain = $1 AND (date_time BETWEEN SYMMETRIC $2 AND $3)";

    try {
        return pgdb.query(text, [domain, date_time[0], date_time[1]]);
    } catch (e) {
        console.log(e);
    }
};

module.exports = fetchClientEarning;
