const _ = require('lodash');
const fs = require('fs');
const axios  = require('axios');

var url = "http://10.126.140.203:3002/push_to_cloud/events";
var username = "solink-local";
var password = "__connect__";

var date;
var currentTime;
var requestTime;
var lastUpdated;
var totalSegments;
var pushedSegments;
const min_in_ms = 60000;
const sec_in_ms = 1000;

function getPushEvents(){

    axios({	
        method: 'get',
        url: url, 
        auth:
              {
                username: username,
                password: password
              }
        }).then(function(response){
            var data = response.data;
            var grouping = _.groupBy(data,_.property('state'));
    
            //All States
            console.log(JSON.stringify(grouping, null, 2));
            let writeStream = fs.createWriteStream('endpoint.txt');
            writeStream.write(JSON.stringify(grouping, null, 2));
            writeStream.end
    
            //Dones
            writeStream = fs.createWriteStream('dones.txt');
            writeStream.write(JSON.stringify(grouping.done, null, 2));
            writeStream.end
            
            //Errors
            writeStream = fs.createWriteStream('errors.txt');
            writeStream.write(JSON.stringify(grouping.error, null, 2));
            writeStream.end
        })
        .catch(function(error){
            console.log(error);
            console.log(error.message);
        });

}

function analyzePushEvents(){
    
}