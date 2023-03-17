function adminEarningCalc(current, date_time, pivotDateTime, newPivotDateTime) {
    let earning = 0;
    if (current.gam_type == true || current.prebid_type == true) {
        earning += parseFloat(current.earning) * 0.05;
    } else if (current.pubg_type == true || current.adipolo_type == true) {
        earning += parseFloat(current.earning) * 0.1;
    } else if (current.revcontent_type == true) {
        earning += parseFloat(current.earning) * 0.25;
    } else if (current.hmadx1_type == true || current.hmadx2_type == true) {
        earning += parseFloat(current.earning) * 0.15;
    } else {
        if (new Date(date_time) >= pivotDateTime && new Date(date_time) <= newPivotDateTime) {
            earning += parseFloat(current.earning) * 0.2;
        } else if (new Date(date_time) > newPivotDateTime) {
            earning += parseFloat(current.earning) * 0.5;
        } else {
            earning += parseFloat(current.earning) * 0.1;
        }
    }

    return earning;
}

module.exports = adminEarningCalc;
