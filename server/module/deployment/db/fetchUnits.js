const Form = require("../../../models/form");

var fetchUnits = async function fetchUnits(dates, domain) {
    try {
        return Form.distinct("unit", {
            $and: [
                {
                    domain: {
                        $eq: domain,
                    },
                },
                {
                    date_time: {
                        $gte: dates[0],
                        $lte: dates[1],
                    },
                },
            ],
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = fetchUnits;
