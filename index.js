
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
	path = require('path')
	fs = require('fs')
	parser = require("./subtitles-parser.js")
	async = require('async')


var q = "celebrity";
var query = {"q": q, orderby: "published", v: 2, alt: "json", caption: "true"};
var url = "https://gdata.youtube.com/feeds/api/videos?"+querystring.stringify(query);
//console.log(url);
request(url, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var json = JSON.parse(body);
		console.log(json.feed.entry.length+" entries");
		var entry = json.feed.entry.pop();
		var link = entry.link[0].href;
		var cmd = util.format('youtube-dl --write-srt --srt-lang en --no-continue --write-info-json -o "work/%(id)s.%(ext)s" "%s"', link);

		exec(cmd, function(err, stdout, stderr){
			if(!err) {
				var regex = /\[download\] Destination: (.+)/
				var result = stdout.match(regex);
				if(result) {
					var video_file = __dirname+"/"+result[1];
					var info_file = video_file+".info.json";
					var srt_file = video_file.replace(path.extname(video_file), ".en.srt");
					var info = require( info_file );
					var srt = fs.readFileSync(srt_file).toString();
	
					var data = parser.fromSrt(srt, false);
					for(var i=0; i<data.length; i++) {
						var seek = data[i].startTime.replace(",", ".");
						var output = util.format("%s/work/%d.png", __dirname, i);
						var cmd = util.format('ffmpeg -i "%s" -r 1 -an -ss %s "%s"', video_file, seek, output);
						exec(cmd, function(err, stdout, stderr){
							if(!err) {
								console.log("Created thumbnail!")
							} else {
								console.log("Problem creating thumbnail.")
							}
						});
					}
			
				}
			}
		}); // exec

	}
})