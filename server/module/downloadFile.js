var fs      = require("fs");
var gunzip  = require("gunzip-file");
const Axios = require('axios');
const path  = require('path');

var downloadDest = path.join(__dirname, '..', '..', '/build/file.csv.gz');
var extractDest = path.join(__dirname, '..', '..', '/build/file.csv');


// Extracting Zip File Here
// =====================================
async function extract(filePath, extractDest) {
  return new Promise((resolve, reject) => {
      gunzip(filePath, extractDest, () => {
        console.log('Extraction done!');
        //fs.readFile(extractDest, 'utf8', (err, file) => {
          //if (err) reject(err)
          //resolve(file)
        //});
      });
  }).catch((e) => console.log( 'Process Failed to extract: ' + e ));
}


var downloadFile = async function downloadFile(url) {
  const response = await Axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  try {
    response.data.pipe(fs.createWriteStream(downloadDest));
  } catch (e) {
    console.log( 'Download error: ' + e );
  }

  return new Promise((resolve, reject) => {
    if(response.headers['content-type'].indexOf('gzip') != -1) {
      response.data.on('end', () => {
        console.log('File Downloaded!');
        try {
          var file = extract(downloadDest, extractDest);
          resolve(file);
        } catch (e) {
          console.log('Gunzip error: ' + e);
        }
      })
    }
  }).catch((e) => console.log( 'Process Failed to extract: ' + e ));
}


module.exports = downloadFile;
