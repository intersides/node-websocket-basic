/**
 * Created by marcofalsitta on 24/09/14.
 */
var App = function(in_params){

    this.params = {
        host:location.origin.replace(/^http/, 'ws'),
        wsPort:5000,//default values
        httpPort:80,//default values
        baseHost:"localhost",
        unitTest:false
    };
    this.params = $.extend(this.params, in_params);

    this.httpServer = location.origin+":"+this.params.httpPort+"/";

	console.log(this.httpServer);

    this.wsServer = "ws://"+this.params.baseHost+":"+this.params.wsPort+"/";

    console.info(this.httpServer, this.wsServer);

    this.observable = {
        connectionId: null,
        attr2: 'initial value of attr2'
    };

    this.webSocket = null;

};
App.prototype.init = function(){

    this.createAvatar();
    this.bindDomEvents();
    this.bindObservables();

    console.log("app initialized");
};
App.prototype.createAvatar = function(){
    this.$app = $("<div id='app'/>");

    this.$app.prependTo("body");

    if(this.params.unitTest == true){
        this.initTestCommand();
    }
};
App.prototype.bindDomEvents = function(){

};
App.prototype.bindObservables = function(){

    this.observable.watch('connectionId', function() {
        console.info('connectionId changed');
    });
    this.observable.watch('attr2', function() {
        console.info('attr2 changed');
    });


};

App.prototype.initTestCommand = function(){

    var _this = this;

    $("<button id='connectBtn'/>")
        .appendTo("body")
        .text("connect!")
        .on("click", function(){

            _this.connectToServer({}, function(cb_connectionId){
                console.log("*", cb_connectionId);

            })
        });


    $("<button id='testBtn'/>")
        .appendTo("body")
        .text("test me")
        .on("click", function(){
            testTest();
        });

    $("<button id='getBtn'/>")
        .appendTo("body")
        .text("get request")
        .on("click", function(){
            _this.performGet();
        });

    $("<div id='qunit'/>")
        .appendTo("body");

};

App.prototype.performGet = function(){

    $.ajax({
        url:this.httpServer+"A",
        type:"GET",
        beforeSend:function(){
            console.log("about to perform GET request");
        },
        success:function(response){
            console.log(response);
        },
        error:function(error){
            console.error(error);
        },
        complete:function(info){
            console.info("completed request");
        }

    });

};
App.prototype.requestMatch = function(objToMatch, callback){
    var _this = this;


    var waitForConnection = function (callback, interval) {
        if (_this.webSocket.readyState === 1) {
            callback();
        } else {
            setTimeout(function () {
                waitForConnection(callback);
            }, interval);
        }
    };

    waitForConnection(function(){
        _this.webSocket.send(JSON.stringify({
            msgType:"matchRequest",
            msg:{objToMarch:_this.observable.connectionId}
        }));

    }, 1000);


    this.matchingCallback = function(in_obj){
        console.error("matching to match received", in_obj);
        if(callback)
            callback({
                a:_this.observable.connectionId,
                b:in_obj
            });
    };


};

App.prototype.connectToServer = function(in_params, connCallback){
    var _this = this;

    //if host is not provided use the one in the app params (which at least its try to resolve to location.origin)
    var host = typeof in_params.host != "undefined" ? in_params.host : this.params.host;
    var wsHost = typeof in_params.wsHost != "undefined" ? in_params.wsHost : this.params.wsHost;

    this.openConnection(wsHost);
    this.bindSocketEvents();


    this.webSocket.onmessage = function (event) {

        var receivedMsg = JSON.parse(event.data);

        switch(receivedMsg.msgType){

            case "onOpenConnection":

                var connectionId = receivedMsg.msg.connectionId;
                _this.observable.connectionId = connectionId;

                if(connCallback){
                    console.info("sending connectionId back to connectionToServer caller ");
                    connCallback(connectionId);

                }

                break;

            case "onMatchResponse":

                var objToMatch = receivedMsg.msg.connectionId;
//                _this.observable.connectionId = connectionId;

                if(_this.matchingCallback){
                    console.info("sending connectionId back to connectionToServer caller ");
                    _this.matchingCallback(objToMatch);

                }

                break;


            default:
                console.log("default triggered, do something about it");
                break;
        }


    };




};
App.prototype.bindSocketEvents = function(){

    this.webSocket.onclose = function (evt) {
        console.warn("closed connection");
    };
    this.webSocket.onerror = function (evt) {
        console.error("error during web socket connection");
    };

};
App.prototype.openConnection = function(in_host){

    var _this = this;
    this.webSocket = new WebSocket(this.wsServer);

    this.webSocket.onopen = function (evt) {

        console.log("opened");

        _this.webSocket.send({
            msg: "respond to first connection"
        });

    };

};