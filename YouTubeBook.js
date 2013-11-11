var Canvas = require('canvas')
	Font = Canvas.Font
	Image = Canvas.Image

if (!Font)
	throw new Error('Need to compile with font support');

/**
*
*
*/
var YouTubeBook = function(info, pages) {

	var pages = new YouTubeBookPages(info, pages);
	var cover = new YouTubeBookCover(info, pages);

	this.save = function(pagesFilename, coverFilename) {
		console.log("Saving %s and %s", pagesFilename, coverFilename);
		pages.save(pagesFilename);
		cover.save(coverFilename);
	}
}

/**
*
*
*/
var YouTubeBookCover = function(info, pages) {

	var canvas = new Canvas(1491, 648, 'pdf');
	var ctx = canvas.getContext('2d');


	this.save = function(filename) {
		console.log("Saving %s", filename);
		fs.writeFile(filename, canvas.toBuffer());
	}
}

/**
*
*
*/
var YouTubeBookPages = function(info, pages) {

	var canvas = new Canvas(693, 594, 'pdf');
	var ctx = canvas.getContext('2d');
	var fontFile = function(name) { 
		return path.join(__dirname, 'fonts', name); 
	}

	var fontName = 'WetinCaroWant';
	var mainFont = new Font(fontName, fontFile('WetinCaroWant.ttf'));
	//curlygirl.addFace(fontFile('JandaCurlygirlChunky.ttf'), 'bold');
	ctx.addFont(mainFont);

	var margin = 40;
	var leading = 10;
	var max_width = canvas.width - (margin*2);
	var max_height = canvas.height - (margin*2);
	var sizes = {big: 24, medium: 18, regular: 12, small: 8}

	var drawCentered = function(str, y){
		var x = (canvas.width/2) - (ctx.measureText(str).width/2);
		ctx.fillText(str, x, y);
	}

	var drawTitlePage = function() {
		ctx.fillStyle = '#000000';

		ctx.font = util.format("bold %dpx, %s", sizes.big, fontName);
		var lines = [];
		
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

		ctx.font = util.format("bold %dpx, %s", sizes.medium, fontName);
		drawCentered("by "+info.uploader, y+20);
	}

	var drawDescription = function() {
		var lines = [];
		var total_height = 0;
		var line_height = 12;

		ctx.font = util.format("%dpx %s", size.regular, fontName);
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

	var drawPage = function(page) {
		console.log("%s | %s", page.time, page.text);

		image = new Image();
		image.src = page.buf;

		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		ctx.font = util.format("bold %dpx, %s", sizes.medium, fontName);
		ctx.fillStyle = '#FFFFFF';
		var lines = [];
		var total_height = 0;
		var line_height = 12;
		var tmp = "";
		var words = page.text.split(/[\s]/g);

		words.forEach(function(word){
			var tmp2 = tmp + word + " ";
			if(ctx.measureText(tmp2).width < max_width) {
				tmp = tmp2;
			} else {
				lines.push(tmp);
				total_height += line_height + leading;
				tmp = word + " ";
			}
		})
		lines.push(tmp);

		var y = canvas.height - total_height - margin;
		y = Math.max(margin, y);
		lines.forEach(function(line){
			if(y < max_height) {
				ctx.fillText(line, margin, y);
				y += line_height + leading;
			}
		});

		ctx.font = util.format("bold %dpx, %s", sizes.small, fontName);
		ctx.fillStyle = '#FFFFFF';
		var x = canvas.width - ctx.measureText(page.time).width - 10;
		var y = canvas.height - 10;
		ctx.fillText(page.time, x, y);
	}

	var drawCreditPage = function() {
		ctx.fillStyle = '#000000';
		ctx.font = util.format("bold %dpx, %s", sizes.regular, fontName);
		drawCentered("created with yt-book", 300);

		ctx.font = util.format("bold %dpx, %s", sizes.small, fontName);
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
	drawCreditPage();


	this.save = function(filename) {
		console.log("Saving %s", filename);
		fs.writeFile(filename, canvas.toBuffer());
	}
}


module.exports = YouTubeBook;