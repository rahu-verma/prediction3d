const yup = require("yup");

let uploadSchema = yup.object().shape({
  url             : yup.string().url().required(),
  gam_type        : yup.string(),
  pubg_type       : yup.string(),
  net60_type      : yup.string(),
  prebid_type     : yup.string(),
  hmadx1_type     : yup.string(),
  hmadx2_type     : yup.string(),
  date            : yup.date().required()
});

module.exports = uploadSchema;
