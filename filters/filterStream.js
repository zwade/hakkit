var stream = require("stream")
var util   = require("util")

var coder = function(cfn) {
	this.fn = cfn
	stream.Transform.call(this)
}

util.inherits(coder, stream.Transform)

coder.prototype._transform = function(chunk, encoding, cb) {
	if (typeof chunk == "string") {
		throw Error("Filter passed data of type string, not buffer")
		cb(-1)
	}
	var result = this.fn(chunk)
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

	this.consumingStream.pipe(this.encoderStream)
	this.decoderStream.pipe(this.consumingStream)

	this.combined = this.decoderStream
	var that = this
	this.combined.pipe = function(content) {
		that.encoderStream.pipe(content)
	}

	this.consumedStream.spawn(this.combined)

	return this.consumingStream 
}

module.exports = ioTransform
