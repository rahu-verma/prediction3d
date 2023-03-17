//Requiring mongoose package
const mongoose = require("mongoose");
const Any = mongoose.Schema({ any: {} });


// Schema
var formSchema = new mongoose.Schema({
    domain          : String,
    unit            : String,
    llr             : Number,
    ctr             : Number,
    vcpm            : Number,
    earning         : Number,
    avt             : Number,
    viewability     : Number,
    gam_type        : Boolean,
    pubg_type       : Boolean,
    net60_type      : Boolean,
    prebid_type     : Boolean,
    revcontent_type : Boolean,
    hmadx1_type     : Boolean,
    hmadx2_type     : Boolean,
    date_time       : Date
});

module.exports = mongoose.model( "Data", formSchema );
