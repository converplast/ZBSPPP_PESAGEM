/* eslint-disable */
function randomExecTime(){
    return (Math.random()*40).toFixed(3);
}

var http = require("http");
http.createServer(function (req, res) {
  setTimeout(function(){
      res.writeHead(200, {"Content-Type": "text/html"});
      res.writeHead(200, {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*"});
      res.write((""+randomExecTime()).replace('.',','));
      res.end();
  },randomExecTime());
}).listen(60000, 'localhost');
