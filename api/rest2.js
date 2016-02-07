var mongoose = require('mongoose');
var Q = require('q');

/* This file duplicates the code from rest.js */
/* It was simply adapted to handle HTTP requests */
/* Todo: Merge back the two files  */

module.exports = function(req, res, next) {

    var msg = parseRequest(req);
    var pairs = splitQuery(msg.uri);
    var pair = pairs.pop();
    var model = mongoose.models[pair.model];

    msg.status = "ERROR"; // Defaults to error
    console.log("[" + pair.model + "] " + msg.method + " " + msg.uri);

    // Security check namespace
    if ((mongoose.models[pair.model].namespace() != "operator") || (["operator", "admin"].indexOf(req.user.type.toLowerCase()) < 0)) {
        console.log("Security error");
        reply(msg);
        return;
    }

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
                    model.findOne(buildQuery(pair.instance), function(err, doc) {
                        if (!err && doc && doc[child]) {
                            model = mongoose.models[child];
                            model.find({
                                _id: {
                                    $in: doc[child]
                                }
                            }, function(err, children) {
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
                    findRecurse(pair.model, pair.instance, function(doc) {
                        reply({
                            status: "OK",
                            data: doc
                        });
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
            res.status(404);
        }
    }

};

function findRecurse(name, id, next) {
    var depth = 0;
    var stack = [];
    var model = mongoose.models[name];

    var promise = model.findOne({
        _id: id
    }, function(err, doc) {
        populate(doc, true).then(function(result) {
            console.log("findRecurse SUCCESS");
            next(doc);
        }, function(error) {
            console.log("findRecurse ERROR");
            next(doc);
        });
    });

    function populate(doc, self) {
        depth++;
        var chain = [];
        var objects = [];

        //console.log("[" + depth + "] populate " + (self ? "self" : "") + " : " + JSON.stringify(doc));

        if (stack.length) {
            // Unstack all pending operations
            stack.forEach(function(op) {
                objects.push(op.subtree[op.branch]);
            });
            stack = []; // empty stack before next recursion
            objects.forEach(function(item) {
                chain.push(populate(item, true));
            });
        } else {

            if (doc instanceof Array) {
                objects = self ? doc : doc.slice(0, 1);
            } else {
                objects.push(doc);
            }

            objects.forEach(function(doc) {
                if (doc.populated) { // end of recursion return just "done"
                    for (var key in doc.schema.paths) {
                        var obj = doc.schema.paths[key];
                        if (((obj.instance == "ObjectID") && (obj.path != "_id")) || ((obj.instance == "Array") && (obj.caster.instance == "ObjectID") && (doc[key].length))) {
                            if (mongoose.models[key]) {
                                chain.push(doc.populate(key, null, key).execPopulate());
                                stack.push({
                                    subtree: doc,
                                    branch: key
                                });
                            }
                        }
                    }
                }
            });
        }
        if (chain.length) {
            return Q.all(chain).then(populate);
        } else {
            return "done";
        }
    }
}

function buildQuery(instance) {
    var query;
    if (instance.length < 12) {
        query = {
            title: instance
        };
    } else {
        query = {
            _id: instance
        };
    }
    return query;
}

function splitQuery(uri) {
    var result = [];
    var tokens = uri.split("/");
    var max = tokens.length;
    for (var i = 0; i < max; i += 2) {
        result.push({
            model: tokens[i],
            instance: i + 1 < max ? tokens[i + 1] : "any"
        });
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
