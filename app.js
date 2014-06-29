var util = require('util'),
    twitter = require('twitter');
var twit = new twitter({
    consumer_key: 'tQpRd2JqDWDa1KzCiEYeUqK8e',
    consumer_secret: 'lc11WCphjvjUG85USNgRQyUpNvbwc1vS0nYf7W7vCwVZXTXxOk',
    access_token_key: '176345983-XCxDn6GSHIOqCIvSj7uEU9uXbaDz7HKJq1XB6ogq',
    access_token_secret: '4IEd6MnlkfcYnLOq78JNulIzTxu8LMwmZ7kED3z5Y64YT'
});


var sendtweet = function (text) {
		console.log('tweet: '+text);
		twit
		    .updateStatus(text, function(data, error) {

		    	console.log('TWEET RESPONSE')

		    	console.log(error);
	            console.log(util.inspect(data));
	        });
	};

var searchimages = function (tag, cb) {

		var firstquery = true;	//магия какая то, но колбэк of twit.search вызывается два раза
		twit.search('#'+tag+' filter:images', function(data) {

			if(firstquery)
			{
				firstquery = false;

				var imageslist = [],
					statuses_length = data && data.statuses?data.statuses.length:0;

				if(statuses_length > 0)
				{
					for(var i = 0; i < statuses_length; i++)
					{
						var media = data.statuses[i].entities.media;
						if(media && media.length)
						{
							var imageurl = media[0].media_url;
							console.log(i+':'+statuses_length+' '+util.inspect(imageurl));
							// console.log(imageurl)
							imageslist.push(imageurl);
						}
					}

				};

				cb(imageslist);
			}
		});
	};

var http = require('http');
var io = require('socket.io');
var static = require('node-static');
var file = new static.Server('./public');

var server = http.createServer(function (request, response) {

    request.addListener('end', function () {

        if(request.url == '/')
        {
            file.serveFile('/index.html', 200, {}, request, response);
        }
        else if (request.url === '/getip') { // getip - вернуть IP-адрес и порт
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.end(request.headers.host);
			return;
		} 
        else
        {
            file.serve(request, response, function (e, res) {
                if (e && (e.status === 404)) {
                    file.serveFile('/not-found.html', 404, {}, request, response);
                }
            });
        }


    }).resume();
}).on('error', function (error) {
    console.log(error);
}).listen(3000);

var sockets = io.listen(server)

sockets.on('connection', function (socket) {

  	socket.on('sendtweet', function (data) {
    	sendtweet(data.text);
  	});
  	socket.on('searchimagesbytag', function (data) {
    	searchimages(data.tag, function(imageslist) {
    		socket.emit('founded:images', {list: imageslist});
    	});
  	});
});