var Canvas = require('canvas')
	Font = Canvas.Font
	Image = Canvas.Image
	// request = require('request')
	// http = require('http')
	// parse = require('url').parse



if (!Font)
	throw new Error('Need to compile with font support');


var fontName = 'WetinCaroWant';
var mainFont = new Font(fontName,  path.join(__dirname, "fonts", fontName+'.ttf'));
//curlygirl.addFace(fontFile('JandaCurlygirlChunky.ttf'), 'bold');



/**
*
*
*/
var YouTubeBook = function(info, pages, id) {

	var canvas = new Canvas(693, 594, 'pdf');
	var ctx = canvas.getContext('2d');
	ctx.addFont(mainFont);

	var margin = 40;
	var leading = 10;
	var max_width = canvas.width - (margin*2);
	var max_height = canvas.height - (margin*2);
	var sizes = {big: 48, medium: 24, regular: 12, small: 8}

	var drawCentered = function(str, y){
		var x = (canvas.width/2) - (ctx.measureText(str).width/2);
		ctx.fillText(str, x, y);
	}

	var getLines = function(str, split1, split2) {
		var lines = [];
		info.title.split(split1).forEach(function(part){
			var tmp = "";
			part.split(split2).forEach(function(word){
				var tmp2 = tmp + word + " ";
				if(ctx.measureText(tmp2).width < max_width) {
					tmp = tmp2;
				} else {
					lines.push(tmp);
					tmp = word + " ";
				}
			});
			lines.push(tmp);
		});
		return lines;
	}

	var drawTitlePage = function() {
		ctx.fillStyle = '#000000';
		ctx.font = util.format("bold %dpx %s", sizes.big, fontName);
		var lines = getLines(info.title, ":", "");
		info.title.split(":").forEach(function(part){
			var tmp = "";
			part.split(" ").forEach(function(word){
				var tmp2 = tmp + word + " ";
				if(ctx.measureText(tmp2).width < max_width) {
					tmp = tmp2;
				} else {
					lines.push(tmp);
					tmp = word + " ";
				}
			});
			lines.push(tmp);
		});

		var y = 200;
		lines.forEach(function(line){
			drawCentered(line, y);
			y += sizes.big + leading;
		});

		ctx.font = util.format("bold %dpx %s", sizes.medium, fontName);
		drawCentered("by "+info.uploader, y+20);
	}

	var drawDescription = function( ) {
		var lines = [];
		var total_height = 0;
		var line_height = 12;

		ctx.font = util.format("%dpx %s", sizes.regular, fontName);
		info.description.split('\n').forEach(function(paragraph){
			var tmp = "";
			paragraph.split(" ").forEach(function(word){
				var tmp2 = tmp + word + " ";
				if(ctx.measureText(tmp2).width < max_width) {
					tmp = tmp2;
				} else {
					total_height += line_height + leading;
					lines.push(tmp);
					tmp = word + " ";
				}
			});
			lines.push(tmp);
			total_height += line_height + leading;
			//total_height += line_height + leading;
		});

		ctx.fillStyle = '#000000';
		var y = (canvas.height/2)-(total_height/2);
		lines.forEach(function(line){
			ctx.fillText(line, margin, y);
			y += line_height + leading;
		});
	}

	var drawPage = function( page ) {
		//console.log("%s | %s", page.time, page.text);

		image = new Image();
		image.src = page.buf;

		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		ctx.font = util.format("%dpx %s", sizes.medium, fontName);

		var lines = [];
		var total_height = 0;
		var tmp = "";
		var words = page.text.split(/[\s]/g);

		words.forEach(function(word){
			var tmp2 = tmp + word + " ";
			if(ctx.measureText(tmp2).width < max_width) {
				tmp = tmp2;
			} else {
				lines.push(tmp);
				total_height += sizes.medium + leading;
				tmp = word + " ";
			}
		})
		lines.push(tmp);

		var y = canvas.height - total_height - margin;
		y = Math.max(margin, y);
		lines.forEach(function(line){
			ctx.fillStyle = '#000000';
			ctx.fillText(line, margin+2, y+2);
			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(line, margin, y);
			y += sizes.medium + leading;
		});

		ctx.font = util.format("%dpx %s", sizes.small, fontName);
		var x = canvas.width - ctx.measureText(page.time).width - 10;
		var y = canvas.height - 10;

		ctx.fillStyle = '#000000';
		ctx.fillText(page.time, x+1, y+1);

		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(page.time, x, y);
	}

	var drawCreditPage = function( ) {
		ctx.fillStyle = '#000000';
		ctx.font = util.format("%dpx %s", sizes.regular, fontName);
		drawCentered("created with yt-book", 300);

		ctx.font = util.format("%dpx %s", sizes.small, fontName);
		drawCentered("http://www.jeffcrouse.info/project/yt-book", 320);
	}


	// Page 1
	drawTitlePage();
	ctx.addPage()

	// Page 2
	drawDescription();
	ctx.addPage();

	// Inner pages
	pages.forEach(function(page){
		drawPage(page)
		ctx.addPage()
	})
 	
 	// Credit Page
	drawCreditPage( );


	var filename = util.format("%s/%s.pdf", __dirname, id);
	console.log("Saving "+filename);
	fs.writeFile(filename, canvas.toBuffer());

	var makeCover = function() {
		
		var canvas = new Canvas(1390, 594, 'pdf');
		var ctx = canvas.getContext('2d');
		ctx.addFont(mainFont);

		ctx.save();
		ctx.translate(697, 0);

			var image = new Image();
			var n = Math.floor(pages.length/2);
			image.src = pages[n].buf;
			ctx.drawImage(image, 0, 0, 693, 594);
		

			ctx.fillStyle = '#000000';
			ctx.font = util.format("bold %dpx %s", sizes.big, fontName);
			var lines = [];
			var total_height = 0;
			info.title.split(":").forEach(function(part){
				var tmp = "";
				part.split(" ").forEach(function(word){
					var tmp2 = tmp + word + " ";
					if(ctx.measureText(tmp2).width < max_width) {
						tmp = tmp2;
					} else {
						lines.push(tmp);
						tmp = word + " ";
						total_height += sizes.big + leading;
					}
				});
				lines.push(tmp);
				total_height += sizes.big + leading;
			});

			var x = margin;
			var y = canvas.height - total_height - sizes.medium;
			console.log("%s x %s", x, y);
			lines.forEach(function(line){
				ctx.fillStyle = '#000000';
				ctx.fillText(line, x+1, y+1);

				ctx.fillStyle = '#FFFFFF';
				ctx.fillText(line, x, y);
				y += sizes.big + leading;
			});

			var byline = "by "+info.uploader;
			ctx.font = util.format("bold %dpx %s", sizes.medium, fontName);
			ctx.fillStyle = '#000000';
			ctx.fillText(byline, x+1, y+1);

			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(byline, x, y);

		ctx.restore();


		var filename = util.format("%s/%s-cover.pdf", __dirname, id);
		console.log("Saving "+filename);
		fs.writeFile(filename, canvas.toBuffer());

		/*
		var url = parse(info.thumbnail)
		http.get({
			  path: url.pathname + url.search
			, host: url.hostname
		}, function(res){
			var buf = '';
			res.setEncoding('binary');
			res.on('data', function(chunk){ buf += chunk });
			res.on('end', function(){
				var img = new Image();
				img.onload = function() {
					console.log("Thumbnail loaded")
					ctx.drawImage(img, 0, 0, 693, 594);

					var filename = util.format("%s/%s-cover.pdf", __dirname, id);
					console.log("Saving "+filename);
					fs.writeFile(filename, canvas.toBuffer());
				}
				img.onerror = function(err){
					console.log("ERROR LOADING THUMBNAIL: "+err);
				}
				img.src = new Buffer(buf, 'binary');
			});
		});
		*/
		/*
		request(info.thumbnail, function (error, response, body) {
			if (error || response.statusCode != 200)
				throw Error("Couldn't download thumbnail");

			console.log("Response: "+response.statusCode)

			var image = new Image();
			image.dataMode = Image.MODE_MIME | Image.MODE_IMAGE; // Both are tracked
		
			image.onload = function() {
				ctx.drawImage(image, 0, 0, 693, 594);

				drawTitlePage();

				var filename = util.format("%s/%s-cover.pdf", __dirname, id);
				console.log("Saving "+filename);
				fs.writeFile(filename, canvas.toBuffer());
			}
			image.onerror = function(err){
				console.log("ERROR LOADING THUMBNAIL: "+err);
			}

			image.src = new Buffer(body, 'binary');
		})
		*/
		/*
		var thumbnail = util.format("%s/thumbnail.jpg", work_dir);
		var ws = fs.createWriteStream(thumbnail);
		ws.on('error', function(err) { if(err) throw err; });
		request(info.thumbnail).on('end', function(err){
			if (err) throw err;
			fs.readFile(thumbnail, function(err, buf){
				if (err) throw err;

				var image = new Image();
				image.dataMode = Image.MODE_MIME | Image.MODE_IMAGE; // Both are tracked
				image.src = buf;
				img.onload = function(){
					ctx.drawImage(image, 0, 0);

					var filename = util.format("%s/%s-cover.pdf", __dirname, id);
					fs.writeFile(filename, canvas.toBuffer());
				}
			});
		}).pipe(ws);
		*/
	}()

}


module.exports = YouTubeBook;