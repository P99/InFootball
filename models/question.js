
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var Schema = mongoose.Schema({
  caption: String,
  type: String,
  status: String,
  difficulty: Number,
  context: ObjectId,
  subcontext: ObjectId,
  answers: {type: [String], 
    set: function(str) { return str.split("|"); }, 
    get: function(array) { return array.join("|"); }
  }
});

// Enable Mongoose getter functions
Schema.set('toObject', { getters: true });
Schema.set('toJSON', { getters: true });

Schema.statics.namespace = function() {
  return "operator";
}

module.exports = mongoose.model('questions', Schema);
