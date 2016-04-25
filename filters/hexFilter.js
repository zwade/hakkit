var util = require("util")
var stream = require("stream")
var filterStream = require("./filterStream") 

var hexStream = function() {
	filterStream.apply(this, arguments)
}

util.inherits(hexStream, filterStream)

hexStream.prototype.encoder = function(chunk) {
	//This is proof of concept. There are much better ways of doing this
	return Buffer.from(chunk.toString("ascii"), "hex")
}

hexStream.prototype.decoder = function(chunk) {
	//Again, this is purely proof of concept. Please don't do this in real life
	return new Buffer(chunk.toString("hex"))	
}

module.exports = hexStream
