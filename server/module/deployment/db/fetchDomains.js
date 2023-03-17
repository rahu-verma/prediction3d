const Form = require("../../../models/form");

var fetchDomains = async function fetchDomains(dates) {
    try {
        return Form.distinct("domain", {
            date_time: {
                $gte: dates[0],
                $lte: dates[1],
            },
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = fetchDomains;
