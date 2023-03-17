const pgdb = require("./pgClient");

var storeClient = async function storeClient(consolidated) {
    const text = `
                    INSERT INTO hm_unit_revenue(domain, unit, llr, ctr, vcpm, avt, viewability, admin_vcpm, ad_fees, publisher_revenue, net60_revenue, admin_revenue, report_type, date_time, original_document_id) 
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
                    ON CONFLICT (original_document_id) 
                    DO UPDATE SET 
                    domain = EXCLUDED.domain,
                    unit = EXCLUDED.unit,
                    llr = EXCLUDED.llr,
                    ctr = EXCLUDED.ctr,
                    vcpm = EXCLUDED.vcpm,
                    avt = EXCLUDED.avt,
                    viewability = EXCLUDED.viewability,
                    admin_vcpm = EXCLUDED.admin_vcpm,
                    ad_fees = EXCLUDED.ad_fees,
                    publisher_revenue = EXCLUDED.publisher_revenue,
                    net60_revenue = EXCLUDED.net60_revenue,
                    admin_revenue = EXCLUDED.admin_revenue,
                    report_type = EXCLUDED.report_type,
                    date_time = EXCLUDED.date_time;
                `;
    try {
        await pgdb.query(text, [
            consolidated.domain,
            consolidated.unit,
            consolidated.llr,
            consolidated.ctr,
            consolidated.vcpm,
            consolidated.avt,
            consolidated.viewability,
            consolidated.admin_vcpm,
            consolidated.ad_fees,
            consolidated.publisher_revenue,
            consolidated.net60_revenue,
            consolidated.admin_revenue,
            consolidated.report_type,
            consolidated.date_time,
            consolidated.original_document_id,
        ]);
    } catch (e) {
        console.log(e);
    }
};

module.exports = storeClient;
