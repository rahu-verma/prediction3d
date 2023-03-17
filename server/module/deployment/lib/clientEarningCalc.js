function clientEarningCalc(current, date_time, pivotDateTime, newPivotDateTime) {
    let earning = 0;

    if (
        current.gam_type == true ||
        current.prebid_type == true ||
        current.pubg_type == true ||
        current.adipolo_type == true ||
        current.revcontent_type == true
    ) {
        earning += Math.round(current.earning * 0.75, 2);
    } else if (current.hmadx1_type == true || current.hmadx2_type == true) {
        earning += Math.round(current.earning * 0.7, 2);
    } else {
        if (new Date(date_time) >= pivotDateTime && new Date(date_time) <= newPivotDateTime) {
            earning += parseFloat(current.earning) * 0.8;
        } else if (new Date(date_time) > newPivotDateTime) {
            earning += parseFloat(current.earning) * 0.5;
        } else {
            earning += parseFloat(current.earning) * 0.9;
        }
    }

    return earning;
}

module.exports = clientEarningCalc;
