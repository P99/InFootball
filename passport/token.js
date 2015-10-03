var jwt = require('jsonwebtoken');

function authenticate(data, accept) {
    var token;
    var req = data.request || data;

    //get the token from query string
    if (req._query && req._query.token) {
      token = req._query.token;
    }
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      // fail
      return accept(new Error("unauthorized"));
    }

    jwt.verify(token, 'c27002abbec4e54d7c33b9740675a069', {}, function(err, decoded) {
      if (err) {
        // fail
        return accept(new Error("unauthorized"));
      }

      data.user = decoded;
      accept();
    });
}

function sign(data) {
  return jwt.sign( data, 'c27002abbec4e54d7c33b9740675a069', { expiresInSeconds: 5 });
}

exports.authenticate = authenticate;
exports.sign = sign;