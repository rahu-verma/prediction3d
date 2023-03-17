function secondaryDeduction(current, adminLlr, date_time, servingPivotDateTime) {
    let deduction = 0;

    if (new Date(date_time) >= servingPivotDateTime) {
        var totalLlr = current.llr + adminLlr;
        deduction = parseFloat((0.02 * totalLlr) / 1000);
    }

    if (isNaN(deduction)) deduction = 0;

    return deduction;
}

module.exports = secondaryDeduction;
