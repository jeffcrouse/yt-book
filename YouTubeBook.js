var Canvas = require('canvas')
	Font = Canvas.Font
	Image = Canvas.Image

if (!Font)
	throw new Error('Need to compile with font support');


var YouTubeBook = function(info, pages) {
	// Set up the Canvas
	var canvas = new Canvas(693, 594, 'pdf');
	var ctx = canvas.getContext('2d');
	var fontFile = function(name) { return path.join(__dirname, 'fonts', name); }
	var curlygirl = new Font('CurlyGirl', fontFile('JandaCurlygirlPop.ttf'));
	curlygirl.addFace(fontFile('JandaCurlygirlChunky.ttf'), 'bold');
	ctx.addFont(curlygirl);

	var margin = 40;
	var leading = 10;
	var max_width = canvas.width - (margin*2);
	var max_height = canvas.height - (margin*2);

	var drawCentered = function(str, y){
		var x = (canvas.width/2) - (ctx.measureText(str).width/2);
		ctx.fillText(str, x, y);
	}

	var drawTitlePage = function() {
		ctx.fillStyle = '#000000';
		ctx.font = 'bold 24px CurlyGirl';
		var lines = [];
		var line_height = 24;
		info.title.split(":").forEach(function(part){
			var tmp = "";
			part.split(" ").forEach(function(word){
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
			lines.push("");
		});

		var y = 200;
		lines.forEach(function(line){
			drawCentered(line, y);
			y += line_height + leading;
		});

		ctx.font = 'bold 18px CurlyGirl';
		drawCentered("by "+info.uploader, y);
	}

	var drawDescription = function() {
		var lines = [];
		var total_height = 0;
		var line_height = 12;

		ctx.font = '12px CurlyGirl';
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
			lines.push("");
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

		ctx.font = '12px CurlyGirl';
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
		console.log(lines);

		var y = canvas.height - total_height - margin;
		console.log(y);
		lines.forEach(function(line){
			ctx.fillText(line, margin, y);
			y += line_height + leading;
		});

		ctx.font = '8px CurlyGirl';
		ctx.fillStyle = '#FFFFFF';
		var x = canvas.width - ctx.measureText(page.time).width - 10;
		var y = canvas.height - 10;
		ctx.fillText(page.time, x, y);
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

	// Final page
	ctx.font = 'bold 14px CurlyGirl';
	ctx.fillStyle = '#000000';
	drawCentered("created with yt-book", 300);
	ctx.font = 'bold 12px CurlyGirl';
	drawCentered("http://www.jeffcrouse.info/project/yt-book", 320);

	this.save = function(filename) {
		console.log("Saving %s", filename);
		fs.writeFile(filename, canvas.toBuffer());
	}

	// Now make the 1491 x 648 cover

}

module.exports = YouTubeBook;