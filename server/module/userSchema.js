const yup = require("yup");

let userSchema = yup.object().shape({
  email     : yup.string().email().required(),
  password  : yup.string().required(),
  active    : yup.number(),
  date_time : yup.string()
});

module.exports = userSchema;
