
var mongoose = require('mongoose');

var Schema = mongoose.Schema({
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String,
 type: String
});

Schema.statics.namespace = function() {
  return "admin";
}

module.exports = mongoose.model('User', Schema);
