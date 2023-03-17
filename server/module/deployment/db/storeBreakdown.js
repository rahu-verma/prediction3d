const pgdb = require("./pgClient");

var storeBreakdown = async function storeBreakdown(consolidated) {
    var text = `INSERT INTO hm_breakdown_revenue(domain, pubg_type, adipolo_type, hmadx1_type, hmadx2_type, revcontent_type, prebid_type, gam_type, net60_type, other_type, ad_fees, publisher_revenue, admin_revenue, date_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (domain, date_time) DO UPDATE SET pubg_type = $2, adipolo_type = $3, hmadx1_type = $4, hmadx2_type = $5, revcontent_type = $6, prebid_type = $7, gam_type = $8, net60_type = $9, other_type = $10, ad_fees = $11, publisher_revenue = $12, admin_revenue = $13;
        `;
    try {
        return pgdb.query(text, [
            consolidated.domain,
            consolidated.pubg_type,
            consolidated.adipolo_type,
            consolidated.hmadx1_type,
            consolidated.hmadx2_type,
            consolidated.revcontent_type,
            consolidated.prebid_type,
            consolidated.gam_type,
            consolidated.net60_type,
            consolidated.other_type,
            consolidated.ad_fees,
            consolidated.publisher_revenue,
            consolidated.admin_revenue,
            consolidated.date_time,
        ]);
    } catch (e) {
        console.log(e);
    }
};

module.exports = storeBreakdown;
