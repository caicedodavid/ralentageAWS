var AWS = require("aws-sdk");
var http = require("http");
var url = require('url');
var fs = require('fs');

AWS.config.update({
  region: "us-east-1"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient()
hostname = 'agent.ralentage.com';

if (process.argv.length > 2)
  hostname = process.argv[2];

console.log("Hostname: " + hostname);

var options = {
  hostname: hostname,
  port: 80,
  path: '/api/devices',
  method: 'GET'
};

function telemetryEvent (device_id, timestamp, key, value) {

  var post_data = JSON.stringify({'device_id': device_id, 'timestamp': timestamp, 'key': key, 'value': value});

  var update_options = {
    hostname: hostname,
    port: 80,
    path: '/api/telemetries',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };

  var update_req = http.request(update_options, (update_res) => {
    update_res.setEncoding('utf8');
    update_res.on('data', (chunk) => {
      console.log('[' + chunk + ']');
    });
    update_res.on('end', () => {
    });
  });

  update_req.on('error', (e) => { 
    console.log(e);
  });

  update_req.write(post_data);
  update_req.end();
}

function movementEvent (device_id, timestamp, type) {

  var post_data = JSON.stringify({'device_id': device_id, 'timestamp': timestamp, 'type': type});

  var update_options = {
    hostname: hostname,
    port: 80,
    path: '/api/movements',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };

  var update_req = http.request(update_options, (update_res) => {
    update_res.setEncoding('utf8');
    update_res.on('data', (chunk) => {
      //console.log('[' + chunk + ']');
    });
    update_res.on('end', () => {
    });
  });

  update_req.on('error', (e) => { });

  update_req.write(post_data);
  update_req.end();
}

function geolocationEvent (device_id, timestamp, latitude, longitude) {

  var post_data = JSON.stringify({'device_id': device_id, 'timestamp': timestamp, 'latitude': latitude, 'longitude': longitude});

  var update_options = {
    hostname: hostname,
    port: 80,
    path: '/api/geolocations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };

  var update_req = http.request(update_options, (update_res) => {
    update_res.setEncoding('utf8');
    update_res.on('data', (chunk) => {
      //console.log('[' + chunk + ']');
    });
    update_res.on('end', () => {
    });
  });

  update_req.on('error', (e) => { });

  update_req.write(post_data);
  update_req.end();
}


function queryEvents (params, device_id, last_timestamp) {
  docClient.query(params, function(err, data) {
            
        if (err) {
        } else {

          var size = data['Items'].length;

          for (var j = 0; j < size; j++) {
            var item = data['Items'][j];
            //console.log (item);
            last_timestamp = item['rttimestamp'];
            last_datestamp = item['rtdatestamp'];

            switch(item['rttype']) {
              case 'gps' :
                console.log(item);
                geolocationEvent(device_id, last_datestamp, item['rtlat'], item['rtlng']);
                break;
              case 'accel':
                console.log(item);
                movementEvent(device_id, last_datestamp, 'fall');
                break;
              case 'cellstrength':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'cellstrength', item['rtstrength']);
                break;
              case 'batterypower':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'batterypower', item['rtpower']);
                break;
	      
              case 'batterycharging':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'batterycharging', item['rtcharging']);
                break;

              case 'wifi':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'wifi', item['rtstatus']+'|'+item['rtssid']+'|'+item['rtipaddress']+'|'+item['rtmacaddress']+'|'+item['rtstrength']);
                break;

              case 'cellular':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'cellular', item['rtstatus']+'|'+item['rtapn']+'|'+item['rtipaddress']+'|'+item['rtmcc']+'|'+item['rtmnc']+'|'+item['rtcellid']+'|'+item['rtlac']+'|'+item['rtisroaming']+'|'+item['rtisflightmode']);
                break;

              case 'sim':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'sim', item['rtstate']+'|'+item['rtoperatorname']+'|'+item['rtmsisdn']+'|'+item['rticcid']+'|'+item['rtmcc']+'|'+item['rtmnc']+'|'+item['rtmsisn']+'|'+item['rtspn']);
                break;
              
              case 'device':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'device', item['rtmodel']+'|'+item['rtmanufacturer']+'|'+item['rtbuildversion']+'|'+item['rtbuilddate']+'|'+item['rtbuildtime']+'|'+item['rtbuildstring']+'|'+item['rtversion']);
                break;

              case 'heartrate':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'heartrate', item['rtheartrate']);
                break;

              case 'pedometer':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'pedometer',item['rtstepstatus']+'|'+item['rtspeed']+'|'+item['rtwalkingfrequency']+'|'+item['rtaccumulativedistance']+'|'+item['rtaccumulativecalorie']+'|'+item['rtaccumulativetotalstepcount']+'|'+item['rtaccumulativewalkstepcount']+'|'+item['rtaccumulativerunstepcount']);
                telemetryEvent(device_id, last_datestamp, 'steps', item['rtaccumulativetotalstepcount']);
                telemetryEvent(device_id, last_datestamp, 'calories', item['rtaccumulativecalorie']);
                break;

              case 'help':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'help', 'clicked');
                break;
              case 'awake':
                console.log(item);
                telemetryEvent(device_id, last_datestamp, 'awake', 'ok');
                break;
              case 'movement':
                console.log(item);
                movementEvent(device_id, last_datestamp, 'general');
                break;

            }
          }

          var post_data = JSON.stringify({'last_timestamp': last_timestamp});

          var update_options = {
            hostname: hostname,
            port: 80,
            path: '/api/devices/' + device_id,
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(post_data)
            }
          };

          var update_req = http.request(update_options, (update_res) => {
            update_res.setEncoding('utf8');
            update_res.on('data', (chunk) => {
            });
            update_res.on('end', () => {
            });
          });

          update_req.on('error', (e) => {
          });

          update_req.write(post_data);
          update_req.end();

        }
      });
}

function main () {

var req = http.request(options, (res) => {
  
  var payload="";;
  
  res.setEncoding('utf8');

  res.on('data', (chunk) => {
    payload = payload + chunk;
  });

  res.on('end', () => {
    
    //console.log(payload);

    var devices = JSON.parse (payload);

    for(var i = 0; i < devices.length; i++) {

      var params = {
        TableName:"RalentageEvents",
        KeyConditionExpression:"rtdevice = :rtdevice and rttimestamp > :rttimestamp",
        ExpressionAttributeValues: {
          ":rtdevice": devices[i]['GUID'],
          ":rttimestamp": devices[i]['last_timestamp']
        },
        Limit: 50
      }

      var device_id = devices[i]['id'];
      var last_timestamp = devices[i]['last_timestamp'];

      console.log (device_id + "," + last_timestamp);

      queryEvents (params, device_id, last_timestamp);
    }
  });

  req.on('error', (e) => {
  });

});

req.end();
}


(function myLoop (i) {          
   setTimeout(function () {   
      main();
      if (--i) myLoop(i);
   }, 3000)
})(10000000); 

