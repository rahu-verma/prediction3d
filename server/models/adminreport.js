//Requiring mongoose package
const mongoose = require("mongoose");

// Schema
var formSchema = new mongoose.Schema({
    domain          : String,
    unit            : String,
    llr             : Number,
    unfilled_type   : Boolean,
    house_ads_type  : Boolean,
    date_time       : Date
});

module.exports = mongoose.model( "AdminReports", formSchema );
