const Form = require("../../../models/form");

async function fetchDataPerDate(dates) {
    try {
        return await Form.find({
            date_time: {
                $gte: dates[0],
                $lte: dates[1],
            },
        });
    } catch (e) {
        console.log(e);
    }
}

module.exports = fetchDataPerDate;
