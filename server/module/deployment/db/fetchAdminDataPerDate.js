const AdminReports = require("../../../models/adminreport");

async function fetchAdminDataPerDate(dates) {
    try {
        return AdminReports.find({
            date_time: {
                $gte: dates[0],
                $lte: dates[1],
            },
        });
    } catch (error) {
        console.log("failed inside fetchAdminDataPerDomain", error);
    }
}

module.exports = fetchAdminDataPerDate;
