var Canvas = require('canvas')
  , canvas = new Canvas(1024, 768, 'pdf')
  , Font = Canvas.Font
  , ctx = canvas.getContext('2d')
  , fs = require('fs')
  , path = require('path')

if (!Font) {
	throw new Error('Need to compile with font support');
}

var fontFile = function(name) { return path.join(__dirname, 'fonts', name); }
console.log(fontFile('JandaCurlygirlPop.ttf'))
var curlygirl = new Font('CurlyGirl', fontFile('JandaCurlygirlPop.ttf'));
curlygirl.addFace(fontFile('JandaCurlygirlChunky.ttf'), 'bold');
ctx.addFont(curlygirl);

ctx.font = 'bold 50px CurlyGirl';
var message = "Quo Vaids?";
var width = ctx.measureText(message).width;
var x = (1024/2)-(width/2);
ctx.fillText(message, x, 140);

/*
var x, y;

function reset() {
  x = 50;
  y = 80;
}

function h1(str) {
  ctx.font = '22px Helvetica';
  ctx.fillText(str, x, y);
}

function p(str) {
  ctx.font = '10px Arial';
  ctx.fillText(str, x, y += 20);
}

reset();
h1('PDF demo');
p('Multi-page PDF demonstration');
ctx.addPage();

reset();
h1('Page #2');
p('This is the second page');
ctx.addPage();

reset();
h1('Page #3');
p('This is the third page');
*/


fs.writeFile('out.pdf', canvas.toBuffer());
console.log('created out.pdf');
