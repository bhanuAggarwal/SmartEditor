var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function(req, res){
  res.render('/index.html');
});
var playercount=0;
io.on('connection', function (socket) {
	console.log("Connect");

	socket.on('imageUploaded', function(data){
		//console.log(data.image);
		io.emit("draw", {d : data});	
		
	});

	socket.on('filter', function(data){
		console.log(data.filter);
		io.emit('addFilter', {filter : data.filter});

	});

	socket.on('saveImage', function(){
		io.emit('saveImageClient');
	});

	socket.on('blur', function(data){
		io.emit('blurResponse' , {brightness : data.brightness, blur : data.blur});
	});

	socket.on('advance' , function(data){
		io.emit('advanceResponse' , data);
	});

	socket.on('addFilterVoice' , function(data){
		io.emit('addFilterVoiceResponse' , {type : data.type});
	});
	});
server.listen(8080);
console.log("Multiplayer app listening on port 8080");