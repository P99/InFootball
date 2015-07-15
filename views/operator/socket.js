(function ( $ ) {
  var socket = io( document.location.hostname + ':' + port + '/operator' );
  var context = {
    teams: { root: "" },
    players: { root: "" },
    templates: { root: ""}
  };
  var promises = {};
  socket.on('message', function(msg) {
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
      var ref = $("#" + model);
      if((context[model].root) && (msg.uri.indexOf(context[model].root) >= 0)) {
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
  });
  $.fn.emit = function(_method, _uri, _data) {
    var model = _uri.split("/")[0];
    var _token = token();
    socket.emit('message', { method: _method, uri: context[model].root + _uri, token: _token, data: _data });
    return $.Deferred(function (promise) {
      promises[_token] = promise;
    });
  };
  $.fn.setRoot = function(model, value) {
    context[model].root = value;
  }
  //
  //
  // Utility
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
  function token() {
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