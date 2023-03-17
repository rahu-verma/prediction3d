function fetchReportType(current) {
    let report_type = "";

    if (current.gam_type == true) report_type = "gam_type";
    else if (current.prebid_type == true) report_type = "prebid_type";
    else if (current.pubg_type == true) report_type = "pubg_type";
    else if (current.adipolo_type == true) report_type = "adipolo_type";
    else if (current.revcontent_type == true) report_type = "revcontent_type";
    else if (current.hmadx1_type == true) report_type = "hmadx1_type";
    else if (current.hmadx2_type == true) report_type = "hmadx2_type";
    else report_type = "NOT DEFINED";

    return report_type;
}

module.exports = fetchReportType;
