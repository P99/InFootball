var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
    name: String,
    nationality: String,
    age: Number,
    position: String,
    number: Number,
    photo: String,
    teams: [ObjectId]
});

Schema.statics.namespace = function() {
    return "operator";
}

module.exports = mongoose.model('players', Schema);
