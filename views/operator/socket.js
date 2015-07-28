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
    var client = {
      'ref': options.ref,
      'model': options.model,
      'type': options.type,
      'root': ""
    }
    context[options.model].clients.push(client);

    client.emit = emit;
    client.actions = actions;
    //client.options = options;
    return client;
  }

  function namespaceHandler(msg) {
    fixDate(msg.data);
    if (pending[msg.token]) {
      var data = {};
      data["Result"] = msg.status;
      switch (pending[msg.token].type) {
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
      delete pending[msg.token];
    }
    else {
      var model = modelLast(msg.uri);
      context[model].clients.forEach(function(client) {
        ref = client.ref;
        if((client.root == "") || (msg.uri.indexOf(client.root) >= 0)) {
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
      });
    }
  };

  function emit(method, record) {
    console.log("[emit] " + method + " " + this.model)
    var token = tokenGen();
    var uri;
    if (typeof record == "string") {
      record = extract(record);
    }
    switch(method) {
    case "CREATE":
      uri = this.model + "/" + "new";
      break;
    case "READ":
      uri = this.model + "/" + "any";
      break;
    case "UPDATE":
    case "DELETE":
    case "JOIN":
      uri = this.model + "/" + record._id;
      break;
    }
    context[this.model].socket.emit('message', { 'method': method, 'uri': this.root + uri, 'token': token, 'data': record });
    console.log("Sending: " + method + " " + (this.root + uri) + " token:" + token + " record: " + record);
    return $.Deferred(function (deferred) {
      pending[token] = { promise: deferred, type: "jtable" };
    });
  };

  function actions() {
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
  }

  $.rest.options = function (model) {
    var token = tokenGen();
    //context[this.model].socket.emit('message', { 'method': "READ", 'uri': this.model, 'token': token, 'data': null });
    context[model].socket.emit('message', { 'method': "READ", 'uri': model, 'token': token, 'data': null });
    return $.Deferred(function (deferred) {
      pending[token] = { promise: deferred, type: "options" };
    });
  }

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

  function extract(uri) {
    console.log("extract: " + uri);
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