var AWS = require("aws-sdk");
var http = require("http");
var url = require('url');
var fs = require('fs');

AWS.config.update({
  region: "us-east-1"
});

hostname = 'agent.ralentage.com';

if (process.argv.length > 2)
  hostname = process.argv[2];


function checkalert (alert_id) {

  var options = {
    hostname: hostname,
    port: 80,
    path: '/api/alerts/checkalert?alert_id='+alert_id,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log(options);

  var req = http.request(options, (res) => {

    var payload = "";

    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      payload = payload + chunk;
    });

    res.on('end', () => {
      console.log(payload);
    });

  });

  req.on('error', (e) => { });

  req.end();
}


function main () {

  var options = {
    hostname: hostname,
    port: 80,
    path: '/api/alerts',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(options, (res) => {

    var payload = "";

    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      payload = payload + chunk;
    });

    res.on('end', () => {
      var alerts = JSON.parse (payload);
      for(var i = 0; i < alerts.length; i++) {
        checkalert(alerts[i]['id']);
      }
    });
  });

  req.on('error', (e) => { });

  req.end();
}

(function myLoop (i) {          
   setTimeout(function () {   
      main();
      if (--i) myLoop(i);
   }, 3000)
})(10000000); 

