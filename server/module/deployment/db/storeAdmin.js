const pgdb = require("./pgClient");

var storeAdmin = async function storeAdmin(consolidated) {

  var text = "INSERT INTO hm_domain_revenue(domain, llr, ctr, vcpm, avt, viewability, admin_vcpm, ad_fees, publisher_revenue, net60_revenue, admin_revenue, date_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
             + " ON CONFLICT (domain, date_time) DO UPDATE SET llr = $2, ctr = $3, vcpm = $4, avt = $5, viewability = $6, admin_vcpm = $7, ad_fees = $8, publisher_revenue = $9, net60_revenue = $10, admin_revenue = $11";
  try {
    return pgdb.query(text, [consolidated.domain, consolidated.llr, consolidated.ctr, consolidated.vcpm, consolidated.avt, consolidated.viewability, consolidated.admin_vcpm, consolidated.ad_fees, consolidated.publisher_revenue, consolidated.net60_revenue, consolidated.admin_revenue, consolidated.date_time])
        .catch(e => console.error(e));
  } catch (e) {
    console.log(e);
  }
}

module.exports = storeAdmin;
