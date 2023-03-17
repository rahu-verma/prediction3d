const pgdb = require("./pgClient");

async function fetchTotalDomainReport([start, end]) {
    const queryText = `SELECT * FROM hm_report_revenue WHERE date_time BETWEEN '${start}' AND '${end}'`;

    try {
        return pgdb.query(queryText);
    } catch (e) {
        console.log(e);
    }
}

module.exports = fetchTotalDomainReport;
