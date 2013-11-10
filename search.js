#! /usr/bin/env node
/**
*	search.js
*	Search for a YouTube video that contains captions.
*	by Jeff Crouse
*	11-9-2013
*/

var request = require('request')
	querystring = require('querystring')
	util = require('util')
	argv = require('optimist').argv
	S = require('string')

var q = argv._.join(" ");

console.log("========= %s ==========", q);
var base = "https://gdata.youtube.com/feeds/api/videos?";
var query = {"q": q, orderby: "published", v: 2, alt: "json", caption: "true"};
var url = base+querystring.stringify(query);
request(url, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var json = JSON.parse(body);
		console.log(json.feed.entry.length+" entries");
		json.feed.entry.forEach(function(entry){
			var link = entry.link[0].href;
			var title = entry.title["$t"];
			var id = entry["media$group"]["yt$videoid"]["$t"];
			console.log(id, " | ", S(title).truncate(60).s);
		});
	}
});