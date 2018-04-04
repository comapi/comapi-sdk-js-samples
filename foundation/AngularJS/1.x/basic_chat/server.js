var express = require("express");

var app = express();

var http = require('http').Server(app);

app.set('port', (process.env.PORT || 8081));

/**
 * Static route for all other app related files
 */
app.use(express.static(__dirname + '/app'));

http.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
