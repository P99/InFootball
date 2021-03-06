var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
    title: String,
    author: String,
    date: {
        type: Date
    },
    teams: [ObjectId],
    questions: [ObjectId]
});

Schema.statics.namespace = function() {
    return "operator";
}

module.exports = mongoose.model('templates', Schema);
