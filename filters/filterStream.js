var stream = require("stream")
var util   = require("util")

var coder = function(cfn) {
	this.fn = cfn
}

util.inherits(coder, stream.Transform)

coder.prototype._transform = function(chunk, encoding, cb) {
	if (typeof chunk == "string") {
		throw Error("Filter passed data of type string, not buffer")
		cb(-1)
	}
	var result = this.cfn(chunk)
	if (typeof chunk == "string") {
		throw Error("Filter returns data of type string, not buffer")
		cb(-1)
	}
	cb(null, result)
}


var ioTransform = function(consumedStream) {
	this.consumedStream = consumedStream

	if (!this.decoder && !this.encoder) {
		throw Error("ioTransform needs an encoder or decoder")
	}
	if (!this.decoder) {
		this.decoder = this.encoder
	} 
	if (!this.encoder) {
		this.encoder = this.decoder
	}

	this.encoderStream = new coder(this.encoder)
	this.decoderStream = new coder(this.decoder)

}

ioTransform.prototype.spawn = function(consumingStream) {
	this.consumingStream = consumingStream

	this.consumedStream.pipe(this.encoderStream)
	//this.encoderStream.pipe(this.consumingStream)

	//this.consumingStream.pipe(this.decoderStream)
	this.decoderStream.pipe(this.consumedStream)

	return this.consumingStream
}

module.exports = ioTransform
