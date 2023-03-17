function primaryDeduction(current, date_time, servingPivotDateTime) {
    let = deduction = 0;

    deduction = parseFloat((0.0075 * current.llr) / 1000);

    return deduction;
}

module.exports = primaryDeduction;
