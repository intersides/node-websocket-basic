/**
 * Created by marcofalsitta on 24/09/14.
 */

var testTest = function () {

    QUnit.module("connection test");

    QUnit.asyncTest( "at app creation", function( assert ) {

        expect(2);
        QUnit.stop(1);

        var testApp = new App();

        testApp.connectToServer({}, function(cb_connectionId){
            QUnit.stop();
            assert.ok( cb_connectionId != null, "value should not be null" );
            QUnit.start();

        });

        testApp.requestMatch({},function(matchResponse){
            QUnit.stop();
            assert.ok( matchResponse.a == matchResponse.b, "should match" );
            QUnit.start();

        });



    });


};