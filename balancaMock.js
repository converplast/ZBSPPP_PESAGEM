/* eslint-disable */
function randomExecTime(){
    return parseInt(Math.random()*3000);
}

var http = require("http");
http.createServer(function (req, res) {
  setTimeout(function(){
      res.writeHead(200, {"Content-Type": "text/html"});
      res.writeHead(200, {"Access-Control-Allow-Origin": "*"});
      res.write(""+randomExecTime());
      res.end();
  },randomExecTime());
}).listen(60000);
