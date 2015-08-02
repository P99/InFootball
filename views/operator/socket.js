(function ( $ ) {

  // Data shared by all rest instances
  var context = {};
  var pending = {};

  // Public interface
  $.rest = function(options) {
    if (!context[options.model]) {
      console.log("First register: " + options.model);
      context[options.model] = {
        'namespace': options.namespace,
        'socket': socketForNamespace(options.namespace),
        'clients': []
      };
    }
    var client = new clientInterface();
    $.extend(client, options);

    context[options.model].clients.push(client);

    return client;
  }

  // Client interface
  function clientInterface() {
    // default values for properties
    this.ref = undefined;
    this.model = "";
    this.type = "";
    this.root = "";

    this.emit = function(method, record) {
      var client = this;
      console.log("[emit] " + method + " " + client.model)
      var token = tokenGen();
      var uri;
      if (typeof record == "string") {
        record = extract(record);
      }
      switch(method) {
      case "CREATE":
        uri = client.model + "/" + "new";
        break;
      case "READ":
        uri = client.model + "/" + "any";
        break;
      case "UPDATE":
      case "DELETE":
      case "JOIN":
        uri = client.model + "/" + record._id;
        break;
      }
      context[client.model].socket.emit('message', { 'method': method, 'uri': client.root + uri, 'token': token, 'data': record });
      console.log("Sending: " + method + " " + (client.root + uri) + " token:" + token + " record: " + record);
      return $.Deferred(function (deferred) {
        pending[token] = { 'promise': deferred, 'client': client };
      });
    };

    // Shortcut to register all actions for jtable
    this.actions = function() {
      // Internal helper
      function jtableAction(param) {
        var client = param;
						  this.listAction = function(postData, options){
								  return client.emit("READ");
						  };
						  this.createAction = function(record) {
								  return client.emit("CREATE", record);
						  };
						  this.updateAction = function(record) {
								  return client.emit("UPDATE", record);
						  },
						  this.deleteAction = function(record){
								  return client.emit("DELETE", record);
						  };
      }
      return new jtableAction(this);
    };
  }

  // Socket handler for each namespace
  // Receiving data for Socket.IO and dispatching to clients
  function namespaceHandler(msg) {
    fixDate(msg.data);
    if (pending[msg.token]) {
      var data = {};
      data["Result"] = msg.status;
      switch (pending[msg.token].client.type) {
      case "jtable":
        if (msg.status == "OK") {
          if (msg.data instanceof Array) {
            data["Records"] = msg.data;
          } else if (msg.data instanceof Object) {
            data["Record"] = msg.data;
          }
        } else {
          data["Message"] = msg.data;
        }
        break;
      case "options":
        console.log("Options");
        if (msg.data.length) {
          data["Options"] = [];
          msg.data.forEach(function(record) {
            data["Options"].push({
              "DisplayText": record.title,
              "Value": record._id
            });
          });
          console.log("Options: " + JSON.stringify(data));
        }
        break;
      }
      pending[msg.token].promise.resolve(data);
    }

    var model = modelLast(msg.uri);
    context[model].clients.forEach(function(client) {
      if (!pending[msg.token] ||
         (pending[msg.token] && (pending[msg.token].client !== client))) {
        switch(client.type) {
        case "jtable":
          if((client.root == "") || (msg.uri.indexOf(client.root) >= 0)) {
            switch (msg.method) {
            case "CREATE":
              client.ref.jtable('addRecord', {record: msg.data, clientOnly: true });
              break;
            case "UPDATE":
              client.ref.jtable('updateRecord', {record: msg.data, clientOnly: true });
              break;
            case "DELETE":
              client.ref.jtable('deleteRecord', {key: msg.data._id, clientOnly: true });
              break;
            }
          }
          break;
        case "options":
          // At this stage we know something has changed
          // But we need the full data anyway
          if (typeof client.ref == "function") {
            client.emit("READ").done(function(data) {
              client.ref(data);
            });
          }
          break;
        default:
          console.log("Client type " + client.type + " not supported");
          break;
        }
      }
    }); // End foreach client

    // cleanup
    if (pending[msg.token]) {
      delete pending[msg.token];
    }
  };

  // Utility
  function socketForNamespace(namespace) {
    console.log("socketForNamespace: " + namespace);
    for (model in context) {
      if ((context[model].namespace == namespace) && (context[model].socket)) {
        console.log("socketForNamespace: " + namespace + " > reuse");
        return context[model].socket;
      }
    }

    console.log("socketForNamespace: " + namespace + " > new");
    var socket = io( document.location.hostname + ':' + port + '/' + namespace);
    socket.on('message', namespaceHandler);
    return socket;
  }

  // Parse URI encoded data into an object
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

  // Retreive the last model name seen in the URI
  function modelLast(uri) {
    var tmp = uri.split("/");
    var len = tmp.length;
    var model = (len % 2) ? tmp[len-1] : tmp[len-2];
    console.log("Model: uri=" + uri + " > " + model);
    return model;
  }

  // Fixing date
  function fixDate(data) {
    if (data) {
      if (data instanceof Array) {
        data.forEach(fix);
      } else {
        fix(data);
      }
    }
    function fix (record) {
      if (record.date) {
        record.date = "/Date(" + Date.parse(record.date) + ")/";
      }
    }
  }

}( jQuery ));