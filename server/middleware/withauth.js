const jwt    = require('jsonwebtoken');
const dotenv = require('dotenv');
const path   = require("path");

dotenv.config({path: path.join(__dirname, '..', '..', '.env')});
const secret = process.env.JSON_SECRET;

const withAuth = function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided. Login or Register first.');
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token. Retry.');
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
}

module.exports = withAuth;
