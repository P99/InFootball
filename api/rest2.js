
var mongoose = require('mongoose');

/* This file duplicates the code from rest.js */
/* It does exactly the same thing, 
/* was simply apadted to handle HTTP requests */

module.exports = function(req, res, next) {
          var msg = {};
          msg.uri = req.path.slice(6); // Removing '/rest'
          msg.method = req.method;
          msg.data = req.body; // Indefined unsless using body parser

          // Todo: refactoring
          var pairs = parseUri(msg.uri);
          var pair = pairs.pop();
          var model = mongoose.models[pair.model];

          /*
          // Security check namespace
          if (!mongoose.models[pair.model]) {
            console.log("Un-handled model: " + pair.model);
            return;
          }
          if (mongoose.models[pair.model].namespace() != namespace) {
            console.log("Model " + pair.model + " does not belong to namespace " + namespace);
            return;
          }
          */

          msg.status = "ERROR"; // Defaults to error
          console.log("[" + pair.model + "] " + msg.method + " " + msg.uri);
  
          switch (msg.method) {
          case "GET":
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
          default:
            console.log("Unkown method: " + msg.method);
            break;
          }

          function reply(message) {
            if (message.status == "OK") {
              res.json(message.data);
            } else {
              res.status( 404 );
            }
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
