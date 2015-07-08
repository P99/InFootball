var io = require('socket.io');
var mongoose = require('mongoose');

module.exports = function(server) {
    var socketIO = io(server);
    for (var name in mongoose.models) {
      console.log("Mongosse models: " + name);
      var resource = name.toLowerCase();
      var model = mongoose.models[name];
      createNode(resource, model);
    } // End for each Mongoose model

    function createNode(name, model) {
      var handler = socketIO.of(model.namespace());
      handler.on('connection', function (socket) {
        socket.on('message', function(msg) {

          // Todo: refactoring
          var pairs = parseUri(msg.uri);
          var index = 0;
          if (pairs.length) {
            var pair = pairs.pop();
            if (pair.model !== name) {
              return;
            }
          }
          console.log("[" + name + "] " + msg.method + " " + msg.uri);
          switch (msg.method) {
          case "CREATE":
            if (pair.instance == "new") {
              console.log("New " + name + ": " + JSON.stringify(msg.data));
              var object = new model(msg.data);
              object.save(function(err) {
                if (!err) {
                  // try to attach the new object to its parent
                  console.log("Saved");
                  pair = pairs.pop();
                  if (pair) {
                    pair.model = capitalizeFirstLetter(pair.model);
                    mongoose.models[pair.model].findById(pair.instance, function( err, doc ) {
                      if (!err && doc && doc[name]) {
                        doc[name].push(object._id);
                        doc.save( function (err) {
                          if (!err) {
                            console.log("Added " + pair.model + "." + name + "[" + object._id + "]");
                          }
                        });
                      }
                    });
                  }
                  notifyAll();
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
                notifyAll();
              }
            });
            break;
          case "DELETE":
            model.findOneAndRemove(msg.data, function(err) {
              if (!err) {
                notifyAll();
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
        var notifyOne = function() {
          model.find({}, function(err, records) {
            if (!err) {
              //handler.connected[id].emit('message', { method: "UPDATE", uri: (name + "s"), data: records });
              socket.emit('message', { method: "UPDATE", uri: name, data: records });
            }
          });
        }

        var notifyAll = function() {
          model.find({}, function(err, records) {
            if (!err) {
              handler.emit('message', { method: "UPDATE", uri: name, data: records });
            }
          });
        };

        var capitalizeFirstLetter = function(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // socket just joined
        notifyOne();
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
