function clientVcpmCalc(current, date_time, pivotDateTime, newPivotDateTime) {
    let vcpm = 0;
    if (
        current.gam_type == true ||
        current.prebid_type == true ||
        current.pubg_type == true ||
        current.adipolo_type == true ||
        current.revcontent_type == true
    ) {
        vcpm = vcpm + parseFloat(current.vcpm) * 0.75;
    } else if (current.net60_type == true) {
        vcpm = vcpm + parseFloat(current.vcpm) * 0.8;
    } else if (current.hmadx1_type == true || current.hmadx2_type == true) {
        vcpm = vcpm + parseFloat(current.vcpm) * 0.7;
    } else {
        if (new Date(date_time) >= pivotDateTime && new Date(date_time) <= newPivotDateTime) {
            vcpm = vcpm + parseFloat(current.vcpm) * 0.8;
        } else if (new Date(date_time) > newPivotDateTime) {
            vcpm = vcpm + parseFloat(current.vcpm) * 0.5;
        } else {
            vcpm = vcpm + parseFloat(current.vcpm) * 0.9;
        }
    }

    return vcpm;
}

module.exports = clientVcpmCalc;
