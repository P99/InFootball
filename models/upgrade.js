var Group = require('./group');

module.exports = function () {
  // Make sure we have a first default group created with title called "context"
  Group.findOne({title: "context"}, function(err, doc) {

    if (err || !doc) {
      // Create the first group upon error (only the first time then)
      var group = new Group({
        title: "context",
        type: "Main"
      });

      group.save(function(err) {
        if (!err) {
          console.log("Creating initial 'context' group");
        }
      });
    }
  });
}
