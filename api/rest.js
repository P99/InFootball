var io = require('socket.io');
var mongoose = require('mongoose');
var Template = require('../models/template');
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(server) {
    var socketIO = io(server);
    var templateSocket = socketIO.of('/template');
    templateSocket.on('connection', function (socket) {
        socket.on('message', function(msg) {
            var _method = msg.method;
            var _uri = msg.uri;
            var _data = msg.data;
            if ((_method === "CREATE") && (_uri === "templates/new")) {
              console.log("Receiving new template: " + JSON.stringify(_data));
                  console.log("Creating new template");
                  var template = new Template();
                  template.title = _data.title;
                  template.date = _data.date;
                  template.teams = []; // Todo
                  template.contexts = []; // Todo
                  template.author = ""; // Todo
                  template.save(function(err) {
                    if (!err) {
                      console.log("New template saved");
                    } else {
                      console.log("Error creating template: " + err);
                    }
                  });
            } else if ((_method === "UPDATE") && (_uri.indexOf("templates/") == 0)) {
              console.log("Updating template: " + JSON.stringify(_data));
              Template.findOneAndUpdate({_id: _data._id}, _data, function(err) {
                if (!err) {
                  // Dispatch update
                  console.log("Updated");
                  notifyAll();
                }
              });
            } else if ((_method === "DELETE") && (_uri.indexOf("templates/") == 0)) {
														console.log("Deleting template: " + JSON.stringify(_data));
              Template.findOneAndRemove(_data, function(err) {
                if (!err) {
                  // Dispatch update
                  console.log("Deleted");
                  notifyAll();
                }
              });
            }
        });
        socket.on('join', function(msg) {
          notifyOne(socket.id);
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

        // Utility
        var notifyOne = function(id) {
          Template.find({}, function(err, templates) {
            if (!err) {
              console.log("Notify One: " + id );
              templateSocket.connected[id].emit('message', { method: "UPDATE", uri: "templates", data: templates });
            }
          });
        }

        var notifyAll = function() {
          Template.find({}, function(err, templates) {
            if (!err) {
              console.log("Notify All");
              templateSocket.emit('message', { method: "UPDATE", uri: "templates", data: templates });
            }
          });
        };
     });
     var adminSocket = socketIO.of('/admin');
     adminSocket.on('connection', function (socket) {
        socket.on('message', function(msg) {
            var _method = msg.method;
            var _uri = msg.uri;
            var _data = msg.data;
            if ((_method === "CREATE") && (_uri === "users/new")) {
               User.findOne({ 'username' :  _data.username }, function(err, user) {
                 if (err) {
																	 	console.log("Error creating new user");
                 } else if (user) {
                   console.log("User: " + _data.username + " already exists");
                 } else {
                   var user = new User();
                   user.username = _data.username;
                   user.password = createHash(_data.password);
                   user.email = _data.email;
                   user.firstName = _data.firstName;
                   user.lastName = _data.lastName;
                   user.type = _data.type;
                   user.save(function(err, user) {
                     if (!err) {
                       console.log("Created");
                       notifyAll();
                     }
                   });
                 }
               });
            } else if ((_method === "UPDATE") && (_uri.indexOf("users/") == 0)) {
              console.log("Updating user: " + JSON.stringify(_data));
              User.findOneAndUpdate({_id: _data._id}, _data, function(err) {
                if (!err) {
                  // Dispatch update
                  console.log("Updated");
                  notifyAll();
                }
              });
            } else if ((_method === "DELETE") && (_uri.indexOf("users/") == 0)) {
														console.log("Deleting user: " + JSON.stringify(_data));
              User.findOneAndRemove(_data, function(err) {
                if (!err) {
                  // Dispatch update
                  console.log("Deleted");
                  notifyAll();
                }
              });
            }
        });
        socket.on('join', function(msg) {
          notifyOne(socket.id);
        });

        // Utility
        var notifyOne = function(id) {
          User.find({}, function(err, users) {
            if (!err) {
              console.log("Notify One: " + id );
              adminSocket.connected[id].emit('message', { method: "UPDATE", uri: "users", data: users });
            }
          });
        }

        var notifyAll = function() {
          User.find({}, function(err, users) {
            if (!err) {
              console.log("Notify All");
              adminSocket.emit('message', { method: "UPDATE", uri: "users", data: users });
            }
          });
        };

        // Generates hash using bCrypt
        var createHash = function(password){
          return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
        };
    });
}