
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema({
	 id: String,
	 username: String,
	 password: {type: String, set: createHash},
	 email: String,
	 firstName: String,
	 lastName: String,
  type: String
});

Schema.statics.namespace = function() {
  return "admin";
}

// Generates hash using bCrypt
function createHash(password) {
  console.log("Hash password");
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

module.exports = mongoose.model('User', Schema);
