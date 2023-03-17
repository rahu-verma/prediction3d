const axios = require("axios");
const Form = require("../models/form");
const AdminReports = require("../models/adminreport");
const storeChart = require("./deployment/db/storeChart");
const storeClient = require("./deployment/db/storeClient");
const storeAdmin = require("./deployment/db/storeAdmin");
const storeReport = require("./deployment/db/storeReport");
const storeBreakdown = require("./deployment/db/storeBreakdown");
const fetchDomains = require("./deployment/db/fetchDomains");
const fetchUnits = require("./deployment/db/fetchUnits");
const fetchClient = require("./deployment/db/fetchClient");
const fetchAdminDataPerDomain = require("./deployment/db/fetchAdminDataPerDomain");
const fetchDataperDomain = require("./deployment/db/fetchDataPerDomain");
const fetchTotalDomainReport = require("./deployment/db/fetchTotalDomainReport");
const fetchDataPerDomainReport = require("./deployment/db/fetchDataPerDomainReport");
const fetchAdminEarning = require("./deployment/db/fetchAdminEarning");
const fetchClientEarning = require("./deployment/db/fetchClientEarning");
const fetchUnitBasedData = require("./deployment/db/fetchUnitBasedData");
const fetchDomainsFromUnitRevenue = require("./deployment/db/fetchDomainsFromUnitRevenue");
const clientVcpmCalc = require("./deployment/lib/clientVcpmCalc");
const clientEarningCalc = require("./deployment/lib/clientEarningCalc");
const adminEarningCalc = require("./deployment/lib/adminEarningCalc");
const primaryDeduction = require("./deployment/lib/primaryDeduction");
const secondaryDeduction = require("./deployment/lib/secondaryDeduction");
const fetchReportType = require("./deployment/lib/fetchReportType");
const pgdb = require("./deployment/db/pgClient");
const { __outputType } = require("./uploadSchema");
const fetchDataperDate = require("./deployment/db/fetchDataPerDate");
const fetchAdminDataPerDate = require("./deployment/db/fetchAdminDataPerDate");
const { Map } = require("mongodb");
const deploymentStatus = require("./deployment/deploymentStatus");
const deploySchema = require("./deploySchema");
const clean_hm_unit_revenue = require("./deployment/db/clean_hm_unit_revenue");

const pivotDateTime = new Date("2021-01-01");
const newPivotDateTime = new Date("2021-03-31");
const servingPivotDateTime = new Date("2022-05-14");
const newServingPivotDateTime = new Date("2022-07-23");

const report_types = [
    "gam_type",
    "pubg_type",
    "adipolo_type",
    "net60_type",
    "prebid_type",
    "revcontent_type",
    "hmadx1_type",
    "hmadx2_type",
    "other_type",
];

const arrayColumn = (array, column) => {
    return array.map((item) => item[column]);
};

var getDateFormated = function getDateFormated(datestring) {
    var firstDay = new Date(datestring[0]).toISOString();
    var lastDay = new Date(datestring[1]).toISOString();

    return [firstDay, lastDay];
};

var getDateFormatedTheWholeMonth = function getDateFormatedTheWholeMonth(datestring) {
    var date = new Date(datestring[0]),
        y = date.getFullYear(),
        m = date.getMonth();
    var firstDay = new Date(y, m, -1, 0, 0, 0, 0).toISOString();
    var lastDay = new Date(y, m + 1, 1, 0, 0, 0, 0).toISOString();

    return [firstDay, lastDay];
};

var getFirstNLastDates = function getFirstNLastDates(datestring) {
    var firstDay = new Date(datestring[0]).toISOString();
    var lastDay = new Date(datestring[1]).toISOString();

    return [firstDay, lastDay];
};

var getDateFormatedSql = function getDateFormatedSql(datestring) {
    var firstDay = new Date(datestring[0]).toISOString().slice(0, 10);
    var lastDay = new Date(datestring[1]).toISOString().slice(0, 10);

    return [firstDay, lastDay];
};

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getDateFormatedSqlTheWholeMonth(datestring) {
    const date = new Date(datestring[0]);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return [`${year}-${month}-01`, `${year}-${month}-${getDaysInMonth(year, month)}`];
}

var getMonthYearFormated = function getMonthYearFormated(datestring) {
    var date = new Date(datestring[0]),
        y = date.getFullYear(),
        m = date.getMonth() + 1;
    return y + "-" + String(m).padStart(2, "0") + "-" + "01";
};

function getDateMonthYearFormated(datestring) {
    return new Date(datestring).toISOString().slice(0, 10);
}

var getDates = function getDates(s, e) {
    for (var a = [], d = new Date(s); d <= new Date(e); d.setDate(d.getDate() + 1)) {
        a.push(new Date(d));
    }
    return a;
};

async function clientRevenueCalculation(dates) {
    const statusKey = `${dates[0]} => ${dates[1]}`;

    try {
        console.time(`${statusKey} Cleaning Table Junk Finished In`);
        clean_hm_unit_revenue(dates);
        console.timeEnd(`${statusKey} Cleaning Table Junk Finished In`);

        console.time(`${statusKey} Grabbing Data From Mongo Finished In`);
        let data = await fetchDataperDate(dates);

        let adminDataMap = new Map();
        for (const report of await fetchAdminDataPerDate(dates)) {
            const key = report.domain + report.date_time.toISOString();
            if (adminDataMap.has(key)) {
                adminDataMap.get(key).push(report);
                continue;
            }
            adminDataMap.set(key, [report]);
        }
        console.timeEnd(`${statusKey} Grabbing Data From Mongo Finished In`);

        console.time(`${statusKey} Client Sync Deployment Finished In`);
        let unitsData = new Map();

        for (const { domain } of data) {

            if (unitsData.has(domain)) {
                unitsData.set(domain, unitsData.get(domain) + 1);
                continue;
            }

            unitsData.set(domain, 1);
        }

        let i = 1;
        for (const current of data) {
            const { domain, _id } = current;

            let adminLlr = 0;
            let ad_fees = 0;

            const date_time = new Date(current.date_time);

            const llr = current.llr;
            const ctr =
                current.gam_type == 0 &&
                current.pubg_type == 0 &&
                current.adipolo_type == 0 &&
                current.net60_type == 0 &&
                current.prebid_type == 0 &&
                current.revcontent_type == 0 &&
                current.hmadx1_type == 0 &&
                current.hmadx2_type == 0
                    ? current.ctr * 100
                    : current.ctr;

            let vcpm = clientVcpmCalc(current, date_time, pivotDateTime, newPivotDateTime); //correct

            const admin_vcpm = undefined != current.vcpm ? current.vcpm : 0; //correct
            let earning = clientEarningCalc(current, date_time, pivotDateTime, newPivotDateTime); //correct

            const admin_earning = adminEarningCalc(current, date_time, pivotDateTime, newPivotDateTime); //correct

            const net60_revenue = current.net60_type == 1 ? Math.round(current.earning * 0.8, 2) : 0;
            const viewability = undefined != current.viewability ? current.viewability : 0;
            const report_type = fetchReportType(current);

            if (new Date(date_time) >= servingPivotDateTime) {
                vcpm -= 0.0075;
                let deduction = primaryDeduction(current, date_time, servingPivotDateTime); //correct
                ad_fees = deduction;
                earning = earning - deduction;
            }

            const avt = undefined != current.avt ? current.avt : 0;

            const adminData = adminDataMap.get(current.domain + date_time.toISOString()) || [];

            if (adminData.length > 0)
                for (const report of adminData) adminLlr = parseFloat(report.llr / (unitsData.get(domain) + 1));

            if (adminLlr > 0) {
                let second_deduction = secondaryDeduction(current, adminLlr, date_time, newServingPivotDateTime); //correct
                ad_fees += second_deduction;
                earning = earning - second_deduction;
            }

            const consolidated = {
                original_document_id: _id.toString(),
                domain: domain,
                unit: undefined != current.unit ? current.unit.replace(domain + "_", "") : '-',
                llr: llr,
                ctr: ctr,
                vcpm: vcpm,
                viewability: NaN === viewability ? 0 : parseInt(viewability),
                avt: avt,
                admin_vcpm,
                ad_fees,
                publisher_revenue: earning < 0 ? 0 : earning,
                net60_revenue,
                admin_revenue: admin_earning,
                report_type: report_type,
                date_time: new Date(date_time).toISOString().slice(0, 10),
            };

            await storeClient(consolidated);

            deploymentStatus.clientSyncStatus[statusKey] = `${i} of ${data.length}`;
            i += 1;
        }

        data = null;
        adminDataMap = null;
        unitsData = null;
        delete deploymentStatus.clientSyncStatus[statusKey];
        console.timeEnd(`${statusKey} Client Sync Deployment Finished In`);
    } catch (error) {
        console.log(error);
    }
}

async function adminRevenueCalculation(datestring) {
    try {
        const statusKey = `${datestring[0]} => ${datestring[1]}`;

        console.time(`${statusKey} Grabbing Data from Postgres Finished In`);

        let data = await fetchClient(datestring);

        console.timeEnd(`${statusKey} Grabbing Data from Postgres Finished In`);

        console.time(`${statusKey} Admin Sync Deployment Finished In`);

        let i = 1;

        for (const record of data.rows) {
            await storeAdmin(record);

            deploymentStatus.adminSyncStatus[statusKey] = `${i} of ${data.rows.length}`;
            i += 1;
        }

        data = null;
        delete deploymentStatus.adminSyncStatus[statusKey];
        console.timeEnd(`${statusKey} Admin Sync Deployment Finished In`);
    } catch (error) {
        console.log(error);
    }

    // Nirjhar Previous Code
    // try {
    //     const statusKey = `${datestring[0]} => ${datestring[1]}`;

    //     console.time(`${statusKey} Deployment Finished In`);
    //     const dates = getFirstNLastDates(datestring);

    //     console.log("dates", dates);

    //     const dateRange = getDates(dates[0], dates[1]);

    //     console.log("dateRange", dateRange);

    //     let i = 1;

    //     let allDataLength = 0;

    //     for (const domain of domains) {
    //         for (const date of dateRange) {
    //             const ymd = getDateMonthYearFormated(date);
    //             const fetch = await fetchClient(domain, ymd);
    //             console.log("ymd", ymd);
    //             const dataSet = fetch.rows;
    //             const data = dataSet[0];
    //             console.log("data", data);
    //             if (undefined != data && data.llr != null) {
    //                 data.date_time = ymd;
    //                 await storeAdmin(data);
    //             }
    //             allDataLength += fetch.rows.length;
    //         }
    //         deploymentStatus.adminSyncStatus[statusKey] = `${i} of ${domains.length}`;
    //         i += 1;
    //     }

    //     console.log("allDataLength", allDataLength);

    //     delete deploymentStatus.adminSyncStatus[statusKey];
    //     console.timeEnd(`${statusKey} Deployment Finished In`);
    // } catch (error) {
    //     console.log(error);
    // }
}

async function reportRevenueCalculation(datestring) {
    const dates = getFirstNLastDates(datestring);
    const ymd_start = getDateMonthYearFormated(dates[0]);
    const ymd_end = getDateMonthYearFormated(dates[1]);
    const statusKey = `${ymd_start} => ${ymd_end}`;

    try {
        console.time(`${statusKey} Grabbing Data From Postgres Finished In`);

        let data = await fetchUnitBasedData(ymd_start, ymd_end);

        console.timeEnd(`${statusKey} Grabbing Data From Postgres Finished In`);

        console.time(`${statusKey} Report Sync Deployment Finished In`);

        let i = 1;

        for (const record of data.rows) {
            const consolidated = {
                domain: record.domain,
                report_type: record.report_type,
                llr: record.llr,
                ctr: parseFloat(record.ctr).toFixed(2),
                vcpm: record.vcpm,
                viewability: NaN === record.viewability ? 0 : record.viewability,
                avt: record.avt,
                ad_fees: record.ad_fees,
                publisher_revenue: record.publisher_revenue,
                net60_revenue: record.net60_revenue,
                admin_revenue: record.admin_revenue,
                date_time: record.date_time,
            };

            await storeReport(consolidated);

            deploymentStatus.reportSyncStatus[statusKey] = `${i} of ${data.rows.length}`;
            i += 1;
        }

        data = null;
        delete deploymentStatus.reportSyncStatus[statusKey];
        console.timeEnd(`${statusKey} Report Sync Deployment Finished In`);
    } catch (error) {
        console.log(error);
    }
}

async function reportBreakdownCalculation(datestring) {
    const dates = getFirstNLastDates(datestring);
    const ymd_start = getDateMonthYearFormated(dates[0]);
    const ymd_end = getDateMonthYearFormated(dates[1]);
    const statusKey = `${ymd_start} => ${ymd_end}`;

    try {
        console.time(`${statusKey} Grabbing Data From Postgres Finished In`);

        let data = await fetchTotalDomainReport([ymd_start, ymd_end]);

        console.timeEnd(`${statusKey} Grabbing Data From Postgres Finished In`);

        console.time(`${statusKey} Break Down Sync Deployment Finished In`);

        let reports = {};

        for (const row of data.rows) {
            const key = row.domain + row.date_time.toISOString();
            const report_type_key = row.report_type;

            const target = reports[key];

            if (target) {
                target.ad_fees += row.ad_fees;
                target.publisher_revenue += row.publisher_revenue;
                target.admin_revenue += row.admin_revenue;
                target[report_type_key] += row.admin_revenue + row.publisher_revenue;
                continue;
            }

            const report = {
                domain: row.domain,
                ad_fees: row.ad_fees,
                publisher_revenue: row.publisher_revenue,
                admin_revenue: row.admin_revenue,
                date_time: row.date_time,
            };

            for (const report_type_original_key of report_types) report[report_type_original_key] = 0;

            report[report_type_key] = row.admin_revenue + row.publisher_revenue;

            reports[key] = report;
        }

        let i = 1;

        let reportsArray = Object.values(reports);

        for (const report of reportsArray) {
            await storeBreakdown(report);
            deploymentStatus.breakDownSyncStatus[statusKey] = `${i} of ${reportsArray.length}`;
            i += 1;
        }

        data = null;
        reports = null;
        reportsArray = null;
        delete deploymentStatus.breakDownSyncStatus[statusKey];
        console.timeEnd(`${statusKey} Break Down Sync Deployment Finished In`);
    } catch (error) {
        console.log(error);
    }
}

async function adminEarning(dateSql) {
    try {
        const fetch = await fetchAdminEarning(dateSql);
        if (!fetch?.rows) return;

        return parseFloat(fetch.rows[0]?.admin_revenue).toFixed(2);
    } catch (e) {
        console.log(e);
    }
}

async function clientEarning(dateSql, domains, monthYear) {
    const statusKey = `${dateSql[0]} => ${dateSql[1]}`;

    try {
        console.time(`${statusKey} Chart Sync Deployment Finished In`);

        let i = 1;

        for (const domain of domains) {
            const fetch = await fetchClientEarning(domain, dateSql);
            const data = fetch?.rows;

            if (!data?.length) continue;

            await storeChart({
                domain: domain,
                month_year: monthYear,
                admin_revenue: data[0].admin_revenue == null ? 0 : parseFloat(data[0].admin_revenue).toFixed(2),
                publisher_revenue:
                    data[0].publisher_revenue == null ? 0 : parseFloat(data[0].publisher_revenue).toFixed(2),
            });

            deploymentStatus.chartSyncStatus[statusKey] = `${i} of ${domains.length}`;
            i += 1;
        }
        delete deploymentStatus.chartSyncStatus[statusKey];
        console.timeEnd(`${statusKey} Chart Sync Deployment Finished In`);
    } catch (e) {
        console.log(e);
    }
}

// var clientRevenueTable = async function clientRevenueTable(domains, dateMonthYear) {
//     return clientRevenueCalculation(domains, dateMonthYear);
// };

async function clientRevenueTable(dates) {
    return clientRevenueCalculation(dates);
}

async function adminRevenueTable(datestring) {
    return adminRevenueCalculation(datestring);
}

async function chartRevenueTable(domains, datestring) {
    const dateSql = getDateFormatedSqlTheWholeMonth(datestring);
    const monthYear = getMonthYearFormated(datestring);

    const admin_earning = await adminEarning(dateSql);

    await storeChart({
        domain: "ADMIN",
        month_year: monthYear,
        admin_revenue: admin_earning,
        publisher_revenue: 0,
    });

    await clientEarning(dateSql, domains, monthYear);
}

async function reportRevenueTable(datestring) {
    reportRevenueCalculation(datestring);
}

async function reportBreakdownTable(datestring) {
    reportBreakdownCalculation(datestring);
}

async function clientDeployment(datestring) {
    clientRevenueTable(datestring);
}

async function adminDeployment(datestring) {
    adminRevenueTable(datestring);
}

async function chartDeployment(datestring) {
    const allDomains = await fetchDomains(getDateFormatedTheWholeMonth(datestring));

    chartRevenueTable(allDomains, datestring);

    return allDomains;
}

async function reportDeployment(datestring) {
    reportRevenueTable(datestring);
}

async function breakdownDeployment(datestring) {
    reportBreakdownTable(datestring);
}

async function deployment(type, dateString) {
    try {
        if (type.client == 1) return clientDeployment(dateString);
        if (type.admin == 1) return adminDeployment(dateString);
        if (type.chart == 1) return chartDeployment(dateString);
        if (type.report == 1) return reportDeployment(dateString);
        if (type.breakdown == 1) return breakdownDeployment(dateString);
    } catch (e) {
        console.log(e);
    }
}

module.exports = deployment;
