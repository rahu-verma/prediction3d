const pgdb = require("./pgClient");

async function clean_hm_unit_revenue(dates) {
    try {
        const query = `DELETE FROM hm_unit_revenue WHERE (date_time BETWEEN $1 AND $2) AND original_document_id IS NULL`;
        pgdb.query(query, dates);
    } catch (error) {
        console.log(error);
    }
}

module.exports = clean_hm_unit_revenue;
