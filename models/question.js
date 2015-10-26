
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
  caption: String,
  type: String,
  status: String,
  difficulty: Number,
  context: ObjectId,
  subcontext: ObjectId,
  answers: [String]
});

Schema.statics.namespace = function() {
  return "operator";
}

Schema.statics.containsMetadata = function (question) {
  if (question.caption.indexOf("href=") >= 0) {
    return true;
  }
  return question.answers.some(function(item) {
    if (item.indexOf("href=") >= 0) {
      return true;
    }
    return false;
  });
}

module.exports = mongoose.model('questions', Schema);
