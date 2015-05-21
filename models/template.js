var mongoose = require('mongoose');

module.exports = mongoose.model('Template',{
	title: String,
	author: String,
	date: { type: Date, default: Date.now },
	teams: [{ name: String}],
	contexts: [{
		name: String,
		subcontexts: [{
			name: String,
			questions: [{
				caption: String,
				answer: String,
				satus: String,
				hot: Boolean
			}],
		}],
	}],
});