var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user');


function authenticate(namespace) {
  return function(data, accept) {
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
      return accept(new Error("unauthorized"));
    }

    // Checking token signature + if expired
    jwt.verify(token, config.secret, {}, function(err, decoded) {
      if (err) {
        return accept(new Error("unauthorized"));
      }

      // Retreive user from the database
      User.findById(decoded.id, function( err, user ) {
        if (err) {
          return accept(new Error("unauthorized"));
        }
        
        // Check user security level
        var securityLevels = ["player", "operator", "admin"];
        var namespaceSecurityLevel = securityLevels.indexOf(namespace);
        var userSecurityLevel = securityLevels.indexOf(user.type.toLowerCase());
        if ((namespaceSecurityLevel >= 0) && (namespaceSecurityLevel >=0 )
          && (userSecurityLevel >= namespaceSecurityLevel)) {
          console.log("[" + namespace + "] Access for user: " + user.firstName + " (" + user.type + ") -> granted");
          data.user = user;
          accept();
        } else {
          console.log("[" + namespace + "] Access for user: " + user.firstName + " (" + user.type + ") -> rejected");
          return accept(new Error("unauthorized"));
        }
      });
    });
  }
}

function sign(data) {
  return jwt.sign( data, config.secret, { expiresInSeconds: 5 });
}

exports.authenticate = authenticate;
exports.sign = sign;