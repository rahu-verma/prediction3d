const pgdb = require("./pgClient");

var fetchAdminEarning = async function fetchAdminEarning(date_time) {
    var text =
        "SELECT SUM(admin_revenue) AS admin_revenue FROM hm_unit_revenue WHERE date_time BETWEEN SYMMETRIC $1 AND $2";

    try {
        return pgdb.query(text, [date_time[0], date_time[1]]);
    } catch (e) {
        console.log(e);
    }
};

module.exports = fetchAdminEarning;
