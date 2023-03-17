const AdminReports = require("../../../models/adminreport");

async function fetchAdminDataPerDomain(date, domain) {
    try {
        return AdminReports.find({
            domain: {
                $eq: domain,
            },
            date_time: {
                $eq: date,
            },
        });
    } catch (error) {
        console.log("failed inside fetchAdminDataPerDomain", error);
    }
}

module.exports = fetchAdminDataPerDomain;

/*
[
	{
		$group: {
			_id: { name: "$domain" },
			llr: { $sum: "$llr" },
			count: { $sum: 1 }
		}
	}, {
	$project: {
		_id: "$_id",
		llr: {
			$cond:
				[{
					$eq: [ "$domain", domain ],
				},{
					$eq: [ "$date_time", date ],
				}, "Not Found"]
			}
	}
}]
*/
