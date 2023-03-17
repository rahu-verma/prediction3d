const pgdb = require("./pgClient");

var storeReport = async function storeReport(consolidated) {
    var text =
        "INSERT INTO hm_report_revenue(domain, report_type, llr, ctr, vcpm, avt, viewability, ad_fees, publisher_revenue, net60_revenue, admin_revenue, date_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)" +
        " ON CONFLICT (domain, report_type, date_time) DO UPDATE SET llr = $3, ctr = $4, vcpm = $5, avt = $6, viewability = $7, ad_fees = $8, publisher_revenue = $9, net60_revenue = $10, admin_revenue = $11";
    try {
        return pgdb
            .query(text, [
                consolidated.domain,
                consolidated.report_type,
                consolidated.llr,
                consolidated.ctr,
                consolidated.vcpm,
                consolidated.avt,
                consolidated.viewability,
                consolidated.ad_fees,
                consolidated.publisher_revenue,
                consolidated.net60_revenue,
                consolidated.admin_revenue,
                consolidated.date_time,
            ])
            .catch((e) => console.error(e));
    } catch (e) {
        console.log(e);
    }
};

module.exports = storeReport;
