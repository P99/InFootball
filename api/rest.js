var io = require('socket.io');
var mongoose = require('mongoose');

module.exports = function(server) {
    var socketIO = io(server);
    var names = {};
    for (var name in mongoose.models) {
      console.log("Mongosse models: " + name);
      names[mongoose.models[name].namespace()] = true;
    } // End for each Mongoose model
    Object.keys(names).forEach(function(key) {
      console.log("Socket.IO namespaces: " + key);
      createNameSpace(key);
    });

    function createNameSpace(name) {
      var handler = socketIO.of(name);
      handler.on('connection', function (socket) {
        socket.on('message', function(msg) {

          // Todo: refactoring
          var pairs = parseUri(msg.uri);
          var pair = pairs.pop();
          var model = mongoose.models[pair.model];

          // Default to error
          msg.status = "ERROR";

          console.log("[" + pair.model + "] " + msg.method + " " + msg.uri);
          switch (msg.method) {
          case "CREATE":
            if (pair.instance == "new") {
              console.log("New " + pair.model + ": " + JSON.stringify(msg.data));
              var object = new model(msg.data);
              object.save(function(err) {
                if (err) {
                  console.log("err object save");
                  msg.data = "Failed to save " + pair.model;
                } else {
                  // try to attach the new object to its parent
                  console.log("Saved");
                  if (pairs.length) {
                    var child = pair.model;
                    pair = pairs.pop();
                    model = mongoose.models[pair.model];
                    model.findById(pair.instance, function( err, doc ) {
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
                msg.status = "OK";
                msg.data = object;
                reply(msg);
              });
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
																if (pair) {
																		model = mongoose.models[pair.model];
																		model.findById(pair.instance, function( err, doc ) {
																				if (!err && doc && doc[child]) {
																						model = mongoose.models[child];
																						model.find({_id: { $in: doc[child] }}, function( err, children ) {
																								if (!err) {
																										console.log("Players: " + JSON.stringify(children));
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
              }
            } else {
              msg.data = "Invalid uri (should be ending by any)";
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
            break;
          default:
            console.log("Unkown method: " + msg.method);
            break;
          }

          function reply(message) {
												if ((message.status == "OK") && (message.method !== "READ")) {
														console.log("Reply all");
														handler.emit('message', message);
												} else {
														console.log("Reply one");
														socket.emit('message', message);
												}
          }

        }); // End handling 'message' event

        socket.on('disconnect', function() {
          console.log("[" + name + "] user disconnected");
        });

        // Utility
        var notifyOne = function(name) {
          model = mongoose.models[name];
          model.find({}, function(err, records) {
            if (!err) {
              socket.emit('message', { method: "UPDATE", uri: name, data: records });
            }
          });
        }

        var notifyAll = function(name) {
          model = mongoose.models[name];
          model.find({}, function(err, records) {
            if (!err) {
              handler.emit('message', { method: "UPDATE", uri: name, data: records });
            }
          });
        };

        // socket just joined
        notifyOne("users");
        notifyOne("templates");
      }); // End namespace connection

    } // End createNode function

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

  function parseUri(uri) {
    var result = [];
    var tokens = uri.split("/");
    var max = tokens.length;
    for (var i=0; i<max; i+=2) {
      result.push({ model: tokens[i], instance: i+1<max ? tokens[i+1] : "any" });
    }
    return result;
  }
}
