const yup = require("yup");

let revcontentSchema = yup.object().shape({
  date            : yup.date().required()
});

module.exports = revcontentSchema;
