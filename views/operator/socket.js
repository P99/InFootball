(function ( $ ) {
  $.rest = {}; // Create a namespace for this toolkit
  var context = {
    teams: { root: "" },
    players: { root: "" },
    templates: { root: ""}
  };
  var promises = {};

  function namespaceHandler(msg) {
    fixDate(msg.data);
    if (promises[msg.token]) {
      var data = {};
      data["Result"] = "OK";
      if (msg.data instanceof Array) {
        data["Records"] = msg.data;
      } else if (msg.data instanceof Object) {
        data["Record"] = msg.data;
      }
      promises[msg.token].resolve(data);
      delete promises[msg.token];
    }
    else {
      var model = modelLast(msg.uri);
      var ref = context[model].ref;
      if((context[model].root == "") || (msg.uri.indexOf(context[model].root) >= 0)) {
        switch (msg.method) {
        case "CREATE":
          ref.jtable('addRecord', {record: msg.data, clientOnly: true });
          break;
        case "UPDATE":
          ref.jtable('updateRecord', {record: msg.data, clientOnly: true });
          break;
        case "DELETE":
          ref.jtable('deleteRecord', {key: msg.data._id, clientOnly: true });
          break;
        }
      }
    }
  };

  // Begin public functions
  $.rest.register = function(model, namespace) {
    context[model] = { 
      'root': "",
      'socket': socketForNamespace(namespace),
      'namespace': namespace,
      'ref': $('#' + model)
    };
  };

  $.rest.emit = function(method, model, data) {
    var token = tokenGen();
    var uri;
    switch(method) {
    case "CREATE":
      data = extract(data);
      uri = model + "/" + "new";
      break;
    case "READ":
      uri = model + "/" + "any";
      break;
    case "UPDATE":
      data = extract(data);
      uri = model + "/" + data._id;
      break;
    case "DELETE":
      uri = model + "/" + data._id;
      break;
    }
    context[model].socket.emit('message', { 'method': method, 'uri': context[model].root + uri, 'token': token, 'data': data });
    return $.Deferred(function (promise) {
      promises[token] = promise;
    });
  };

  $.rest.actions = function(model) {
    // Internal helper
    function jtableAction(param) {
      var _model = param;
						this.listAction = function(postData, options){
								return $.rest.emit("READ", _model);
						};
						this.createAction = function(data) {
								return $.rest.emit("CREATE", _model, data);
						};
						this.updateAction = function(data) {
								return $.rest.emit("UPDATE", _model, data);
						},
						this.deleteAction = function(data){
								return $.rest.emit("DELETE", _model, data);
						};
    }
    return new jtableAction(model);
  }

  $.rest.setRoot = function(model, value) {
    context[model].root = value;
  }

  // Utility
  function socketForNamespace(namespace) {
    for (model in context) {
      if ((context[model].namespace == namespace) && (context[model].socket)) {
        return context[model].socket;
      }
    }

    var socket = io( document.location.hostname + ':' + port + '/' + namespace);
    socket.on('message', namespaceHandler);
    return socket;
  }

  function extract(uri) {
    var data = {}, token;
    var pairs = uri.split("&");
    var decode = "";
    pairs.forEach( function(key) {
      token = key.split("=");
      data[token[0]] = decodeURIComponent(token[1].replace(/\+/g, " "));
    });
    return data;
  }
  // Generate a random token
  function tokenGen() {
    return Math.random().toString(36).substr(2);
  }
  function modelLast(uri) {
    var tmp = uri.split("/");
    var len = tmp.length;
    var model = (len % 2) ? tmp[len-1] : tmp[len-2];
    console.log("Model: uri=" + uri + " > " + model);
    return model;
  }
  // Fixing date
  function fixDate(data) {
    if (data instanceof Array) {
      data.forEach(fix);
    } else {
      fix(data);
    }
    function fix (record) {
      if (record.date) {
        record.date = "/Date(" + Date.parse(record.date) + ")/";
      }
    }
  }
}( jQuery ));