var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var port = process.env.PORT || 5000;

var httpPort = 3001; //port 80 for nodejs need to run as root

var app = express();
    app.use(express.static(__dirname+ "/../"));
    app.get('/A', function(req, res, next) {
        console.log('receiving get request');
		res.send("A responded");
    });
    app.listen(httpPort); //port 80 need to run as root

    console.log("app listening on %d ", httpPort);


var server = http.createServer(app);
    server.listen(port);

console.log("http server listening on %d", port);

var userId;
var wss = new WebSocketServer({server: server});
    wss.on("connection", function (ws) {

        console.info("websocket connection open");

        var timestamp = new Date().getTime();
        userId = timestamp;

        ws.send(JSON.stringify({msgType:"onOpenConnection", msg:{connectionId:timestamp}}));


        ws.on("message", function (data, flags) {
            console.log("websocket received a message");
            var clientMsg = data;

    //        console.log(clientMsg.msg.objToMatch);

            ws.send(JSON.stringify({msgType:"onMatchResponse", msg:{connectionId:userId}}));

            //onMatchResponse

        });

        ws.on("close", function () {
            console.log("websocket connection close");
    //        clearInterval(id);
        });
    });
console.log("websocket server created");
