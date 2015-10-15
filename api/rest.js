
var mongoose = require('mongoose');

module.exports = function(namespace, io, socket, msg) {

          // Todo: refactoring
          var pairs = parseUri(msg.uri);
          var pair = pairs.pop();
          var model = mongoose.models[pair.model];

          // Security check namespace
          if (!mongoose.models[pair.model]) {
            console.log("Un-handled model: " + pair.model);
            return;
          }
          if (mongoose.models[pair.model].namespace() != namespace) {
            console.log("Model " + pair.model + " does not belong to namespace " + namespace);
            return;
          }

          msg.status = "ERROR"; // Defaults to error
          console.log("[" + pair.model + "] " + msg.method + " " + msg.uri);
  
          switch (msg.method) {
          case "CREATE":
            if (pair.instance == "new") {
              console.log("New " + pair.model + ": " + JSON.stringify(msg.data));
              var object = new model(msg.data);
              object.save(function(err) {
                if (err) {
                  console.log("err object save: " + JSON.stringify(err));
                  msg.data = "Failed to save " + pair.model;
                } else {
                  msg.status = "OK";
                  msg.data = object;
                  if (pairs.length) {
                    // Attach the new object to its parent
                    var child = pair.model;
                    pair = pairs.pop();
                    model = mongoose.models[pair.model];
                    model.findOne(buildQuery(pair.instance), function( err, doc ) {
                      if (!err && doc && doc[child]) {
                        doc[child].push(object._id);
                        console.log("JSON: " + JSON.stringify(doc));
                        doc.save( function (err) {
                          if (!err) {
                            console.log("Added " + pair.model + "." + child + "[" + object._id + "]");
                          }
                        });
                      }
                    });
                  }
                }
                reply(msg);
              });
            } else {
              msg.data = "Invalid uri (should contain 'new')";
              reply(msg);
            }
            break;
          case "READ":
            if (pair.instance == "any") {
              if (!pairs.length) {
                // root node > dump all the collection
                model.find({}, function(err, docs) {
                  if (!err) {
                    msg.status = "OK";
                    msg.data = docs;
                  }
                  reply(msg);
                });
              } else {
                var child = pair.model;
                pair = pairs.pop();
                model = mongoose.models[pair.model];
                model.findOne(buildQuery(pair.instance), function( err, doc ) {
                  if (!err && doc && doc[child]) {
                    model = mongoose.models[child];
                    model.find({_id: { $in: doc[child] }}, function( err, children ) {
                      if (!err) {
                        msg.status = "OK";
                        msg.data = children;
                      }
                      reply(msg);
                    });
                  } else {
                    msg.data = "Failed to read " + pair.model;
                    reply(msg);
                  }
                });
              }
            } else {
              msg.data = "Invalid uri (should contain 'any')";
              reply(msg);
            }
            break;
          case "UPDATE":
            findByIdAndSave( model, msg.data._id,  msg.data, function(err) {
              if (!err) {
                msg.status = "OK";
              }
              reply(msg);
            });
            break;
          case "DELETE":
            model.findOneAndRemove(msg.data, function(err) {
              if (!err) {
                msg.status = "OK";
              }
              console.log("delete: " + JSON.stringify(msg));
              reply(msg);
            });
            if (pairs.length) {
              // Remove the reference from the parent if any
              var child = pair.model;
              pair = pairs.pop();
              model = mongoose.models[pair.model];
              model.findOne(buildQuery(pair.instance), function( err, doc ) {
                if (!err && doc && doc[child]) {
                  var index = doc[child].indexOf(msg.data._id);
                  if (index >= 0) {
                    console.log("Removing " + child + "/" + msg.data._id + " from " + pair.model + "/" + pair.instance);
                    doc[child].splice(index, 1);
                    doc.save( function (err) {
                      if (!err) {
                        console.log("Removed OK");
                      }
                    });
                  }
                }
              });
            }
            break;
          default:
            console.log("Unkown method: " + msg.method);
            break;
          }

          function reply(message) {
            if ((message.status == "OK") && (message.method !== "READ")) {
              console.log("Reply all");
              socket.broadcast.emit('rest', message);
            } 
            console.log("Reply one");
            socket.emit('rest', message);
          }

        };

  // Helper to replace findOneAndUpdate
  // because the setters don't get called otherwise
  function findByIdAndSave( model, id, data, next ){
    model.findById( id, function( err, doc ) {
      if( err ){
        next( err );
      } else {
        if(! doc ){
          next( new Error("Object to save not found"), null );
        } else {
          // There must be a better way of doing this
          for( var k in data ){
            doc[k] = data[k];
          }
          doc.save( next );
        }
      }
    });
  }

  function buildQuery(instance) {
    var query;
    if (instance.length < 12) {
      query = { title: instance };
    } else {
      query = { _id: instance };
    }
    return query;
  }

  function parseUri(uri) {
    var result = [];
    var tokens = uri.split("/");
    var max = tokens.length;
    for (var i=0; i<max; i+=2) {
      result.push({ model: tokens[i], instance: i+1<max ? tokens[i+1] : "any" });
    }
    return result;
  }
