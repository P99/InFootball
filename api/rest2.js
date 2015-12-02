
var mongoose = require('mongoose');
var Q = require('q');

/* This file duplicates the code from rest.js */
/* It does exactly the same thing, 
/* was simply adapted to handle HTTP requests */
/* Todo: Merge back the two files + restore security  */

module.exports = function(req, res, next) {

          var msg = parseRequest(req);
          var pairs = splitQuery(msg.uri);
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
              if (msg.query["recurse"] == "true") {
                console.log("Before findRecurse");
                findRecurse(pair.model, pair.instance, function (doc) {
                  reply({ status: "OK", data: doc });
                });
              }
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

  function findRecurse(name, id, next) {
      var depth = 0;
      var stack = [];
      var model = mongoose.models[name];

      var promise = model.findOne({_id: id}, function(err, doc) {
        populate(doc).then(function(result) {
          next(doc);
        }, function(error) {
          // Debug Me: We alawys go through there?? why?
          next(doc);
        });
      });

      function populate(doc) {
          depth++;
          var chain = [];

          if (doc instanceof Array) {
            doc = doc.pop();
          }
          console.log("[" + depth + "] populate: " + JSON.stringify(doc));

          if (stack.length) {
            while (stack.length) {
              var key = stack.pop();
              if (doc[key] && !(doc[key] instanceof Array)) {
                console.log("[" + depth + "] stack: " + key + " subdoc: " + doc[key]);
                chain.push(populate(doc[key]));
              }
            }
          } else {
            for (var key in doc.schema.paths) {
              var obj = doc.schema.paths[key];
              if (((obj.instance == "ObjectID") && (obj.path != "_id"))
               || ((obj.instance == "Array") && (obj.caster.instance == "ObjectID"))) {
                stack.push(key);
                chain.push(doc.populate(key, null, key).execPopulate());
              }
            }
          }
          if (chain.length) {
            return Q.all(chain).then(populate);
          } else {
            console.log("END");
            return "done";
          }
      }
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

  function splitQuery(uri) {
    var result = [];
    var tokens = uri.split("/");
    var max = tokens.length;
    for (var i=0; i<max; i+=2) {
      result.push({ model: tokens[i], instance: i+1<max ? tokens[i+1] : "any" });
    }
    return result;
  }

  function parseRequest(request) {
    var msg = {};
    msg.query = request.query;
    msg.uri = request.path.slice(6); // Removing '/rest'
    msg.method = request.method;
    msg.data = request.body; // Undefined unsless using body parser
    return msg;
  }
