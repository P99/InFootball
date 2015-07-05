var mongoose = require('mongoose');

var Schema = mongoose.Schema({
	title: String,
	author: String,
	date: { type: Date },
	teams: [String],
	contexts: [String]
});

Schema.statics.namespace = function() {
  return "template";
}

module.exports = mongoose.model('Template', Schema);
