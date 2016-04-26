var util = require("util")
var stream = require("stream")
var filterStream = require("./filterStream") 

var parseHex = function (digit) {
	if (0x30 <= digit && digit <= 0x39) {
		return digit - 0x30
	}

	if (0x41 <= digit && digit <= 0x46) {
		return (digit - 0x41) + 10
	}

	if (0x61 <= digit && digit <= 0x66) {
		return (digit - 0x61) + 10
	}

	return NaN
}

var hexStream = function(_) {
	filterStream.apply(this, arguments)
}

util.inherits(hexStream, filterStream)

hexStream.prototype.disableEncoder = function(enc) {
	this.enc = enc
}

hexStream.prototype.disableDecoder = function(dec) {
	this.dec = dec
}

hexStream.prototype.encoder = function(chunk) {
	if (this.enc) {
		return chunk
	}
	var out = []
	for (var i = 0; i < chunk.length; i++) {
		var d1 = chunk[i]
		var d2 = chunk[i+1]
		var num = 0

		var t1 = parseHex (d1)
		var t2 = parseHex (d2)

		if (isNaN(t1) || isNaN(t2)) {
			continue
		}

		out.push((t1 << 4) + t2)
		i++
	}
	return new Buffer(out)
}

hexStream.prototype.decoder = function(chunk) {
	if (this.dec) {
		return chunk
	}
	return new Buffer(chunk.toString("hex"))	
}

module.exports = hexStream
