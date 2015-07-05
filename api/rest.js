var io = require('socket.io');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');

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
            var object = new model();
            for (var key in msg.data) {
              if (key === "password") {
                object[key] = createHash(msg.data[key]);
              } else {
                object[key] = msg.data[key];
              }
            }
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
            model.findOneAndUpdate({_id: msg.data._id}, msg.data, function(err) {
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

        socket.on('join', function(msg) {
          console.log("[" + name + "] user joined");
          notifyOne();
        });

        socket.on('disconnect', function() {
          console.log("[" + name + "] user disconnected");
        });

        // Utility
        var notifyOne = function() {
          model.find({}, function(err, records) {
            if (!err) {
              //handler.connected[id].emit('message', { method: "UPDATE", uri: (name + "s"), data: records });
              socket.emit('message', { method: "UPDATE", uri: (name + "s"), data: records });
            }
          });
        }

        var notifyAll = function() {
          model.find({}, function(err, records) {
            if (!err) {
              handler.emit('message', { method: "UPDATE", uri: (name + "s"), data: records });
            }
          });
        };

        // Generates hash using bCrypt
        var createHash = function(password){
          return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
        };

      }); // End namespace connection

    } // End createNode function
}
