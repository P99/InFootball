
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
  caption: String,
  type: String,
  status: String,
  difficulty: Number,
  contexts: [ObjectId],
  answers: [ObjectId]
});

Schema.statics.namespace = function() {
  return "operator";
}

module.exports = mongoose.model('questions', Schema);
