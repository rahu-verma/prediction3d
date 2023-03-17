const yup = require("yup");

let adminReportsSchema = yup.object().shape({
  url           : yup.string().url().required(),
  unfilled_type : yup.string(),
  house_ads_type: yup.string(),
  date          : yup.date().required()
});

module.exports = adminReportsSchema;
