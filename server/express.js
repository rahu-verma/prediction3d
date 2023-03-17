//Dependencies
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const createError = require("http-errors");
const httpProxy = require("http-proxy");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const csrf = require("csurf");
var { randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");
const csvJSON = require("./module/csvtojson");
const deployment = require("./module/deployment");
const revcontetApi = require("./module/revcontentApi");
const uploadSchema = require("./module/uploadSchema");
const userSchema = require("./module/userSchema");
const deploySchema = require("./module/deploySchema");
const adminReportsSchema = require("./module/adminReportsSchema");
const revcontentSchema = require("./module/revcontentSchema");
const withAuth = require("./middleware/withauth");
const Form = require("./models/form");
const AdminReports = require("./models/adminreport");
const User = require("./models/user");
const deploymentStatus = require("./module/deployment/deploymentStatus");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const secret = process.env.JSON_SECRET;

//Declare server
const app = express();
const csrfProtection = csrf({ cookie: true });

//Cors
app.use(function (req, res, next) {
    var whitelist = ["http://127.0.0.1:9000", "http://localhost:9000", "http://data.hooliganmedia.com"];
    var host = req.get("host");

    whitelist.forEach(function (val, key) {
        if (host.indexOf(val) > -1) {
            res.setHeader("Access-Control-Allow-Origin", host);
        }
    });
    next();
});

//Connect DB
//const db_url = process.env.DEVELOPMENT_DATABASE_URL;
const db_url = process.env.PRODUCTION_DATABASE_URL;

mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//Middlewares
app.use(session({ resave: true, secret: "123456", saveUninitialized: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));
//app.use(csrfProtection);

//Routers
app.get("/", function (req, res, next) {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.get("/uploader", function (req, res, next) {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.get("/result", function (req, res, next) {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.get("/login", function (req, res, next) {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.get("/failure", function (req, res, next) {
    res.status(200).send("Upload or Sync Failed. Please go back and retry.");
});

app.get("/getCSRFToken", [withAuth, csrfProtection], (req, res) => {
    res.json({ CSRFToken: req.csrfToken() });
});

app.get("/test", withAuth, function (req, res, next) {
    res.status(200).send("API is Working");
});

app.post("/api/register", async function (req, res) {
    if (req.body.security != process.env.RESGISTER_SECURITY_CODE) {
        return res.status(400).json({ error: "Insecure request" });
    }

    const data = {
        email: req.body.email,
        password: req.body.password,
        active: 1,
        date_time: new Date().toISOString(),
    };
    //Validate input
    if (!(await userSchema.isValid(data))) {
        return res.status(400).json({ error: "validation fails" });
    }
    //Save user
    try {
        User.create(data, function (err, obj) {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: "Internal error please try again",
                });
            } else {
                res.status(200).json({ success: "User created" });
            }
        });
    } catch (err) {
        res.json({ message: err });
    }
});

app.post("/api/authenticate", function (req, res) {
    const { email, password } = req.body;
    User.findOne({ email }, function (err, user) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal error please try again" });
        } else if (!user) {
            res.status(401).json({ error: "Incorrect email or password" });
        } else {
            user.isCorrectPassword(password, function (err, same) {
                if (err) {
                    res.status(500).json({
                        error: "Internal error please try again",
                    });
                } else if (!same) {
                    res.status(401).json({
                        error: "Incorrect email or password",
                    });
                } else {
                    // Issue token
                    const payload = { email };
                    const token = jwt.sign(payload, secret, {
                        expiresIn: "1h",
                    });
                    res.cookie("token", token, { httpOnly: true }).sendStatus(200);
                }
            });
        }
    });
});

app.get("/logout", withAuth, function (req, res, next) {
    res.cookie("token", "none", { httpOnly: true });
    res.status(200).send("Goodbye!! See you again.");
});

app.get("/checkToken", withAuth, function (req, res) {
    res.sendStatus(200);
});

app.post("/upload", [withAuth, csrfProtection], function (req, res) {
    try {
        //Validate input
        uploadSchema
            .isValid({
                url: req.body.hm_file_url,
                gam_type: req.body.gam_type,
                pubg_type: req.body.pubg_type,
                net60_type: req.body.net60_type,
                prebid_type: req.body.prebid_type,
                hmadx1_type: req.body.hmadx1_type,
                hmadx2_type: req.body.hmadx2_type,
                date: req.body.hm_date,
            })
            .then(async function (valid) {
                const url = req.body.hm_file_url;
                const gam_type = req.body.gam_type;
                const pubg_type = req.body.pubg_type;
                const net60_type = req.body.net60_type;
                const prebid_type = req.body.prebid_type;
                const hmadx1_type = req.body.hmadx1_type;
                const hmadx2_type = req.body.hmadx2_type;
                const dateString = new Date(req.body.hm_date).toISOString().slice(0, 10);

                if (
                    undefined != url &&
                    null != url &&
                    "" != url &&
                    undefined != dateString &&
                    null != dateString &&
                    "" != dateString
                ) {
                    //Get and format uploaded file
                    const response = await axios.get(url, {
                        responseType: "blob",
                    });
                    const jsonObj = csvJSON(response.data, net60_type);
                    //Delete that existing data
                    Form.deleteMany({
                        gam_type: gam_type,
                        pubg_type: pubg_type,
                        net60_type: net60_type,
                        prebid_type: prebid_type,
                        hmadx1_type: hmadx1_type,
                        hmadx2_type: hmadx2_type,
                        date_time: dateString,
                    }).then((doc) => {
                        console.log("Data was deleted.");
                        //Loop through data rows
                        jsonObj.forEach((item, i) => {
                            obj = {
                                ...item,
                                ...{ gam_type: gam_type },
                                ...{ pubg_type: pubg_type },
                                ...{ net60_type: net60_type },
                                ...{ prebid_type: prebid_type },
                                ...{ hmadx1_type: hmadx1_type },
                                ...{ hmadx2_type: hmadx2_type },
                                ...{ date_time: dateString },
                            };
                            //Insert data to DB
                            Form.create(obj, function (err, obj) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    });
                    res.redirect("/uploader");
                } else {
                    res.redirect("/failure");
                }
            });
    } catch (err) {
        res.json({ message: err });
    }
});

app.post("/revcontent", [withAuth, csrfProtection], function (req, res) {
    try {
        //Validate input
        revcontentSchema.isValid().then(async function (valid) {
            const dateString = new Date(req.body.hm_date).toISOString().slice(0, 10);
            if (undefined != dateString && null != dateString && "" != dateString) {
                await revcontetApi(dateString);
                res.redirect("/uploader");
            } else {
                res.redirect("/failure");
            }
        });
    } catch (err) {
        res.json({ message: err });
    }
});

app.post("/admin-reports", [withAuth, csrfProtection], function (req, res) {
    try {
        //Validate input
        adminReportsSchema
            .isValid({
                url: req.body.hm_admin_file_url,
                unfilled_type: req.body.unfilled_type,
                house_ads_type: req.body.house_ads_type,
                date: req.body.hm_date,
            })
            .then(async function (valid) {
                const url = req.body.hm_admin_file_url;
                const unfilled_type = req.body.unfilled_type;
                const house_ads_type = req.body.house_ads_type;
                const dateString = new Date(req.body.hm_date).toISOString().slice(0, 10);
                if (undefined != dateString && null != dateString && "" != dateString) {
                    const response = await axios.get(url, {
                        responseType: "blob",
                    });
                    const jsonObj = csvJSON(response.data, false);
                    //Delete that existing data
                    AdminReports.deleteMany({
                        unfilled_type: unfilled_type,
                        house_ads_type: house_ads_type,
                        date_time: dateString,
                    }).then((doc) => {
                        console.log("Data was deleted.");
                        //Loop through data rows
                        jsonObj.forEach((item, i) => {
                            obj = {
                                ...item,
                                ...{ unfilled_type: unfilled_type },
                                ...{ house_ads_type: house_ads_type },
                                ...{ date_time: dateString },
                            };
                            //Insert data to DB
                            AdminReports.create(obj, function (err, obj) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(obj);
                                }
                            });
                        });
                    });
                    res.redirect("/uploader");
                } else {
                    res.redirect("/failure");
                }
            });
    } catch (err) {
        res.json({ message: err });
    }
});

// TODO: Should be deleted after Fixing everything
// app.get("/deploy-test", async (req, res) => {
//     try {
//         const time = ["2022-09-01", "2022-09-15"];
//         const data = await deployment(req.body, time);

//         return res.status(200).json(data);
//     } catch (error) {
//         console.log(error);
//     }
// });

app.post("/deploy", [withAuth, csrfProtection], async function (req, res) {
    try {
        deploySchema
            .isValid({
                date: req.body["hm_date[]"],
            })
            .then(async function (valid) {
                const dates = req.body["hm_date[]"];

                const dateString = [
                    new Date(dates[0]).toISOString().slice(0, 10),
                    new Date(dates[1]).toISOString().slice(0, 10),
                ];

                console.log(dateString);

                if (undefined != dateString && null != dateString && "" != dateString) {
                    try {
                        await deployment(req.body, dateString);
                    } catch (e) {
                        console.log(e);
                    }

                    res.redirect("/uploader");
                } else {
                    res.redirect("/failure");
                }
            });
    } catch (err) {
        res.json({ message: err });
    }
});

app.get("/deploymentStatus", (_, res) => res.status(200).json(deploymentStatus));

app.get("/deploymentStatus/:deploymentType", (req, res) => {
    const { deploymentType } = req.params;

    if (deploymentStatus[deploymentType]) return res.status(200).json(deploymentStatus[deploymentType]);

    return res.status(200).json(deploymentStatus);
});

//Run thge server
const port = process.env.PORT || 9000;
app.listen(port);
console.log("App is listening on port " + port);
