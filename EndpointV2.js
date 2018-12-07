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

        writeStream = fs.createWriteStream('InProgress.txt');
        
        //Pending m3u8
        if (grouping.pending_m3u8_post && (grouping.pending_m3u8_post.length > 0)) {
            for(let element of grouping.pending_m3u8_post){
                writeStream.write('\n' + JSON.stringify(element, null, 2)+'\n\n');
                writeStream.write('Finalizing request.\n\n');
            }

        } else {
            writeStream.write('<<No request waiting to have its playlist generated and pushed.>>\n');

        }

        //Pending check
        if (grouping.pending_check && (grouping.pending_check.length > 0)) {
            for(let element of grouping.pending_check){
                writeStream.write('\n'+JSON.stringify(element, null, 2)+'\n\n');
                
                date = new Date();
                currentTime = date.getTime();
                requestTime = element.requestTime;
                lastUpdated = element.lastUpdated;
                totalSegments = element.totalSegments;
                pushedSegments = element.pushedSegments;

                writeStream.write('Current Time: '+ currentTime + '\n');
                writeStream.write('Request Time: '+ requestTime + '\n');
                writeStream.write('Last Updated: '+ lastUpdated + '\n');
                writeStream.write('Total Segments: '+ totalSegments + '\n');
                writeStream.write('Pushed Segments: '+ pushedSegments + '\n\n');

                //Pending check analytics
                writeStream.write('Time since request was made: '+ (currentTime-requestTime) + ' milliseconds \n');
                writeStream.write('Time since last update: '+ (currentTime-lastUpdated) + ' milliseconds \n');
                writeStream.write('Segments pushed: ' + pushedSegments + '/' + totalSegments + ' = ' + (pushedSegments/totalSegments*100) + '% complete \n'  );
                writeStream.write('Estimated time left: ' + ((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments) + ' milliseconds.\n\n');

                //min and sec 
                if((currentTime-requestTime)>min_in_ms){
                    writeStream.write('Time since request was made: '+ Math.trunc((currentTime-requestTime)/min_in_ms) + ' minutes and '+ Math.round(((currentTime-requestTime)/sec_in_ms)%60) + ' seconds \n');
                }else if((currentTime-requestTime)<=min_in_ms){
                    writeStream.write('Time since request was made: ' + Math.round((currentTime-requestTime)/sec_in_ms) + ' seconds \n')
                }

                if((currentTime-lastUpdated)>min_in_ms){
                    writeStream.write('Time since last update: '+ Math.trunc((currentTime-lastUpdated)/min_in_ms) + ' minutes and '+ Math.round(((currentTime-lastUpdated)/sec_in_ms)%60) + ' seconds \n');
                }else if((currentTime-lastUpdated)<=min_in_ms){
                    writeStream.write('Time since last update: ' + Math.round((currentTime-lastUpdated)/sec_in_ms) + ' seconds \n')
                }
                
                writeStream.write('Segments pushed: ' + pushedSegments + '/' + totalSegments + ' = ' + (pushedSegments/totalSegments*100) + '% complete \n'  );
                
                if(pushedSegments == 0){
                    writeStream.write("<<Estimated time left unavailable, please wait for more progress to be made.>>")
                }else if((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))>min_in_ms){
                    writeStream.write('Estimated time left: '+ Math.trunc((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))/min_in_ms) + ' minutes and '+ Math.round(((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))/sec_in_ms)%60) + ' seconds \n\n');
                }else if((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))<=min_in_ms){
                    writeStream.write('Estimated time left: ' + Math.round((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))/sec_in_ms) + ' seconds \n\n')
                }


            }

        } else {
            writeStream.write('<<No request awaiting check to determine how many segments are left to be pushed.>>\n');

        }

        //Waiting
        if (grouping.waiting && (grouping.waiting.length > 0)) {
            for(let element of grouping.waiting){
                writeStream.write('\n'+JSON.stringify(element, null, 2)+'\n\n');

                date = new Date();
                currentTime = date.getTime();
                requestTime = element.requestTime;
                lastUpdated = element.lastUpdated;
                totalSegments = element.totalSegments;
                pushedSegments = element.pushedSegments;

                writeStream.write('Current Time: '+ currentTime + '\n');
                writeStream.write('Request Time: '+ requestTime + '\n');
                writeStream.write('Last Updated: '+ lastUpdated + '\n');
                writeStream.write('Total Segments: '+ totalSegments + '\n');
                writeStream.write('Pushed Segments: '+ pushedSegments + '\n\n');

                //Waiting analytics
                writeStream.write('Time since request was made: '+ (currentTime-requestTime) + ' milliseconds \n');
                writeStream.write('Time since last update: '+ (currentTime-lastUpdated) + ' milliseconds \n');
                writeStream.write('Segments pushed: ' + pushedSegments + '/' + totalSegments + ' = ' + (pushedSegments/totalSegments*100) + '% complete \n'  );
                writeStream.write('Estimated time left: ' + ((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments) + ' milliseconds.\n\n');

                //min and sec 
                if((currentTime-requestTime)>min_in_ms){
                    writeStream.write('Time since request was made: '+ Math.trunc((currentTime-requestTime)/min_in_ms) + ' minutes and '+ Math.round(((currentTime-requestTime)/sec_in_ms)%60) + ' seconds \n');
                }else if((currentTime-requestTime)<=min_in_ms){
                    writeStream.write('Time since request was made: ' + Math.round((currentTime-requestTime)/sec_in_ms) + ' seconds \n')
                }

                if((currentTime-lastUpdated)>min_in_ms){
                    writeStream.write('Time since last update: '+ Math.trunc((currentTime-lastUpdated)/min_in_ms) + ' minutes and '+ Math.round(((currentTime-lastUpdated)/sec_in_ms)%60) + ' seconds \n');
                }else if((currentTime-lastUpdated)<=min_in_ms){
                    writeStream.write('Time since last update: ' + Math.round((currentTime-lastUpdated)/sec_in_ms) + ' seconds \n')
                }
                
                writeStream.write('Segments pushed: ' + pushedSegments + '/' + totalSegments + ' = ' + (pushedSegments/totalSegments*100) + '% complete \n'  );
                
                if(pushedSegments == 0){
                    writeStream.write("<<Estimated time left unavailable, please wait for more progress to be made.>>")
                }else if((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))>min_in_ms){
                    writeStream.write('Estimated time left: '+ Math.trunc((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))/min_in_ms) + ' minutes and '+ Math.round(((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))/sec_in_ms)%60) + ' seconds \n\n');
                }else if((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))<=min_in_ms){
                    writeStream.write('Estimated time left: ' + Math.round((((currentTime - requestTime)/pushedSegments)*(totalSegments-pushedSegments))/sec_in_ms) + ' seconds \n\n')
                }
                
            }

        } else {
            writeStream.write('<<No request waiting for segments pertaining to its time window to be pushed.>>\n');

        }

        writeStream.end

    })
    .catch(function(error){
        console.log(error);
        console.log(error.message);
    });