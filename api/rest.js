var io = require('socket.io');
var mongoose = require('mongoose');
var Template = require('../models/template');
var User = require('../models/user');

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
            if ((_method === "GET") && (_uri === "users")) {
              User.find({}, function(err, users) {
                socketIO.emit('admin', { method: _method, uri: _uri, data: users });
              });
            } else if ((_method === "PUT") && (_uri === "users/new")) {
               var user = new User(_data);
               user.save(function(err,user){
                 if (!err) {
                    _uri = "users/" + user._id; 
                    socketIO.emit('admin', { method: _method, uri: _uri, data: user });
                 }
               });
            } else if ((_method === "DELETE") && (_uri.indexOf("users/") == 0)) {
														console.log("Deleting user: " + JSON.stringify(_data));
              User.findOneAndRemove(_data, function(err) {
                if (!err) {
                  // Dispatch update
                  console.log("Deleted");
                }
              });
            }
        });
    });
}