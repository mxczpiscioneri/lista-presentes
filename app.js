var express = require('express');
var app = express();


// Config
app.use(express.static(__dirname + '/public'));
app.get('/*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});


// Server
app.listen(process.env.PORT || 8080, function() {
	console.log('App listening on port 8080!');
});
