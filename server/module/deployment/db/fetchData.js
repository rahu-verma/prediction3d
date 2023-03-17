const Form       = require("../../../models/form");


var fetchData = async function fetchData(dates) {

	return new Promise((resolve, reject) => {
		try {
			Form.find({
        date_time: {
          $gte: dates[0],
          $lte: dates[1]
        }
			}, (err, data) => err ? console.log(err) : resolve(data));
		} catch (e) {
			console.log(e)
		}
	});
}

module.exports = fetchData;
