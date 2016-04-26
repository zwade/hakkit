var util = require("util")
var stream = require("stream")
var filterStream = require("./filterStream") 

var XORStream = function(_, key, cont) {
	filterStream.apply(this, arguments)
	this.key = key
	if (!(this.key instanceof Buffer)) {
		this.key = new Buffer(this.key) 
	}
	this.indexE = 0
	this.indexD = 0
	this.continuous = cont || false
}

util.inherits(XORStream, filterStream)

XORStream.prototype.disableEncoder = function(enc) {
	this.enc = enc
}

XORStream.prototype.disableDecoder = function(dec) {
	this.dec = dec
}

XORStream.prototype.encoder = function(chunk) {
	for (var i = 0; i < chunk.length; i++) {
		chunk[i] = chunk[i] ^ this.key[this.indexE]
		this.indexE++
		this.indexE %= this.key.length
	}
	return chunk
}

XORStream.prototype.decoder = function(chunk) {
	if (this.continuous) return this.encoder(chunk)
	
	for (var i = 0; i < chunk.length; i++) {
		chunk[i] = chunk[i] ^ this.key[this.indexD]
		this.indexD++
		this.indexD %= this.key.length
	}
	return chunk
}

module.exports = XORStream
