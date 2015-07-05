
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
	 name: String,
	 country: String,
	 coach: String,
	 president: String,
	 stadium: String,
  logo: String,
  players: [ObjectId]
});

Schema.statics.namespace = function() {
  return "operator";
}

module.exports = mongoose.model('Team', Schema);
