var csvJSON = function csvtoJson(csvStr, net60_type){
  var lines=csvStr.split("\n");
  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

      var obj = {};
      var currentline=lines[i].split(",");

      for(var j=0;j<headers.length;j++){
          if (
            headers[j].indexOf('Domain') != -1
          ) {
            headers[j] = 'domain';
          }
          if (
            headers[j].indexOf('Ad unit') != -1
            || headers[j].indexOf('UNIT') != -1
          ) {
            headers[j] = 'unit';
          }
          if (
            headers[j].indexOf('Ad Exchange impressions') != -1
            || headers[j].indexOf('Total impressions') != -1
            || headers[j].indexOf('Impressions') != -1
            || headers[j].indexOf('IMPRESSIONS') != -1
            || headers[j].indexOf('Unfilled impressions') != -1
          ) {
            headers[j] = 'llr';
          }
          if (
            headers[j].indexOf('Ad Exchange CTR') != -1
            || headers[j].indexOf('Total CTR') != -1
            || headers[j].indexOf('RTR') != -1
            || headers[j].indexOf('CTR') != -1
          ) {
            headers[j] = 'ctr';
          }
          if (
            headers[j].indexOf('Ad Exchange revenue ($)') != -1
            || headers[j].indexOf('Total CPM and CPC revenue ($)') != -1
            || headers[j].indexOf('Estimated Revenue') != -1
            || headers[j].indexOf('Revenue') != -1
            || headers[j].indexOf('EARNINGS') != -1
          ) {
            headers[j] = 'earning';
          }
          if (
            headers[j].indexOf('Ad Exchange average eCPM ($)') != -1
            || headers[j].indexOf('Total average eCPM ($)') != -1
            || headers[j].indexOf('CPM') != -1
            || headers[j].indexOf('vCPM') != -1
          ) {
            headers[j] = 'vcpm';
          }
          if (
            headers[j].indexOf('Ad Exchange Active View % viewable impressions') != -1
            || headers[j].indexOf('Viewability') != -1
            || headers[j].indexOf('VIEWABILITY') != -1
          ) {
            headers[j] = 'viewability';
          }

          //net60 special opertaion for domain
          if (net60_type) {
            var unit = headers[j].split(" - ");
            var domain = unit[1].toLowerCase() + '.com';
            switch (domain) {
              case 'quizexpo':
				          domain = 'quizexpo.coms';
				          break;

			        case 'quizpin':
				          domain = 'quizpin.com';
				          break;
		        }
            if (headers[j] == 'unit') {
              currentline[j] = unit;
            }
            if (headers[j] == 'domain') {
              currentline[j] = domain;
            }
          }

          if (headers[j] != undefined) {
            obj[headers[j]] = currentline[j] == undefined || currentline[j] == "NaN" || currentline[j] == '' ? 0 : currentline[j];
          }
      }

      result.push(obj);

      result.forEach((item, i) => {
        if (item.domain == '') {
          result.splice(i, 1);
        }
      });

  }
  return result; //JavaScript object
}

module.exports = csvJSON;
