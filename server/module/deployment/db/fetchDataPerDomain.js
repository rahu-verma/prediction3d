const Form = require("../../../models/form");

var fetchDataperDomain = async function fetchDataperDomain(dates, domain) {
    try {
        return await Form.find({
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
    } catch (e) {
        console.log(e);
    }
};

module.exports = fetchDataperDomain;
