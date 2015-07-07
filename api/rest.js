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
          console.log("[" + name + "] " + msg.method + " " + msg.uri);
          switch (msg.method) {
          case "CREATE":
            console.log("New " + name + ": " + JSON.stringify(msg.data));
            var object = new model(msg.data);
            object.save(function(err) {
              console.log(msg.method + " " + name + ": " + (err?err:"Ok"));
              if (!err) {
                notifyAll();
              }
            });
            break;
          case "READ":
            // Todo
            break;
          case "UPDATE":
            findByIdAndSave( model, msg.data._id,  msg.data, function(err) {
              console.log("findOneAndUpdate: " + msg.data);
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

        // socket just joined
        notifyOne();
      }); // End namespace connection

    } // End createNode function

  // Helper to replace findOneAndUpdate
  // because the setters don't get called otherwise
  function findByIdAndSave( model, id, data, next ){
    model.findById( id, function( err, doc ) {
      if( err ){
        next( err, null );
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
}
