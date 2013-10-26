
/**
1. Find videos with captions
https://developers.google.com/youtube/2.0/developers_guide_protocol_api_query_parameters#captionsp
2. Download videos and captions
http://superuser.com/questions/484665/how-to-download-videos-from-youtube-with-subtitles
3. Take stills from video at all of the caption locations
4. Make PDF
http://pdfkit.org/
5. Upload PDF to Blurb
http://www.blurb.com/pdf-to-book
*/


var request = require('request')
	querystring = require('querystring')
	util = require('util')
	exec = require('child_process').exec


var q = "slow loris";
var query = {"q": q, orderby: "published", v: 2, alt: "json", caption: "true"};
var url = "https://gdata.youtube.com/feeds/api/videos?"+querystring.stringify(query);
//console.log(url);
request(url, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var json = JSON.parse(body);
		console.log(json.feed.entry.length+" entries");
		json.feed.entry.forEach(function(entry){
			var link = entry.link[0].href;
			var cmd = util.format('youtube-dl --write-srt --srt-lang en --no-continue --write-info-json "%s"', link);

			exec(cmd, function(err, stdout, stderr){
				if(!err) {
					var regex = /\[download\] Destination: (.+)/
					var result = stdout.match(regex);
					if(result) {
						var video_file = result[1];
						var info_file = result[1]+".info.json";
						var info = require( info_file );
						console.log(video_file);
					}
				}
			}); // exec
		});
	}
})