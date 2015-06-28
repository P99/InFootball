var io = require('socket.io');
var mongoose = require('mongoose');
var Template = require('../models/template');
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(server) {
    var socketIO = io(server);
    socketIO.on('connection', function (socket) {
        console.log('user connected');
        socket.on('template', function(msg){
            var _method = msg.method;
            var _uri = msg.uri;
            var _data = msg.data;
            if ((_method === "GET") && (_uri === "templates/any?schema")) {
              socketIO.emit('template', {method: _method, uri: _uri, data: {title: "", teams:[], contexts: []}});
            } else if ((_method === "PUT") && (_uri === "templates/new")) {
              console.log("Receiving new template: " + JSON.stringify(_data));
              Template.findOne({ 'title' :  _data.title }, function(err, template) {
                if (err) {
																		console.log("Error creating new template");
                } else if (template) {
                  console.log("Template: " + _data.title + " already exists");
                } else {
                  console.log("Creating new template");
                  var newTemplate = new Template();
                  newTemplate.title = _data.title;
                  newTemplate.teams = _data.teams;
                  newTemplate.contexts = _data.contexts;
                  newTemplate.save(function(err) {
                    if (!err) {
                      console.log("New template saved");
                    } else {
                      console.log("Error creating template: " + err);
                    }
                  });
                }
              });
            }
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
        socket.on('admin', function(msg) {
            var _method = msg.method;
            var _uri = msg.uri;
            var _data = msg.data;
            if ((_method === "UPDATE") && (_uri === "users")) {
              notifyAll();
              // TODO: send update to this client only
            } else if ((_method === "CREATE") && (_uri === "users/new")) {
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
    });


    var notifyAll = function() {
      User.find({}, function(err, users) {
        if (!err) {
          console.log("Notify All");
          socketIO.emit('admin', { method: "UPDATE", uri: "users", data: users });
        }
      });
    };

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
}