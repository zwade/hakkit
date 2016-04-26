var util = require("util")
var stream = require("stream")
var filterStream = require("./filterStream") 

var grep = function(_, regex) {
	filterStream.apply(this, arguments)
	this.regex = regex
}

util.inherits(grep, filterStream)

grep.prototype.disableEncoder = function(enc) {
	this.enc = enc
}

grep.prototype.disableDecoder = function(dec) {
	this.dec = dec
}

grep.prototype.encoder = function(chunk) {
	return chunk
}

grep.prototype.decoder = function(chunk) {
	if (this.dec) {
		return chunk
	}
	outbuff = new Buffer(0)
	var str = chunk.toString().split(/\n/g)
	if (this.remn) {
		str[0] = this.remn + str[0]
	}
	for (var i = 0; i < str.length-1; i++) {
		if (str[i].match(this.regex)) {
			outbuff = Buffer.concat([outbuff, new Buffer(str[i]+"\n")])	
		}
	}
	return outbuff	
}

module.exports = grep
