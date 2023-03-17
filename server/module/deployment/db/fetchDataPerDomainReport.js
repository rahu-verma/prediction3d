const Form     = require("../../../models/form");


var fetchDataPerDomainReport = async function fetchDataPerDomainReport(date, domain, report) {

	return new Promise((resolve, reject) => {
		try {
			var get =
      Form.find(
        {
          $and:
          [{
            domain: {
              $eq: domain
            },
          },
					{
						[report]: {
							$eq: true
						}
					},
          {
            date_time: {
              $eq: date
            }
          }]
        }, (err, data) => err ? console.log(err) : resolve(data));
		} catch (e) {
			console.log(e)
		}
	});
}

module.exports = fetchDataPerDomainReport;
