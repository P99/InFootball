var mongoose = require('mongoose');

module.exports = mongoose.model('Template',{
	title: String,
	author: String,
	date: { type: Date },
	teams: [String],
	contexts: [String]
});