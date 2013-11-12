#! /usr/bin/env node
/**
*	yt-book.js
*	Create a PDF book out of a subtitled YouTube video
*	by Jeff Crouse
*	11-9-2013
*/

var request = util = require('util')
	exec = require('child_process').exec
	path = require('path')
	fs = require('fs')
	parser = require("./subtitles-parser.js")
	async = require('async')
	argv = require('optimist').argv
	glob = require("glob")
	mime = require('mime')
	youtubedl = require('youtube-dl')
	YouTubeBook = require('./YouTubeBook')


// Examine the YouTube URL passed in by user
var link = argv._.pop();
var regex = new RegExp("(https?://)?(?:w+\.)?youtu(?:\.be|be\.com)/(?:watch\\?v=)?([a-zA-Z0-9-_]{11})", "i")
var matches = link.match( regex );
if(!matches)
	throw new Error("Not a valid YouTube url.")

// Create a working directory
var id = matches[2];
var work_dir = util.format("%s/%s", __dirname, id);
console.log("Working Directory: %s", work_dir);
if(!fs.existsSync(work_dir)) 
	fs.mkdirSync(work_dir);


// Download the video
var youtube_dl = util.format("%s/bin/youtube-dl", __dirname);
var cmd = util.format('%s --continue --write-sub --sub-lang en --write-info-json -o "%s/video.%(ext)s" "%s"', youtube_dl, work_dir, link);
console.log("Downloading %s", id);
exec(cmd, function(err, stdout, stderr){
	if(err)
		throw new Error("Video download failed")
	if(!fs.existsSync(work_dir+"/video.en.srt"))
		throw new Error("Subtitles file not found.")

	var glob_patt = util.format("%s/video.*", work_dir);
	glob(glob_patt, function (err, files) {
		if(err) 
			throw new Error("Couldn't perform glob");

		var video_file = null;
		files.forEach(function(file){
			if(mime.lookup(file).indexOf("video")>-1)
				video_file = file;
		});
		if(!video_file)
			throw new Error("Couldn't find video file.");

		var info = require( video_file+".info.json" );
		var srt = fs.readFileSync(work_dir+"/video.en.srt").toString();
		var subtitles = parser.fromSrt(srt, false);
		var pages = [];
		async.eachSeries(subtitles, function(item, callback){
			var seek = item.startTime.replace(",", ".");
			var imagefile = util.format("%s/%s.png", work_dir, seek.replace(new RegExp("[:\.]","gm"), "-"));
			var addPage = function(){
				fs.readFile(imagefile, function(err, buf){
					if (err) throw err;
					pages.push( {"buf": buf, "text": item.text, "time": seek} );
					callback();
				});
			}
			fs.exists(imagefile, function(exists){
				if(exists) addPage();
				else {
					console.log("Extracting image: %s", seek);
					var cmd = util.format('ffmpeg -y -i "%s" -r 1 -an -ss %s "%s"', video_file, seek, imagefile);
					exec(cmd, addPage);
				}
			});
		}, function(err){
			if(err) throw err;
			else {
				// Once all content is gathered, pass it to make the book
				new YouTubeBook(info, pages, id); 
			}
		}); // end async.eachSeries
	}); // end glob
}); // exec

