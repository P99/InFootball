var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
    title: String,
    type: String,
    groups: [ObjectId]
});

Schema.statics.namespace = function() {
    return "operator";
}

module.exports = mongoose.model('groups', Schema);
