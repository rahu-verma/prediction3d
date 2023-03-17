const axios       = require('axios');
const fetch       = require('node-fetch');
const path  			= require('path');
const fs 					= require("fs");

const csvJSON     = require('./csvtojson');
const Form        = require("../models/form");
const { Headers } = fetch;
const extractDest = path.join(__dirname, '..', '..', '/build/file.csv');

const widgets     = [
		                 {
                       id: 220328, name: 'MPU_300_250',
                     },
                     {
                       id: 220329, name: 'Billboard_970_90',
                     },
                     {
                       id: 220331, name: 'Billboard_970_250',
                     },
                     {
                       id: 220332, name: 'Leaderboard_728_90',
                     },
                     {
                       id: 220333, name: 'Mobile_Leaderboard_320_50',
                     },
                     {
                       id: 220334, name: 'Mobile_Leaderboard_300_50',
                     },
                     {
                       id: 220335, name: 'HPU_300_600',
                     },
                     {
                       id: 220336, name: 'Skyscraper_160_600',
                     },
                     {
                       id: 220337, name: 'Skyscraper_120_600',
                     },
                     {
                       id: 220338, name: 'MPU_336_280',
                     },
                     {
                       id: 220339, name: 'MPU_250_250'
                     },
                    ];


const arrayColumn = (array, column) => {
    return array.map(item => item[column]);
};


var fetchAccessToken = async function fetchAccessToken() {

  var myHeaders = new fetch.Headers({
    "Content-type": "application/x-www-form-urlencoded"
  });

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", process.env.REVCONTENT_GRANT_TYPE);
  urlencoded.append("client_id", process.env.REVCONTENT_CLIENT_ID);
  urlencoded.append("client_secret", process.env.REVCONTENT_CLIENT_SECRET);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  const access_token =
    await fetch("https://api.revcontent.io/oauth/token", requestOptions)
      .then(response => response.text())
      .then(function(result) {
        var access_token = JSON.parse(result).access_token;
        return access_token;
      })
      .catch(error => console.log("Can't get RevContent API Access token:", error));

  return access_token;
}


var fetchCsvUrl = async function fetchCsvUrl(access_token, widget, datestring) {

  var myHeaders = new fetch.Headers({
    "Authorization": "Bearer " + access_token,
    "Content-type": "application/type"
  });

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  var csv_string = false;
  try {
    csv_string =
      await fetch("https://api.revcontent.io/stats/api/v1.0/widgets/" + widget + "/revsub?date=" + datestring, requestOptions)
        .then(response => Promise.resolve(response.text()))
        .then(function(result) {
          if (result != undefined) {
            return JSON.parse(result).data;
          }
        });
  } catch (error) {
    console.log("Can't get RevContent API CSV file:", error);
  }

  return csv_string;
}


var revcontentApi = async function revcontentApi(datestr) {

	const datestring = datestr;
  //Get csv urls using access token
  await fetchAccessToken().then( async access_token => {

    var fetch_csv_urls = {};

    var promise = new Promise(function(resolve, reject){
      widgets.forEach( async (widget, i) => {
        let urls = await fetchCsvUrl(access_token, widget.id, datestring);
        fetch_csv_urls = {...fetch_csv_urls, ...urls};
        resolve(fetch_csv_urls);
      });
    });

    promise.then( async fetch_csv_urls => {

      if (Object.keys(fetch_csv_urls).length == 0) {
        console.log("No Revcontent CSV URL found");
        return false;
      }

      //Make consolidated data from the URLs
      var new_promise = new Promise(function(resolve, reject) {
        Object.entries(fetch_csv_urls).forEach(async (url, i) => {

					var readyToStore = [];
					try {
						var csv = new Promise(async function(resolve, reject) {
							try {
								var axios = require('axios');
								var config = {
  								method: 'post',
  								url: 'https://faas-blr1-8177d592.doserverless.co/api/v1/namespaces/fn-f2129985-7baf-4f5e-b82a-bde75e5d07be/actions/Revcontent-API?result=true&blocking=true',
  								headers: {
    								'Content-Type': 'application/json',
    								'Authorization': 'Basic ZTA3ZjVlNTMtZGY2ZS00OTRkLWJhNjAtZDliYmZlNTM0YjU3OjNjTkp4bUpaYkFoM1h2TFVqa0pUekwyR0U3NUZGZzdUc2pVT1oxbnpwNFZ5ajA3ckFRaEZwQ2xlYUt5a05obzI='
  								},
  								data : JSON.stringify({
	  								"url": url[1]
									})
								};
								axios(config)
									.then(function (response) {
  									resolve(response.data);
									})
									.catch(function (error) {
  									console.log(error);
									});
							} catch (e) {
								console.log('File couldn\'t be downloaded ' + e);
							}
		      	}).then(csv => {
			        var consolidated = [];
							if (undefined != csv) {
								let jsonObj = csvJSON(csv.body + '');
		            jsonObj.forEach((item, i) => {

		              //Get name of widget
		              var widget = widgets.find(element => (element.id == item.widget_id));
									if (widget != undefined) {
										let data = {
			                domain  : item.sub_id_value.toString().toLowerCase(),
			                unit    : widget.name,
			                llr     : item.widget_imps,
			                ctr     : item.ad_ctr,
			                vcpm    : item.ad_cpc,
			                earning : item.ad_revenue
			              };
			              consolidated.push(data);
									}
		            });

				        //Get domains and units
				        const domains = arrayColumn(consolidated, 'domain');
				        const units = arrayColumn(consolidated, 'unit');
				        domains.forEach((domain, i) => {
				          units.forEach((unit, i) => {
				            var llr = earning = ctr = vcpm = count = 0;
				            consolidated.forEach((data, i) => {
				              if (data.domain == domain && data.unit == unit) {
				                llr     += data['llr'];
				                earning += data['earning'];
				                ctr     += data['ctr'];
				                vcpm    += data['vcpm'];
				                count++;
				              }
				            });

				            let store = {
				              domain          : domain,
				              unit            : domain + '_' + unit,
				              llr             : parseInt(llr),
				              ctr             : (count > 0 ? parseFloat(parseFloat(ctr)/count).toFixed(2) : 0 ),
				              vcpm            : (count > 0 ? parseFloat(parseFloat(vcpm)/count).toFixed(2) : 0 ),
				              earning         : parseFloat(earning),
				              avt             : 0,
				              viewability     : 0,
				              revcontent_type : 1,
				              date_time       : datestring
				            };
										readyToStore.push(store);
				          });
				        });
								resolve(readyToStore);
							}
						}).catch((e) => console.log(e));
					} catch (e) {
						console.log('error', e)
					}

        });
      }).then((readyToStore) => {
				try {
					Form.deleteMany({
						revcontent_type : true,
						date_time       : datestring
					}).then((doc) => {
						Form.insertMany( readyToStore, function(err,obj) {
							if (err) {
								console.log(err);
							}
							console.log(obj);
						});
					});
				} catch (e) {
					console.log(e);
				}
			}).catch((e) => console.log(e));
    });
	});

}


module.exports = revcontentApi;
