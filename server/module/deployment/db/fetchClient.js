const pgdb = require("./pgClient");

async function fetchClient([start, end]) {
    // Nirjhar Previous Query Text
    // const text =
    //     "SELECT domain, SUM(llr) AS llr, AVG(ctr) AS ctr, AVG(vcpm) AS vcpm, AVG(avt) AS avt, AVG(viewability) AS viewability, AVG(admin_vcpm) AS admin_vcpm, SUM(ad_fees) AS ad_fees, SUM(publisher_revenue) AS publisher_revenue, SUM(net60_revenue) AS net60_revenue, SUM(admin_revenue) AS admin_revenue, date_time FROM hm_unit_revenue WHERE domain = $1 AND date_time = $2 GROUP BY (domain, date_time)";

    const queryText = `
        SELECT domain, SUM(llr) AS llr, AVG(ctr) AS ctr, AVG(vcpm) AS vcpm, AVG(avt) AS avt, AVG(viewability) AS viewability, AVG(admin_vcpm) AS admin_vcpm, SUM(ad_fees) AS ad_fees, SUM(publisher_revenue) AS publisher_revenue, SUM(net60_revenue) AS net60_revenue, SUM(admin_revenue) AS admin_revenue, date_time
        FROM hm_unit_revenue
        WHERE date_time BETWEEN '${start}' AND '${end}' GROUP BY (domain, date_time)
        `;

    try {
        return pgdb.query(queryText);
    } catch (e) {
        console.log(e);
    }
}

module.exports = fetchClient;
