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

          console.log("[" + pair.model + "] " + msg.method + " " + msg.uri);
          switch (msg.method) {
          case "CREATE":
            if (pair.instance == "new") {
              console.log("New " + pair.model + ": " + JSON.stringify(msg.data));
              var object = new model(msg.data);
              object.save(function(err) {
                if (!err) {
                  // try to attach the new object to its parent
                  console.log("Saved");
                  var child = pair.model;
                  pair = pairs.pop();
                  if (pair) {
                    model = mongoose.models[pair.model];
                    model.findById(pair.instance, function( err, doc ) {
                      if (!err && doc && doc[child]) {
                        doc[child].push(object._id);
                        doc.save( function (err) {
                          if (!err) {
                            console.log("Added " + pair.model + "." + child + "[" + object._id + "]");
                          }
                        });
                      }
                    });
                  }
                  notifyAll(child);
                }
              });
            }
            break;
          case "READ":
            // Todo
            break;
          case "UPDATE":
            findByIdAndSave( model, msg.data._id,  msg.data, function(err) {
              if (!err) {
                notifyAll(pair.model);
              }
            });
            break;
          case "DELETE":
            model.findOneAndRemove(msg.data, function(err) {
              if (!err) {
                notifyAll(pair.model);
              }
            });
            break;
          default:
            console.log("Unkown method: " + msg.method);
            break;
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
        notifyOne("teams");
        notifyOne("players");
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
