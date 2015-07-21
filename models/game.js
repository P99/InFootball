var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
  title: String,
  start: { type: Date },
  duration: Number,
  status: String,
  template: ObjectId,
  history: [ObjectId]
});

Schema.statics.namespace = function() {
  return "operator";
}

module.exports = mongoose.model('games', Schema);
