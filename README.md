# yt-book
By Jeff Crouse (jeff -at- crouse.cc)

Makes a PDF out of a YouTube video that can be submitted as a ["Standard Landscape 10x8 inches (25x20 cm)"](http://www.blurb.com/make/pdf_to_book/booksize_calculator#book-attributes) on [Blurb.com](http://www.blurb.com/pdf-to-book)

In the tradition of [Aram Bartholl's "Forgot Your Password"](http://datenform.de/forgot-your-password.html), [Michael Mandiberg](https://github.com/mandiberg/printwikipedia) or [Rob Matthews](http://www.labnol.org/internet/wikipedia-printed-book/) printed Wikipedias, [the Library of Congress effort to archive tweets](http://www.cnn.com/2013/01/07/tech/social-media/library-congress-twitter/),  (and likely many others that I am forgetting), I want to create a small collection of cool little children's books out of YouTube videos. I thought that these strange artifacts, when contrasted with the triviality of the videos from which they came, would create a nice effect.  

It turns out that YouTube videos are so varied, unpredictable, and there aren't enough subtitles for this to work how I wanted it to work. With some more attention to detail and care, this could work, but I've put in as much time as I can.  Feel free to try it out, though!

## Requirements
1. ffmpeg
1. python
1. the node-canvas module requires Cairo.  I had some trouble installing it on OSX, [but there are some instructions here](https://github.com/LearnBoost/node-canvas/wiki/Installation---OSX).

## Instructions
1. [Search for a YouTube video that contains captions](http://webapps.stackexchange.com/questions/30496/how-to-search-youtube-for-videos-with-english-subtitles)
1. Note the URL of the video (eg: [http://www.youtube.com/watch?v=x9lCTpbcVn4](http://www.youtube.com/watch?v=x9lCTpbcVn4)
	* It should probably be less than 10 minutes. Long videos take forever to process, and they create super long books.
1. Pass the YouTube URL as the first (and only) argument to the script
	
	```
	./yt-book.js http://www.youtube.com/watch?v=x9lCTpbcVn4
	```
	This will create **x9lCTpbcVn4.pdf** and **x9lCTpbcVn4-cover.pdf**
1. [Upload both PDFs to Blurb](http://www.blurb.com/pdf-to-book)


## How it Works

1. Downloads videos and captions with [youtube-dl](http://rg3.github.io/youtube-dl/)
1. Creates a working directory where all of the intermediate files are stored
1. Parses the subtitles file
1. Loops through all of the subtitles and creates PNG stills at all of the caption timestamps using ffmpeg
1. Construct a PDF using the caption text and the stills ([node-canvas](https://github.com/learnboost/node-canvas))
1. Construct a cover image using random images from the video

## To Do
- Make npm friendly (specify bin in package.json, register with npm)
- I'd like to use "thumbnail" from the info file as the cover image, but I can't, for the life of me, get it to work.  It seems others have had this problem:
	- https://github.com/LearnBoost/node-canvas/issues/254
	- https://github.com/LearnBoost/node-canvas/issues/138
	- https://github.com/LearnBoost/node-canvas/issues/122
