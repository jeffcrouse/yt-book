#! /usr/bin/env node
/**
*	yt-book.js
*	Create a PDF book out of a subtitled YouTube video
*	by Jeff Crouse
*	11-9-2013
*/

var request = require('request')
	util = require('util')
	exec = require('child_process').exec
	path = require('path')
	fs = require('fs')
	parser = require("./subtitles-parser.js")
	async = require('async')
	PDFDocument = require('pdfkit')
	argv = require('optimist').argv
	glob = require("glob")
	mime = require('mime')


var link = argv._.pop();
var regex = new RegExp("(https?://)?(?:w+\.)?youtu(?:\.be|be\.com)/(?:watch\\?v=)?([a-zA-Z0-9-]{11})", "i")
var matches = link.match( regex );
if(!matches) {
	console.log("not a valid YouTube url.")
	process.exit();
}

var id = matches[2];
var work_dir = util.format("%s/%s", __dirname, id);
if(!fs.existsSync(work_dir)) {
	fs.mkdirSync(work_dir);
}
console.log("Working Directory: %s", work_dir);

var cmd = util.format('youtube-dl --continue --write-sub --sub-lang en --write-info-json -o "%s/video.%(ext)s" "%s"', work_dir, link);
console.log("Downloading %s", id);
exec(cmd, function(err, stdout, stderr){
	if(!err) {
		if(!fs.existsSync(work_dir+"/video.en.srt")) {
			console.log("Error: Subtitles file not found.")
			process.exit();
		}

		var glob_patt = util.format("%s/video.*", work_dir);
		glob(glob_patt, function (er, files) {
			if(er) {

			} else {
				var video_file = null;
				files.forEach(function(file){
					if(mime.lookup(file).indexOf("video")>-1)
						video_file = file;
				});
				var info = require( video_file+".info.json" );
				console.log("Creating PDF: %s", info.title);

				var doc = new PDFDocument({size: [800, 600]});
				doc.info['Title'] = info.title;
				doc.info['Author'] = info.uploader;			
				doc.font('fonts/JandaCurlygirlChunky.ttf')
					.fontSize(25)
					.text(info.title, 100, 100)

				var srt = fs.readFileSync(work_dir+"/video.en.srt").toString();
				var subtitles = parser.fromSrt(srt, false);
				var page = 1;
				async.eachSeries(subtitles, function(item, callback){

					var seek = item.startTime.replace(",", ".");
					console.log("Extracting image: %s", seek);
					var imagefile = util.format("%s/%d.png", work_dir, page);
					var cmd = util.format('ffmpeg -i "%s" -r 1 -an -ss %s "%s"', video_file, seek, imagefile);
					exec(cmd, function(err, stdout, stderr){
						fs.exists(imagefile, function(exists){
							if(exists) {
								console.log("Adding page %d", page)
								doc.addPage({size: [800, 600], layout: 'landscape'})
									.image(imagefile, 0, 0, {width: 800, height: 600})
										.text(item.text, 20, 400)
								callback();
							} else callback("Problem creating thumbnail.")
						});
					});
					page++;

				}, function(err){
					if(err) {
						console.log(err)
					} else {
						var filename = util.format("%s/book.pdf", work_dir);
						console.log("Saving %s", filename);
						doc.write(filename);
					}
				});
			}
		})
	}
}); // exec