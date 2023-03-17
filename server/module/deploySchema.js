const yup = require("yup");

let deploySchema = yup.object().shape({
  date: yup.array().required()
});

module.exports = deploySchema;
