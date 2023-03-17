const pgdb = require("./pgClient");

async function fetchUnitBasedData(startDate, endDate) {
    // var text =
    //     "SELECT SUM(llr) AS llr, AVG(ctr) AS ctr, AVG(vcpm) AS vcpm, AVG(viewability) AS viewability, SUM(avt) AS avt, SUM(ad_fees) AS ad_fees, SUM(net60_revenue) AS net60_revenue, SUM(admin_revenue) AS admin_revenue, SUM(publisher_revenue) AS publisher_revenue, date_time FROM hm_unit_revenue WHERE domain = $1 AND report_type = $2 AND (date_time BETWEEN SYMMETRIC $3 AND $4) GROUP BY date_time";

    const queryText = `
        SELECT domain, report_type, SUM(llr) AS llr, AVG(ctr) AS ctr, AVG(vcpm) AS vcpm, 
        AVG(viewability) AS viewability, SUM(avt) AS avt, 
        SUM(ad_fees) AS ad_fees, SUM(net60_revenue) AS net60_revenue, 
        SUM(admin_revenue) AS admin_revenue, SUM(publisher_revenue) AS publisher_revenue, date_time 
        FROM hm_unit_revenue
        WHERE report_type != 'NOT DEFINED' AND (date_time BETWEEN SYMMETRIC $1 AND $2)
        GROUP BY (domain, report_type, date_time)
        `;

    try {
        return pgdb.query(queryText, [startDate, endDate]);
    } catch (e) {
        console.log(e);
    }
}

module.exports = fetchUnitBasedData;
