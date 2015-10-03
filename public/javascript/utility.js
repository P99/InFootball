
function webSocketPort() {
  var port;
  if (document.location.hostname.indexOf('rhcloud.com') > 0) {
    if (document.location.protocol == "https:") {
      port = 8443;
    } else {
      port = 8000;
    }
  } else {
    port = 8080;
  }
  return port;
}

function webSocketToken() {
  var ref = document.getElementById("token");
  if (ref.value) {
    return { query: 'token=' + ref.value };
  } 
  return undefined;
}
